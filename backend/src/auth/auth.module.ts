import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { MailModule } from "src/mail/mail.module";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserAccessTokenStrategy } from "./strategies/access-token.strategy";
import { UserRefreshTokenStrategy } from "./strategies/refresh-token.strategy";

@Module({
    imports: [
        UsersModule,
        MailModule,
        PassportModule,
        // No defaults here: each token type is signed with its own secret in AuthService.
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserAccessTokenStrategy, UserRefreshTokenStrategy],
    exports: [AuthService],
})
export class AuthModule { }
