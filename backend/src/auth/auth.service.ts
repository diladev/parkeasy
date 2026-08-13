import {
    HttpException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import bcryptKeys from 'src/config/bcrypt-keys';
import { UsersService } from 'src/users/users.service';
import { TranslationService } from 'src/i18n/translation.service';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import {
    UserLocalLoginDto,
    ForgotPasswordDto,
    VerifyOtpDto,
    ResetPasswordDto,
    RegisterUserDto
} from 'src/users/dtos/index';
import tokenExpiration from 'src/config/token-expiration';


dotenv.config();

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(User) private readonly userModel: typeof User,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly usersService: UsersService,
        private readonly translationService: TranslationService
    ) { }

    async getTokens(userId: number, username: string, status: string, lang: string):
        Promise<{ accessToken: string; refreshToken: string }> {
        const { access_token_expiration, refresh_token_expiration } = tokenExpiration();
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, username, status, lang },
                { secret: process.env.JWT_ACCESS_SECRET, expiresIn: access_token_expiration }
            ),
            this.jwtService.signAsync(
                { sub: userId, username, status, lang },
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refresh_token_expiration }
            )
        ]);
        return { accessToken, refreshToken };
    }


    async validateUser(email: string, password: string, lang: string): Promise<User> {
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.USER_NOT_FOUND',
                    { lang: lang }
                )
            );
        }

        const isMatch = await bcrypt.compare(
            password + bcryptKeys().pepper_secret,
            user.password
        );
        if (!isMatch) {
            throw new UnauthorizedException(
                this.translationService.translate(
                    'message.INVALID_PASSWORD', { lang: lang }
                )
            );
        }

        return user;
    }

    async signInLocalUser(userLocalLoginDto: UserLocalLoginDto):
        Promise<{ accessToken: string; refreshToken: string, user: User }> {

        const { email, password, language } = userLocalLoginDto;
        const user = await this.validateUser(email, password, language);
        const tokens = await this.getTokens(user.id, user.username, user.status, language);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user
        };
    }

    async registerUser(registerUserDto: RegisterUserDto):
        Promise<{ accessToken: string; refreshToken: string, user: User }> {
        const user = (await this.usersService.registerUser(registerUserDto)).user;
        const tokens = await this.getTokens(user.id, user.username, user.status, registerUserDto.language);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken, registerUserDto.language);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user
        };
    }

    async logout(userId: number, lang: string): Promise<{ message: string }> {
        const user = await this.usersService.findOne({ id: userId }, lang);
        await this.usersService.updateRefreshToken(userId, null, lang);
        return {
            message: this.translationService.translate(
                'message.LOGOUT_SUCCESS', { lang: lang }
            )
        };
    }

    async updateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.userModel.findOne({ where: { refreshToken } });
        if (!user) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.NOT_LOGGED_IN', { lang: 'en' }
                )
            );
        }
        const tokens = await this.getTokens(user.id, user.username, user.status, 'en');
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken, 'en');
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto):
        Promise<{ message: string }> {
        const user = await this.usersService.findUserByEmail(forgotPasswordDto.email);
        if (!user) {
            throw new NotFoundException(
                this.translationService.translate(
                    'message.EMAIL_SENT', { lang: forgotPasswordDto.language }
                )
            );
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.usersService.storeOtp(user.email, otp, expiresAt, forgotPasswordDto.language);

        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: this.translationService.translate(
                    'message.FORGOT_PASSWORD_SUBJECT', { lang: forgotPasswordDto.language }
                ),
                template: 'forgot-password',
                context: {
                    name: user.name,
                    otp: otp,
                    expiresAt: expiresAt.toLocaleTimeString('en-US', { hour12: true })
                }
            }
            );
        } catch (error: unknown) {
            if (error instanceof HttpException) {
                this.logger.error(`Failed to send email: ${error.message}`, error);
            } else {
                this.logger.error(`Failed to send email: ${error}`, error);
            }
            throw new Error(
                this.translationService.translate(
                    'message.EMAIL_SEND_FAILED', { lang: forgotPasswordDto.language }
                )
            );
        }
        return {
            message: this.translationService.translate(
                'message.EMAIL_SENT', { lang: forgotPasswordDto.language }
            )
        }
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto):
        Promise<{ message: string, token: string }> {
        const user = await this.usersService.findUserByEmail(verifyOtpDto.email);
        if (!user) {
            throw new UnauthorizedException(
                this.translationService.translate(
                    'message.INVALID_OTP', { lang: verifyOtpDto.language }
                )
            );
        }

        const isExpired = new Date() > new Date(user.otp_expires_at || 0);
        if (isExpired || user.otp !== verifyOtpDto.otp) {
            throw new UnauthorizedException(
                this.translationService.translate(
                    'message.INVALID_OTP', { lang: verifyOtpDto.language }
                )
            );
        }

        const resetToken = await this.jwtService.signAsync(
            { sub: user.id, username: user.username, status: user.status, lang: verifyOtpDto.language },
            { secret: process.env.JWT_RESET_PASSWORD_SECRET, expiresIn: 60 * 15 }
        );

        await this.usersService.clearOtp(user.id, verifyOtpDto.language);

        return {
            message: this.translationService.translate(
                'message.OTP_VERIFIED', { lang: verifyOtpDto.language }
            ),
            token: resetToken
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto):
        Promise<{ message: string }> {
        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(
                resetPasswordDto.token,
                { secret: process.env.JWT_RESET_PASSWORD_SECRET }
            );
        } catch (error) {
            throw new UnauthorizedException(
                this.translationService.translate(
                    'message.INVALID_TOKEN', { lang: resetPasswordDto.language }
                )
            );
        }

        const user = await this.usersService.findOne({ id: payload.sub }, resetPasswordDto.language);

        const hashedPassword = await bcrypt.hash(
            resetPasswordDto.new_password + bcryptKeys().pepper_secret,
            bcryptKeys().salt_rounds
        );

        await this.usersService.updateUserPassword(user.id, hashedPassword, resetPasswordDto.language);

        return {
            message: this.translationService.translate(
                'message.PASSWORD_RESET_SUCCESS', { lang: resetPasswordDto.language }
            )
        };
    }
}