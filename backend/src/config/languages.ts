const languages = ['en', 'ckb']

export const SUPPORTED_LANGUAGES =
    [...new Set(languages)];

export const DEFAULT_LANGUAGE =
    process.env.DEFAULT_LANGUAGE ?? 'en';