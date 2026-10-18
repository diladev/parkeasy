/**
 * What ParkEasy needs from a payment provider. It follows the shape of FIB's
 * online payments API (create a payment, the customer approves it in their
 * banking app, check its status, cancel it), so a real provider can be added
 * as another implementation without touching the wallet or the app.
 */
export interface PaymentGateway {
    /** For the `provider` column, e.g. "mock". */
    readonly name: string;

    createPayment(request: CreatePaymentRequest): Promise<ProviderPayment>;

    /** The provider's answer is the truth: callbacks only tell us to ask. */
    getStatus(providerPaymentId: string): Promise<ProviderPaymentStatus>;

    /** Stops an unpaid payment from being approved later. */
    cancel(providerPaymentId: string): Promise<void>;
}

/** Injection token for the configured gateway. */
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export interface CreatePaymentRequest {
    /** Whole Iraqi dinars. */
    amount: number;
    currency: 'IQD';
    /** Shown to the customer in their banking app. */
    description: string;
}

/** What the customer needs to approve the payment. */
export interface ProviderPayment {
    providerPaymentId: string;
    /** A short code the customer can type in their banking app. */
    readableCode: string;
    /** Opens the payment in the banking app. */
    appLink: string;
    validUntil: Date;
}

export type ProviderPaymentStatus =
    | { status: 'UNPAID' }
    | { status: 'PAID'; paidAt: Date }
    | { status: 'DECLINED'; reason: DeclineReason };

/** FIB's decline reasons. */
export type DeclineReason = 'SERVER_FAILURE' | 'PAYMENT_EXPIRATION' | 'PAYMENT_CANCELLATION';
