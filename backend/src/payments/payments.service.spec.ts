import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { NotificationsService } from 'src/notifications/notifications.service';
import { TranslationService } from 'src/i18n/translation.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Payment } from './entities/payment.entity';
import { MockFibGateway } from './gateway/mock-fib.gateway';
import { signWebhook } from './gateway/webhook-signature';
import { PaymentsService } from './payments.service';

/** The dev secret config/payments.ts falls back to when none is set. */
const SECRET = 'dev_only_payment_webhook_secret';

type Row = Record<string, unknown> & {
  update(values: Record<string, unknown>): Promise<Row>;
};

/** Just enough of the Payment model, kept in memory. */
class FakePaymentModel {
  rows = new Map<number, Row>();
  private nextId = 1;

  create(values: Record<string, unknown>): Promise<Row> {
    const row: Row = {
      ...values,
      id: this.nextId++,
      paid_at: null,
      decline_reason: null,
      createdAt: new Date(),
      update(changes) {
        Object.assign(this, changes);
        return Promise.resolve(this);
      },
    };
    this.rows.set(row.id as number, row);
    return Promise.resolve(row);
  }

  findByPk(id: number): Promise<Row> {
    const row = this.rows.get(id);
    if (!row) throw new Error(`no payment ${id}`);
    return Promise.resolve(row);
  }

  findOne({ where }: { where: Record<string, unknown> }): Promise<Row | null> {
    const match = [...this.rows.values()].find((row) =>
      Object.entries(where).every(([key, value]) => row[key] === value),
    );
    return Promise.resolve(match ?? null);
  }

  findAll(): Promise<Row[]> {
    return Promise.resolve(
      [...this.rows.values()].filter(
        (row) => row.status === 'pending' && (row.valid_until as Date) <= now,
      ),
    );
  }
}

/**
 * Runs transactions one at a time, standing in for the database's row lock
 * (SELECT ... FOR UPDATE), which makes a second settle() wait for the first.
 */
class FakeSequelize {
  private queue: Promise<unknown> = Promise.resolve();

  transaction<T>(work: (transaction: object) => Promise<T>): Promise<T> {
    const result = this.queue.then(() => work({}));
    this.queue = result.catch(() => undefined);
    return result;
  }
}

let now: Date;

describe('PaymentsService', () => {
  let payments: FakePaymentModel;
  let gateway: MockFibGateway;
  let credits: { userId: number; amount: number; paymentId: number | null }[];
  let notified: string[];
  let service: PaymentsService;

  beforeEach(() => {
    now = new Date();
    payments = new FakePaymentModel();
    gateway = new MockFibGateway(15, () => now);
    credits = [];
    notified = [];

    const wallet = {
      credit: (
        userId: number,
        amount: number,
        _c: string,
        _b: null,
        _t: object,
        paymentId: number | null,
      ) => {
        credits.push({ userId, amount, paymentId });
        return Promise.resolve();
      },
    } as unknown as WalletService;
    const notifications = {
      notify: (_userId: number, event: string) => {
        notified.push(event);
        return Promise.resolve();
      },
    } as unknown as NotificationsService;
    const translation = {
      translate: (key: string) => key,
    } as unknown as TranslationService;

    service = new PaymentsService(
      payments as unknown as typeof Payment,
      new FakeSequelize() as unknown as Sequelize,
      gateway,
      wallet,
      notifications,
      translation,
    );
  });

  const providerId = (paymentId: number) =>
    payments.rows.get(paymentId)!.provider_payment_id as string;
  const callback = (paymentId: number) => {
    const body = JSON.stringify({ id: providerId(paymentId), status: 'PAID' });
    return service.handleWebhook(body, signWebhook(body, SECRET));
  };

  it('starts a pending top-up with the provider details', async () => {
    const view = await service.createTopUp(7, 10_000);

    expect(view).toMatchObject({
      status: 'pending',
      amount: 10_000,
      currency: 'IQD',
    });
    expect(view.readable_code).toMatch(/^PE-/);
    expect(payments.rows.get(view.id)).toMatchObject({
      user_id: 7,
      provider: 'mock',
    });
  });

  it('credits the wallet once the provider says it was paid', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    gateway.approve(providerId(id));

    await callback(id);

    expect(payments.rows.get(id)).toMatchObject({ status: 'paid' });
    expect(credits).toEqual([{ userId: 7, amount: 10_000, paymentId: id }]);
    expect(notified).toEqual(['WALLET_TOPPED_UP']);
  });

  it('credits only once when the provider calls back again and again', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    gateway.approve(providerId(id));

    await callback(id);
    await callback(id);
    await Promise.all([
      callback(id),
      callback(id),
      service.getTopUp(7, id),
      callback(id),
    ]);

    expect(credits).toHaveLength(1);
    expect(notified).toHaveLength(1);
  });

  it('credits only once when callbacks arrive at the same time', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    gateway.approve(providerId(id));

    await Promise.all(Array.from({ length: 10 }, () => callback(id)));

    expect(credits).toHaveLength(1);
  });

  it('does not trust the callback body: an unpaid payment stays pending', async () => {
    const { id } = await service.createTopUp(7, 10_000);

    await callback(id); // says PAID, but the provider still says UNPAID

    expect(payments.rows.get(id)!.status).toBe('pending');
    expect(credits).toHaveLength(0);
  });

  it('refuses a callback without a valid signature', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    gateway.approve(providerId(id));
    const body = JSON.stringify({ id: providerId(id) });

    await expect(service.handleWebhook(body, undefined)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      service.handleWebhook(body, signWebhook(body, 'guessed')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(credits).toHaveLength(0);
  });

  it('picks up a payment whose callback was lost when the app checks it', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    gateway.approve(providerId(id)); // no callback

    await expect(service.getTopUp(7, id)).resolves.toMatchObject({
      status: 'paid',
    });
    expect(credits).toHaveLength(1);
  });

  it("hides another user's top-up", async () => {
    const { id } = await service.createTopUp(7, 10_000);

    await expect(service.getTopUp(8, id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.cancelTopUp(8, id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('records a payment refused at the bank as declined, without credit', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    gateway.decline(providerId(id));

    await callback(id);

    expect(payments.rows.get(id)).toMatchObject({
      status: 'declined',
      decline_reason: 'PAYMENT_CANCELLATION',
    });
    expect(credits).toHaveLength(0);
  });

  it('cancels a pending top-up, which then cannot be paid or cancelled again', async () => {
    const { id } = await service.createTopUp(7, 10_000);

    await expect(service.cancelTopUp(7, id)).resolves.toMatchObject({
      status: 'cancelled',
    });
    gateway.approve(providerId(id));
    await callback(id);

    expect(payments.rows.get(id)!.status).toBe('cancelled');
    expect(credits).toHaveLength(0);
    await expect(service.cancelTopUp(7, id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('expires top-ups nobody paid in time', async () => {
    const { id } = await service.createTopUp(7, 10_000);
    now = new Date(now.getTime() + 16 * 60_000);

    await service.expireOverduePayments();

    expect(payments.rows.get(id)).toMatchObject({
      status: 'expired',
      decline_reason: 'PAYMENT_EXPIRATION',
    });
    expect(credits).toHaveLength(0);
  });
});
