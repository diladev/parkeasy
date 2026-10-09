import { registerAs } from '@nestjs/config';

/**
 * Password rules. Every rule is ON unless the env var explicitly says 'false',
 * so a missing .env entry can never silently weaken the policy.
 */
export default registerAs('password', () => ({
    minLength: Number(process.env.PASSWORD_MIN_LENGTH ?? 8),
    // bcrypt only reads the first 72 bytes; 64 characters keeps us well inside it.
    maxLength: 64,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
    requireSpecial: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
}));
