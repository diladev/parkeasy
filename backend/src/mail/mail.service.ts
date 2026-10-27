import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { TranslationService } from 'src/i18n/translation.service';
import {
  BookingReceiptEmailContent,
  renderBookingReceiptEmail,
} from './templates/booking-receipt.email';
import { renderPasswordResetEmail } from './templates/password-reset.email';

/** The receipt's facts; MailService adds the translated labels. */
export interface BookingReceiptEmail {
  receiptNumber: string;
  lot: string;
  slot: string;
  entry: string;
  exit: string;
  subtotal: string;
  /** Only shown when something was refunded. */
  refunded: string | null;
  total: string;
  paidWith: 'wallet' | 'card';
}

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
  const password =
    config.get<string>('MAIL_PASSWORD') ?? config.get<string>('EMAIL_APP_PASS');
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
  async sendPasswordResetCode(
    to: string,
    name: string,
    code: string,
    expiresInMinutes: number,
  ): Promise<void> {
    const t = (key: string, args?: Record<string, unknown>) =>
      this.translationService.translate(`email.${key}`, { args });

    if (!this.isConfigured) {
      if (this.isProduction) {
        throw new Error(
          'SMTP is not configured (set MAIL_USER and MAIL_PASSWORD).',
        );
      }
      // Development fallback: no SMTP credentials, so print the code instead.
      this.logger.warn(
        `SMTP not configured. Password reset code for ${to}: ${code}`,
      );
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

  /**
   * Sends a finished booking's receipt. It's usually sent by the background
   * job, outside any request, so in the default language. Never throws:
   * a receipt that can't be sent is logged, and the booking is unaffected.
   */
  async sendBookingReceipt(
    to: string,
    name: string,
    receipt: BookingReceiptEmail,
  ): Promise<void> {
    const t = (key: string, args?: Record<string, unknown>) =>
      this.translationService.translate(`email.${key}`, { args });

    if (!this.isConfigured) {
      this.logger.warn(
        `SMTP not configured. Receipt ${receipt.receiptNumber} for ${to}: total ${receipt.total}`,
      );
      return;
    }

    const lang = this.translationService.lang;
    const rows: BookingReceiptEmailContent['rows'] = [
      [t('RECEIPT_LOT'), receipt.lot],
      [t('RECEIPT_SLOT'), receipt.slot],
      [t('RECEIPT_ENTRY'), receipt.entry],
      [t('RECEIPT_EXIT'), receipt.exit],
      [t('RECEIPT_SUBTOTAL'), receipt.subtotal],
      ...(receipt.refunded
        ? [[t('RECEIPT_REFUNDED'), receipt.refunded] as [string, string]]
        : []),
      [t('RECEIPT_TOTAL'), receipt.total],
      [
        t('RECEIPT_PAID_WITH'),
        t(
          receipt.paidWith === 'wallet' ? 'PAID_WITH_WALLET' : 'PAID_WITH_CARD',
        ),
      ],
    ];

    try {
      await this.mailer.sendMail({
        to,
        subject: t('RECEIPT_SUBJECT', { number: receipt.receiptNumber }),
        html: renderBookingReceiptEmail({
          lang,
          direction: lang === 'ckb' ? 'rtl' : 'ltr',
          title: t('RECEIPT_TITLE'),
          greeting: t('GREETING', { name }),
          intro: t('RECEIPT_INTRO', { lot: receipt.lot }),
          number: t('RECEIPT_NUMBER', { number: receipt.receiptNumber }),
          rows,
          footer: t('RECEIPT_FOOTER'),
        }),
      });
    } catch (error) {
      this.logger.error(
        `Receipt ${receipt.receiptNumber} could not be sent`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
