import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';
import { defaultLanguage, isSupportedLanguage, SupportedLanguage } from 'src/config/languages';

/**
 * Thin wrapper around nestjs-i18n.
 *
 * The language is resolved once per request by I18nModule (see AppModule:
 * x-lang header -> Accept-Language header -> default), so callers never pass `lang`.
 * This is a regular singleton: it reads the current request's language from
 * I18nContext instead of being request-scoped, which would have made every
 * service that injects it request-scoped too.
 */
@Injectable()
export class TranslationService {
    constructor(private readonly i18n: I18nService) { }

    /** Language of the request being handled ('ckb-IQ' becomes 'ckb', unknown values the default). */
    get lang(): SupportedLanguage {
        const requested = I18nContext.current()?.lang;
        const resolved = requested ? this.i18n.resolveLanguage(requested) : undefined;
        return isSupportedLanguage(resolved) ? resolved : defaultLanguage();
    }

    translate(key: string, options?: TranslateOptions): string {
        return this.i18n.translate(key, {
            ...options,
            lang: options?.lang ?? this.lang,
        }) as string;
    }
}
