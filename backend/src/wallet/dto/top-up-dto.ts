import { MaxLength, MinLength, IsEmail, Matches, IsNumber, IsPositive } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";
import { i18nValidationMessage } from "nestjs-i18n";

export class TopUpDto {
    @ApiProperty({example:10})
    @IsNumber()
    @IsPositive()
    amount!: number;
}
