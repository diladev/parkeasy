import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleDestroy,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import paymentsConfig from 'src/config/payments';
import { CURRENCY, formatDinars } from 'src/common/money';
import { TranslationService } from 'src/i18n/translation.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Payment } from './entities/payment.entity';
import { PAYMENT_GATEWAY, ProviderPaymentStatus } from './gateway/payment-gateway';
import type { PaymentGateway } from './gateway/payment-gateway';
import { isValidWebhookSignature } from './gateway/webhook-signature';
import { canMoveTo, PaymentStatus } from './payment-status';

/** How often pending payments past their deadline are closed. */
const EXPIRY_SWEEP_INTERVAL_MS = 60 * 1000;

/** What the app sees of a payment. */
export interface PaymentView {
    id: number;
    status: PaymentStatus;
    amount: number;
    currency: string;
    /** Which provider takes it: "mock" means the app shows its test bank. */
    provider: string;
    readable_code: string;
    app_link: string;
    valid_until: Date;
    paid_at: Date | null;
    decline_reason: string | null;
    created_at: Date;
}

/**
 * Wallet top-ups through the payment provider.
 *
 * The wallet is credited in exactly one place, settle(), and only when the
 * provider itself says the payment is PAID. Callbacks, the app checking the
 * status and the expiry sweep all go through settle(), which locks the
 * payment row and only moves a pending payment, so the wallet is credited
 * once however many times the provider calls back.
 */
