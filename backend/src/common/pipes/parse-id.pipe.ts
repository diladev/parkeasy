import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { TranslationService } from 'src/i18n/translation.service';

/**
 * `@Param('id', ParseIdPipe) id: number`
 *
 * Like ParseIntPipe, but only accepts positive whole numbers and answers in the
 * request language (ParseIntPipe's error is always English).
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
    constructor(private readonly translationService: TranslationService) { }

    transform(value: string): number {
        const id = Number(value);
        if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id < 1) {
            throw new BadRequestException(this.translationService.translate('validation.INVALID_ID'));
        }
        return id;
    }
}
