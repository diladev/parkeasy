import { isValidWebhookSignature, signWebhook } from './webhook-signature';

describe('webhook signature', () => {
    const secret = 'test-secret';
    const body = '{"id":"abc","status":"PAID"}';

    it('accepts the signature of the exact body', () => {
        expect(isValidWebhookSignature(body, signWebhook(body, secret), secret)).toBe(true);
    });

    it('rejects a missing or malformed signature', () => {
        expect(isValidWebhookSignature(body, undefined, secret)).toBe(false);
        expect(isValidWebhookSignature(body, '', secret)).toBe(false);
        expect(isValidWebhookSignature(body, 'sha256=nothex', secret)).toBe(false);
    });

    it('rejects a changed body', () => {
        const signature = signWebhook(body, secret);
        expect(isValidWebhookSignature('{"id":"abd","status":"PAID"}', signature, secret)).toBe(false);
        // Same JSON, different bytes: the signature covers the raw body.
        expect(isValidWebhookSignature('{"id": "abc", "status": "PAID"}', signature, secret)).toBe(false);
    });

    it('rejects a body signed with another secret', () => {
        expect(isValidWebhookSignature(body, signWebhook(body, 'other-secret'), secret)).toBe(false);
    });
});
