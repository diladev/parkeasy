import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService, readSmtpSettings } from './mail.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const smtp = readSmtpSettings(config);
                return {
                    // Without SMTP credentials nothing is sent: MailService logs the
                    // code instead (development only), so the flow is still testable.
                    transport: smtp
                        ? {
                            host: smtp.host,
                            port: smtp.port,
                            secure: smtp.port === 465,
                            auth: { user: smtp.user, pass: smtp.password },
                        }
                        : { jsonTransport: true },
                    defaults: {
                        from: config.get<string>('MAIL_FROM', '"ParkEasy" <no-reply@parkeasy.app>'),
                    },
                };
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
