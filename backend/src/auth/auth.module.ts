import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize/dist/sequelize.module";
import { User } from "src/users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshInterceptor } from "./interceptors/refresh-token.interceptor";
import { JwtService } from "@nestjs/jwt";
import { UserAccessTokenStrategy } from "./strategies/access-token.strategy";
import { UserRefreshTokenStrategy } from "./strategies/refresh-token.strategy";
import { Vehicle } from "src/users/entities/vehicle.entity";
import { UsersModule } from "src/users/users.module";
import { MailerService } from "@nestjs-modules/mailer";

@Module({
    imports: [
        SequelizeModule.forFeature([User, Vehicle]),
        UsersModule
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        UserAccessTokenStrategy,
        UserRefreshTokenStrategy,
        RefreshInterceptor,
        JwtService,
        // TODO: replace this stub once MailerModule is properly configured
        {
            provide: MailerService,
            useValue: {
                sendMail: async (..._args: unknown[]) => {
                    console.log('[MailerService stub] sendMail called — real mailer not configured yet');
                },
            },
        },
    ],
    exports: [AuthService],
})
export class AuthModule { }