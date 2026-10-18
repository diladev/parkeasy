import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Provider callbacks are signed: the header is "sha256=" plus the
 * HMAC-SHA256 of the exact request body, keyed with PAYMENT_WEBHOOK_SECRET.
 * Without the secret, nobody can forge a "paid" callback.
 */
export const SIGNATURE_HEADER = 'x-parkeasy-signature';

export function signWebhook(body: string, secret: string): string {
    return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

/** Constant-time check, so the comparison doesn't leak how much matched. */
export function isValidWebhookSignature(
    body: string,
    signature: string | undefined,
    secret: string,
): boolean {
    if (!signature) return false;
    const expected = Buffer.from(signWebhook(body, secret));
    const received = Buffer.from(signature);
    return expected.length === received.length && timingSafeEqual(expected, received);
}
