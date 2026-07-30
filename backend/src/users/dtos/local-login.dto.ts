import { IsEmail, Matches } from "class-validator";

export class LocalLoginDto {
    @IsEmail({}, { message: '$property.EMAIL_PATTERN' })
    email!: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: '$property.PASSWORD_PATTERN' })
    password!: string;
}