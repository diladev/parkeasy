import { createHash, createHmac, timingSafeEqual } from 'crypto';

import bcryptKeys from 'src/config/bcrypt-keys';

/**
 * SHA-256 for long random secrets (refresh tokens).
 * Storing only the hash means a leaked database can't be used to sign in.
 */
export function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

/**
 * HMAC-SHA256 keyed with the server pepper, for short secrets like the 6-digit
 * reset code. A plain hash of a 6-digit code can be reversed by trying all
 * million codes; without the pepper (which isn't in the database) it can't.
 */
export function hmacSha256(value: string): string {
    return createHmac('sha256', bcryptKeys().pepper_secret).update(value).digest('hex');
}

/** Constant-time comparison of two hex digests. */
export function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a, 'hex');
    const right = Buffer.from(b, 'hex');
    return left.length === right.length && timingSafeEqual(left, right);
}
