import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail({}, { message: '$property.EMAIL_PATTERN' })
    email!: string;
}