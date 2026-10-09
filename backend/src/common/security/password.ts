import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';

import bcryptKeys from 'src/config/bcrypt-keys';

/**
 * Applies the pepper with HMAC-SHA256 before bcrypt.
 *
 * bcrypt only reads the first 72 bytes of its input, so with `password + pepper`
 * a long password would push the pepper out of range. HMAC turns any password
 * into a fixed 44-character string, so the pepper always counts.
 */
function pepper(password: string): string {
    return createHmac('sha256', bcryptKeys().pepper_secret)
        .update(password)
        .digest('base64');
}

export function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(pepper(password), bcryptKeys().salt_rounds);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pepper(password), hash);
}
