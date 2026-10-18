import { IsInt, IsPositive, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";

/** No payment provider is connected yet, so a single top-up is capped. */
export const MAX_TOP_UP = 1_000_000;

export class TopUpDto {
    @ApiProperty({
        description: `Whole Iraqi dinars to add: more than 0, at most ${MAX_TOP_UP}.`,
        example: 10000,
    })
    @IsInt({ message: i18nValidationMessage('validation.IS_MONEY') })
    @IsPositive({ message: i18nValidationMessage('validation.IS_POSITIVE') })
    @Max(MAX_TOP_UP, { message: i18nValidationMessage('validation.MAX') })
    amount!: number;
}
