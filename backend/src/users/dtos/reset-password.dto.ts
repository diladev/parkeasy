import { Matches, IsString } from "class-validator";

export class ResetPasswordDto {

    @IsString()
    token!: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: '$property.PW_PATTERN' })
    new_password!: string;

}