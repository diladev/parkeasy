import { randomBytes, randomUUID } from 'crypto';

import {
    CreatePaymentRequest,
    PaymentGateway,
    ProviderPayment,
    ProviderPaymentStatus,
} from './payment-gateway';

interface MockPayment {
    amount: number;
    validUntil: Date;
    state: ProviderPaymentStatus;
}

/**
 * Stands in for FIB (First Iraqi Bank) so the app works without bank
 * credentials. It behaves like the real service: payments start unpaid, the
 * customer approves or declines them (here through approve()/decline(), which
 * the mock endpoints call), and unpaid ones expire.
 *
 * It keeps its payments in memory, as an outside service's state would be out
 * of our database. After a restart its payments are gone, and asking about one
 * answers "expired", the same as an abandoned payment.
 */
export class MockFibGateway implements PaymentGateway {
    readonly name = 'mock';

    private readonly payments = new Map<string, MockPayment>();

    constructor(
        private readonly validityMinutes: number,
        private readonly now: () => Date = () => new Date(),
    ) { }

    createPayment(request: CreatePaymentRequest): Promise<ProviderPayment> {
        const providerPaymentId = randomUUID();
        const validUntil = new Date(this.now().getTime() + this.validityMinutes * 60_000);
        this.payments.set(providerPaymentId, {
            amount: request.amount,
            validUntil,
            state: { status: 'UNPAID' },
        });

        return Promise.resolve({
            providerPaymentId,
            readableCode: MockFibGateway.readableCode(),
            appLink: `parkeasy-mock-fib://pay/${providerPaymentId}`,
            validUntil,
        });
    }

    getStatus(providerPaymentId: string): Promise<ProviderPaymentStatus> {
        const payment = this.payments.get(providerPaymentId);
        if (!payment) {
            return Promise.resolve({ status: 'DECLINED', reason: 'PAYMENT_EXPIRATION' });
        }
        this.expireIfDue(payment);
        return Promise.resolve(payment.state);
    }

    cancel(providerPaymentId: string): Promise<void> {
        const payment = this.payments.get(providerPaymentId);
        if (payment?.state.status === 'UNPAID') {
            payment.state = { status: 'DECLINED', reason: 'PAYMENT_CANCELLATION' };
        }
        return Promise.resolve();
    }

    /** The customer approves the payment in the (pretend) banking app. */
    approve(providerPaymentId: string): ProviderPaymentStatus {
        return this.decide(providerPaymentId, { status: 'PAID', paidAt: this.now() });
    }

    /** The customer declines the payment in the (pretend) banking app. */
    decline(providerPaymentId: string): ProviderPaymentStatus {
        return this.decide(providerPaymentId, { status: 'DECLINED', reason: 'PAYMENT_CANCELLATION' });
    }

    /** Only an unpaid, unexpired payment can be decided; otherwise its state stays. */
    private decide(providerPaymentId: string, outcome: ProviderPaymentStatus): ProviderPaymentStatus {
        const payment = this.payments.get(providerPaymentId);
        if (!payment) return { status: 'DECLINED', reason: 'PAYMENT_EXPIRATION' };

        this.expireIfDue(payment);
        if (payment.state.status === 'UNPAID') payment.state = outcome;
        return payment.state;
    }

    private expireIfDue(payment: MockPayment): void {
        if (payment.state.status === 'UNPAID' && this.now() >= payment.validUntil) {
            payment.state = { status: 'DECLINED', reason: 'PAYMENT_EXPIRATION' };
        }
    }

    /** "PE-4K7Q-M2XD": easy to read aloud, no 0/O or 1/I. */
    private static readableCode(): string {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const bytes = randomBytes(8);
        const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]);
        return `PE-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
    }
}