@Injectable()
export class PaymentsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly config = paymentsConfig();
    private sweepTimer?: NodeJS.Timeout;

    constructor(
        @InjectModel(Payment) private readonly paymentModel: typeof Payment,
        @InjectConnection() private readonly sequelize: Sequelize,
        @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
        private readonly walletService: WalletService,
        private readonly notificationsService: NotificationsService,
        private readonly translationService: TranslationService,
    ) { }

    private t(key: string): string {
        return this.translationService.translate(`message.${key}`);
    }

    // ------------------------------------------------------ expiry sweep

    onModuleInit(): void {
        this.sweepTimer = setInterval(() => {
            this.expireOverduePayments().catch((error: unknown) =>
                this.logger.error('Expiring payments failed', error instanceof Error ? error.stack : String(error)),
            );
        }, EXPIRY_SWEEP_INTERVAL_MS);
        // Don't keep the process alive just for this timer.
        this.sweepTimer.unref();
    }

    onModuleDestroy(): void {
        clearInterval(this.sweepTimer);
    }

    /** Pending payments past their deadline: ask the provider, which reports them expired. */
    async expireOverduePayments(): Promise<void> {
        const overdue = await this.paymentModel.findAll({
            where: { status: 'pending', valid_until: { [Op.lte]: new Date() } },
        });
        for (const payment of overdue) {
            await this.syncWithProvider(payment.id);
        }
    }

    // ------------------------------------------------------ for the app

    async createTopUp(userId: number, amount: number): Promise<PaymentView> {
        const providerPayment = await this.gateway.createPayment({
            amount,
            currency: CURRENCY,
            description: `ParkEasy wallet top-up: ${formatDinars(amount)}`,
        });

        const payment = await this.paymentModel.create({
            user_id: userId,
            purpose: 'WALLET_TOP_UP',
            amount,
            currency: CURRENCY,
            status: 'pending',
            provider: this.gateway.name,
            provider_payment_id: providerPayment.providerPaymentId,
            readable_code: providerPayment.readableCode,
            app_link: providerPayment.appLink,
            valid_until: providerPayment.validUntil,
        });
        return PaymentsService.present(payment);
    }

    /**
     * One of the user's top-ups. While it's pending, the provider is asked
     * first, so the app gets the result even if a callback was lost.
     */
    async getTopUp(userId: number, paymentId: number): Promise<PaymentView> {
        const payment = await this.findUserPayment(userId, paymentId);
        const current = payment.status === 'pending' ? await this.syncWithProvider(payment.id) : payment;
        return PaymentsService.present(current);
    }

    /** The user gives up on a pending top-up. */
    async cancelTopUp(userId: number, paymentId: number): Promise<PaymentView> {
        const payment = await this.findUserPayment(userId, paymentId);
        if (payment.status !== 'pending') {
            throw new BadRequestException(this.t('PAYMENT_NOT_PENDING'));
        }

        await this.gateway.cancel(payment.provider_payment_id);
        // The provider may have been paid just before the cancel: settle by its answer.
        return PaymentsService.present(await this.syncWithProvider(payment.id, 'cancelled'));
    }

    // ------------------------------------------------------ provider callbacks

    /**
     * The provider says a payment changed. The body is only trusted to say
     * which payment: its status is read back from the provider before
     * anything is changed.
     */
    async handleWebhook(rawBody: string, signature: string | undefined): Promise<{ received: true }> {
        if (!isValidWebhookSignature(rawBody, signature, this.config.webhook_secret)) {
            throw new UnauthorizedException(this.t('PAYMENT_WEBHOOK_INVALID'));
        }

        let providerPaymentId: unknown;
        try {
            providerPaymentId = (JSON.parse(rawBody) as { id?: unknown }).id;
        } catch {
            throw new BadRequestException(this.t('PAYMENT_WEBHOOK_INVALID'));
        }
        if (typeof providerPaymentId !== 'string') {
            throw new BadRequestException(this.t('PAYMENT_WEBHOOK_INVALID'));
        }

        const payment = await this.paymentModel.findOne({ where: { provider_payment_id: providerPaymentId } });
        if (!payment) {
            throw new NotFoundException(this.t('PAYMENT_NOT_FOUND'));
        }
        await this.syncWithProvider(payment.id);
        return { received: true };
    }

    // ------------------------------------------------------ settling

    /**
     * Reads the provider's status and settles the payment by it.
     * [unpaidOutcome] is what an UNPAID answer means here: nothing (still
     * waiting) or "cancelled" when the user just cancelled it.
     */
    async syncWithProvider(paymentId: number, unpaidOutcome?: 'cancelled'): Promise<Payment> {
        const payment = await this.paymentModel.findByPk(paymentId, { rejectOnEmpty: true });
        if (payment.status !== 'pending') return payment;

        const providerStatus = await this.gateway.getStatus(payment.provider_payment_id);
        return this.settle(paymentId, providerStatus, unpaidOutcome);
    }

    /**
     * Moves a pending payment to its final status, crediting the wallet if it
     * was paid. Locked and idempotent: a payment that's no longer pending is
     * returned unchanged.
     */
    async settle(
        paymentId: number,
        providerStatus: ProviderPaymentStatus,
        unpaidOutcome?: 'cancelled',
    ): Promise<Payment> {
        return this.sequelize.transaction(async (transaction) => {
            const payment = await this.paymentModel.findByPk(paymentId, {
                transaction,
                lock: Transaction.LOCK.UPDATE,
                rejectOnEmpty: true,
            });

            const next = PaymentsService.nextStatus(payment, providerStatus, unpaidOutcome);
            if (!next || !canMoveTo(payment.status, next)) return payment;

            if (next === 'paid' && providerStatus.status === 'PAID') {
                await payment.update({ status: 'paid', paid_at: providerStatus.paidAt }, { transaction });
                await this.walletService.credit(payment.user_id, payment.amount, 'TOP_UP', null, transaction, payment.id);
                await this.notificationsService.notify(
                    payment.user_id,
                    'WALLET_TOPPED_UP',
                    { amount: formatDinars(payment.amount) },
                    transaction,
                );
                return payment;
            }

            const reason = providerStatus.status === 'DECLINED' ? providerStatus.reason : null;
            await payment.update({ status: next, decline_reason: reason }, { transaction });
            return payment;
        });
    }

    /** The status the provider's answer leads to, or null to leave it pending. */
    static nextStatus(
        payment: Pick<Payment, 'valid_until'>,
        providerStatus: ProviderPaymentStatus,
        unpaidOutcome?: 'cancelled',
        now: Date = new Date(),
    ): PaymentStatus | null {
        switch (providerStatus.status) {
            case 'PAID':
                return 'paid';
            case 'DECLINED':
                if (providerStatus.reason === 'PAYMENT_EXPIRATION') return 'expired';
                // "cancelled" is the user giving up in ParkEasy; refused at the bank is "declined".
                return unpaidOutcome ?? 'declined';
            case 'UNPAID':
                if (unpaidOutcome) return unpaidOutcome;
                return now >= payment.valid_until ? 'expired' : null;
        }
    }

    // ------------------------------------------------------ helpers

    private async findUserPayment(userId: number, paymentId: number): Promise<Payment> {
        // user_id in the query: another user's payment is a 404, not a leak.
        const payment = await this.paymentModel.findOne({ where: { id: paymentId, user_id: userId } });
        if (!payment) {
            throw new NotFoundException(this.t('PAYMENT_NOT_FOUND'));
        }
        return payment;
    }

    static present(payment: Payment): PaymentView {
        return {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            provider: payment.provider,
            readable_code: payment.readable_code,
            app_link: payment.app_link,
            valid_until: payment.valid_until,
            paid_at: payment.paid_at,
            decline_reason: payment.decline_reason,
            created_at: payment.createdAt as Date,
        };
    }
}
