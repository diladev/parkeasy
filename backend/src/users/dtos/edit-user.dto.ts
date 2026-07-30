import { MaxLength, MinLength, IsEmail, Matches, IsNumber } from "class-validator";


export class EditUserDto {
    @MaxLength(50, { message: '$property.MAX,$constraint1' })
    @MinLength(3, { message: '$property.MIN,$constraint1' })
    name?: string;

    @IsEmail({}, { message: '$property.EMAIL_PATTERN' })
    email?: string;

    @IsNumber({}, { message: '$property.NUM_PATTERN' })
    phone?: number;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '$property.DATE_PATTERN' })
    date_of_birth?: string;
}