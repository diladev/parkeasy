import { registerAs } from '@nestjs/config';

export default registerAs('password', () => ({
    minLength: Number(process.env.PASSWORD_MIN_LENGTH ?? 8),
    requireUppercase:
        process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireLowercase:
        process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    requireNumber:
        process.env.PASSWORD_REQUIRE_NUMBER === 'true',
    requireSpecial:
        process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
}));