/** Languages the API can answer in. Must match the folders in src/i18n. */
export const SUPPORTED_LANGUAGES = ['en', 'ckb'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
    return (SUPPORTED_LANGUAGES as readonly unknown[]).includes(value);
}

/**
 * DEFAULT_LANGUAGE from .env, or 'en'.
 *
 * A function, not a constant: this file is imported before ConfigModule has
 * read .env, so a constant would always see an empty value.
 */
export function defaultLanguage(): SupportedLanguage {
    const value = process.env.DEFAULT_LANGUAGE;
    return isSupportedLanguage(value) ? value : 'en';
}
