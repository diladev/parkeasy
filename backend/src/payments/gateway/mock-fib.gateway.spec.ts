import { MockFibGateway } from './mock-fib.gateway';

describe('MockFibGateway', () => {
    let now: Date;
    let gateway: MockFibGateway;

    beforeEach(() => {
        now = new Date('2026-01-01T10:00:00Z');
        gateway = new MockFibGateway(15, () => now);
    });

    const create = () => gateway.createPayment({ amount: 10_000, currency: 'IQD', description: 'Top-up' });
    const minutesLater = (minutes: number) => {
        now = new Date(now.getTime() + minutes * 60_000);
    };

    it('creates an unpaid payment with a code, an app link and a deadline', async () => {
        const payment = await create();

        expect(payment.readableCode).toMatch(/^PE-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
        expect(payment.appLink).toBe(`parkeasy-mock-fib://pay/${payment.providerPaymentId}`);
        expect(payment.validUntil).toEqual(new Date('2026-01-01T10:15:00Z'));
        await expect(gateway.getStatus(payment.providerPaymentId)).resolves.toEqual({ status: 'UNPAID' });
    });

    it('reports an approved payment as paid, once and for good', async () => {
        const { providerPaymentId } = await create();

        expect(gateway.approve(providerPaymentId)).toEqual({ status: 'PAID', paidAt: now });
        // Deciding again changes nothing.
        expect(gateway.decline(providerPaymentId).status).toBe('PAID');
        await gateway.cancel(providerPaymentId);
        await expect(gateway.getStatus(providerPaymentId)).resolves.toMatchObject({ status: 'PAID' });
    });

    it('reports a declined payment with the cancellation reason', async () => {
        const { providerPaymentId } = await create();

        gateway.decline(providerPaymentId);
        await expect(gateway.getStatus(providerPaymentId)).resolves.toEqual({
            status: 'DECLINED',
            reason: 'PAYMENT_CANCELLATION',
        });
    });

    it('expires an unpaid payment at its deadline, and then it cannot be paid', async () => {
        const { providerPaymentId } = await create();

        minutesLater(14);
        await expect(gateway.getStatus(providerPaymentId)).resolves.toEqual({ status: 'UNPAID' });
        minutesLater(1);
        expect(gateway.approve(providerPaymentId)).toEqual({ status: 'DECLINED', reason: 'PAYMENT_EXPIRATION' });
    });

    it('answers "expired" for a payment it does not know (e.g. after a restart)', async () => {
        await expect(gateway.getStatus('unknown')).resolves.toEqual({
            status: 'DECLINED',
            reason: 'PAYMENT_EXPIRATION',
        });
    });
});
