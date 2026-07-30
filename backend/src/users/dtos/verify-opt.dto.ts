import { IsEmail, Matches } from "class-validator";

export class VerifyOtpDto {
    @IsEmail({}, { message: '$property.EMAIL_PATTERN' })
    email!: string;

    @Matches(/^\d{6}$/, { message: '$property.OTP_PATTERN' })
    otp!: string;
}