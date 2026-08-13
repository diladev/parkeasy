import { Controller, HttpCode, Post, Res, Body, UsePipes, ValidationPipe, UseGuards, Req, UseInterceptors, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { RegisterUserDto, UserLocalLoginDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto, EditUserDto } from 'src/users/dtos';
import type { Response } from 'express';
import tokenExpiration from 'src/config/token-expiration';
import { UserAccessTokenAuthGuard } from './guards/user-access-token.guard';
import { RefreshInterceptor } from './interceptors/refresh-token.interceptor';
import { RefreshDecorator } from 'src/auth/decorators/user.decorator';


@ApiTags('User Authentication')
@UsePipes(ValidationPipe)
@Controller('user/local')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ) { }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: UserLocalLoginDto, @Res({ passthrough: true }) res: Response) {
        const { access_token_expiration, refresh_token_expiration } = tokenExpiration();
        const result = await this.authService.signInLocalUser(dto);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refresh_token_expiration,
        });

        return {
            accessToken: result.accessToken,
            accessTokenExpiresIn: access_token_expiration,
            user: result.user
        };
    }

    @Post('register')
    async register(@Body() dto: RegisterUserDto, @Res({ passthrough: true }) res: Response) {
        await this.userService.registerUser(dto);

        return this.login({ email: dto.email, password: dto.password, language: dto.language }, res);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Post('logout')
    @HttpCode(200)
    async logout(@Req() req: any){
        return this.authService.logout(req.user.id, req.user.lang);
    }

    @UseInterceptors(RefreshInterceptor)
    @UseGuards(UserAccessTokenAuthGuard)
    @Post('refresh')
    @HttpCode(200)
    async refresh(@RefreshDecorator('refreshToken') refreshToken: string, @Res({ passthrough: true }) res: Response) {
        const { access_token_expiration, refresh_token_expiration } = tokenExpiration();
        const result = await this.authService.updateRefreshToken(refreshToken);

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refresh_token_expiration,
        });

        return {
            accessToken: result.accessToken,
            accessTokenExpiresIn: access_token_expiration,
        };
    }

    @Post('forgot-password')
    @HttpCode(200)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('verify-otp')
    @HttpCode(200)
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('reset-password')
    @HttpCode(200)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @UseGuards(UserAccessTokenAuthGuard)
    @Patch('profile')
    async updateProfile(@Req() req: any, @Body() dto: EditUserDto) {
        return this.userService.updateUserProfile(req.user.id, dto, req.user.lang);
    }
}