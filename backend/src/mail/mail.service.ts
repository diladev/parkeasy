import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { TranslationService } from 'src/i18n/translation.service';
import { renderPasswordResetEmail } from './templates/password-reset.email';

export interface SmtpSettings {
    host: string;
    port: number;
    user: string;
    password: string;
}

/** SMTP settings, or null when no credentials are configured. */
export function readSmtpSettings(config: ConfigService): SmtpSettings | null {
    // MAIL_* names, with the older EMAIL / EMAIL_APP_PASS names as fallbacks.
    const user = config.get<string>('MAIL_USER') ?? config.get<string>('EMAIL');
    const password = config.get<string>('MAIL_PASSWORD') ?? config.get<string>('EMAIL_APP_PASS');
    if (!user || !password) return null;

    return {
        host: config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
        port: Number(config.get('MAIL_PORT', 465)),
        user,
        password,
    };
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly isConfigured: boolean;
    private readonly isProduction: boolean;

    constructor(
        private readonly mailer: MailerService,
        private readonly translationService: TranslationService,
        config: ConfigService,
    ) {
        this.isConfigured = readSmtpSettings(config) !== null;
        this.isProduction = config.get<string>('NODE_ENV') === 'production';
    }

    /** Sends the 6-digit reset code in the current request language. */
    async sendPasswordResetCode(to: string, name: string, code: string, expiresInMinutes: number): Promise<void> {
        const t = (key: string, args?: Record<string, unknown>) =>
            this.translationService.translate(`email.${key}`, { args });

        if (!this.isConfigured) {
            if (this.isProduction) {
                throw new Error('SMTP is not configured (set MAIL_USER and MAIL_PASSWORD).');
            }
            // Development fallback: no SMTP credentials, so print the code instead.
            this.logger.warn(`SMTP not configured. Password reset code for ${to}: ${code}`);
            return;
        }

        const lang = this.translationService.lang;
        await this.mailer.sendMail({
            to,
            subject: t('RESET_SUBJECT'),
            html: renderPasswordResetEmail({
                lang,
                direction: lang === 'ckb' ? 'rtl' : 'ltr',
                title: t('RESET_TITLE'),
                greeting: t('GREETING', { name }),
                intro: t('RESET_INTRO'),
                code,
                expiry: t('RESET_EXPIRY', { minutes: expiresInMinutes }),
                ignore: t('RESET_IGNORE'),
            }),
        });
    }
}
