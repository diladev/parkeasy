import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { minutes, ThrottlerModule } from "@nestjs/throttler";

import { MailModule } from "src/mail/mail.module";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PermissionsGuard } from "./guards/permissions.guard";
import { UserAccessTokenStrategy } from "./strategies/access-token.strategy";
import { UserRefreshTokenStrategy } from "./strategies/refresh-token.strategy";

@Module({
    imports: [
        UsersModule,
        MailModule,
        PassportModule,
        // No defaults here: each token type is signed with its own secret in AuthService.
        JwtModule.register({}),
        // Used by the sign-in routes only (AuthThrottlerGuard): 60 requests a
        // minute per client, tighter on login and password reset.
        ThrottlerModule.forRoot([{ name: 'default', ttl: minutes(1), limit: 60 }]),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserAccessTokenStrategy, UserRefreshTokenStrategy, PermissionsGuard],
    exports: [AuthService, PermissionsGuard],
})
export class AuthModule { }
