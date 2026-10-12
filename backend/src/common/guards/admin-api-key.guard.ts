import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createHash, timingSafeEqual } from 'crypto';

import { TranslationService } from 'src/i18n/translation.service';

/**
 * Temporary protection for parking-lot management routes until the garage-owner
 * and admin modules exist. Requires the `x-admin-key` header to match the
 * ADMIN_API_KEY env var. If ADMIN_API_KEY isn't set, every request is rejected.
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
    constructor(
        private readonly config: ConfigService,
        private readonly translationService: TranslationService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const expected = this.config.get<string>('ADMIN_API_KEY');
        const provided = context.switchToHttp().getRequest<Request>().header('x-admin-key');

        if (!expected || !provided || !this.matches(provided, expected)) {
            throw new ForbiddenException(
                this.translationService.translate('message.ADMIN_KEY_INVALID'),
            );
        }
        return true;
    }

    // Hashing first gives both sides the same length, as timingSafeEqual requires.
    private matches(provided: string, expected: string): boolean {
        const digest = (value: string) => createHash('sha256').update(value).digest();
        return timingSafeEqual(digest(provided), digest(expected));
    }
}
