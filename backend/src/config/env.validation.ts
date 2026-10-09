import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateIf, validateSync } from 'class-validator';

/**
 * Settings the API can't run without. They're checked once at startup, so a
 * missing value is a clear error right away instead of a crash on the first login.
 * Everything else has a safe default (see .env.example).
 */
class RequiredEnvironment {
    NODE_ENV?: string;

    @IsString()
    @IsNotEmpty()
    JWT_ACCESS_SECRET!: string;

    @IsString()
    @IsNotEmpty()
    JWT_REFRESH_SECRET!: string;

    @IsString()
    @IsNotEmpty()
    JWT_RESET_PASSWORD_SECRET!: string;

    /** Production only: development falls back to a dev pepper (see config/bcrypt-keys.ts). */
    @ValidateIf((env: RequiredEnvironment) => env.NODE_ENV === 'production')
    @IsString()
    @IsNotEmpty()
    PEPPER_SECRET?: string;
}

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
    const errors = validateSync(plainToInstance(RequiredEnvironment, config));
    if (errors.length > 0) {
        const names = errors.map((error) => error.property).join(', ');
        throw new Error(`Missing settings in .env: ${names}. See .env.example.`);
    }
    return config;
}
