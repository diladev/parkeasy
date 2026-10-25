import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { minutes, Throttle } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';

import {
    ForgotPasswordDto,
    RegisterUserDto,
    ResetPasswordDto,
    UserLocalLoginDto,
    VerifyOtpDto,
} from 'src/users/dtos';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/user.decorator';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard';
import { UserAccessTokenAuthGuard } from './guards/user-access-token.guard';
import { UserRefreshTokenAuthGuard } from './guards/user-refresh-token.guard';
import { REFRESH_COOKIE } from './strategies/refresh-token.strategy';
import type {
    AuthenticatedUser,
    AuthResponse,
    AuthSession,
    MeResponse,
    RefreshTokenUser,
} from './types/auth.types';

/** The refresh cookie is only sent to these routes (/refresh and /logout), nowhere else. */
const REFRESH_COOKIE_PATH = '/user/local';

/** Every sign-in route is rate limited (see AuthModule for the default limit). */
@ApiTags('User Authentication')
@UseGuards(AuthThrottlerGuard)
@Controller('user/local')
export class AuthController {
    private readonly secureCookies: boolean;

    constructor(
        private readonly authService: AuthService,
        config: ConfigService,
    ) {
        this.secureCookies = config.get<string>('NODE_ENV') === 'production';
    }

    @Post('register')
    @ApiOperation({ summary: 'Create an account and sign in.' })
    async register(
        @Body() dto: RegisterUserDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponse> {
        return this.sendSession(res, await this.authService.register(dto));
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: minutes(15) } })
    @ApiOperation({ summary: 'Sign in with email and password.' })
    async login(
        @Body() dto: UserLocalLoginDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponse> {
        return this.sendSession(res, await this.authService.login(dto));
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(UserRefreshTokenAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get a new token pair.',
        description:
            'Send the refresh token in the `refreshToken` cookie or as `Authorization: Bearer <refresh token>`. ' +
            'Each refresh token works once: the response sets a new one.',
    })
    async refresh(
        @CurrentUser() user: RefreshTokenUser,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponse> {
        return this.sendSession(res, await this.authService.refresh(user.id, user.refreshToken));
    }

    @Get('me')
    @UseGuards(UserAccessTokenAuthGuard)
    @Header('Cache-Control', 'no-store')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Who is signed in, their role and what they may do.' })
    me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponse> {
        return this.authService.me(user.id);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(UserAccessTokenAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sign out: the refresh token stops working.' })
    async logout(
        @CurrentUser() user: AuthenticatedUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        res.clearCookie(REFRESH_COOKIE, this.cookieOptions());
        return this.authService.logout(user.id);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: minutes(15) } })
    @ApiOperation({ summary: 'Step 1 of 3: email a 6-digit reset code.' })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: minutes(15) } })
    @ApiOperation({ summary: 'Step 2 of 3: check the code, get a reset token.' })
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Step 3 of 3: set the new password.' })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    /** Moves the refresh token into an httpOnly cookie and returns the rest as the body. */
    private sendSession(res: Response, session: AuthSession): AuthResponse {
        const { refreshToken, ...body } = session;
        res.cookie(REFRESH_COOKIE, refreshToken, {
            ...this.cookieOptions(),
            // Express expects milliseconds here; the token lifetime is in seconds.
            maxAge: session.refreshTokenExpiresIn * 1000,
        });
        return body;
    }

    private cookieOptions(): CookieOptions {
        return {
            httpOnly: true,
            secure: this.secureCookies,
            sameSite: 'strict',
            path: REFRESH_COOKIE_PATH,
        };
    }
}
