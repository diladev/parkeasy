import { Inject, Injectable, Scope } from '@nestjs/common';
import { I18nService, TranslateOptions } from 'nestjs-i18n';
import type { Request } from 'express'
import { REQUEST } from '@nestjs/core'

@Injectable({ scope: Scope.REQUEST })
export class TranslationService {
    private lang: string;

    constructor(
        private readonly i18nService: I18nService,
        @Inject(REQUEST) private request: Request,
    ) {
        this.lang = (this.request?.query?.lang as string) ??
            (this.request?.headers?.['x-lang'] as string) ??
            'en';
    }

    translate(key: string, options?: TranslateOptions): string {
        if (options?.lang) {
            return this.i18nService.translate(key, options);
        }
        return this.i18nService.translate(key, { lang: this.lang, args: options?.args });
    }
}
