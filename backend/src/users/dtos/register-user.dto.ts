import { MaxLength, MinLength, IsEmail, Matches, IsNumber } from "class-validator";

export class RegisterUserDto {
    @MaxLength(50, { message: '$property.MAX,$constraint1' })
    @MinLength(3, { message: '$property.MIN,$constraint1' })
    name!: string;

    @IsEmail({}, { message: '$property.EMAIL_PATTERN' })
    email!: string;

    @IsNumber({}, { message: '$property.NUM_PATTERN' })
    phone!: number;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: '$property.PW_PATTERN' })
    password!: string;

}