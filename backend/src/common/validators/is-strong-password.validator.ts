import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
@ValidatorConstraint({
    name: 'isStrongPassword',
    async: false,
})
export class IsStrongPasswordValidator
    implements ValidatorConstraintInterface {

    private readonly passwordRegex: RegExp;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.passwordRegex = this.createRegex();
    }

    private createRegex(): RegExp {
        const minLength =
            this.configService.get<number>(
                'password.minLength',
            ) ?? 8;

        let pattern = '';

        if (
            this.configService.get<boolean>(
                'password.requireUppercase',
            )
        ) {
            pattern += '(?=.*[A-Z])';
        }

        if (
            this.configService.get<boolean>(
                'password.requireLowercase',
            )
        ) {
            pattern += '(?=.*[a-z])';
        }

        if (
            this.configService.get<boolean>(
                'password.requireNumber',
            )
        ) {
            pattern += '(?=.*\\d)';
        }

        if (
            this.configService.get<boolean>(
                'password.requireSpecial',
            )
        ) {
            pattern += '(?=.*[@$!%*?&])';
        }

        pattern += `[A-Za-z\\d@$!%*?&]{${minLength},}$`;

        return new RegExp(`^${pattern}`);
    }

    validate(value: unknown): boolean {
        return (
            typeof value === 'string' &&
            this.passwordRegex.test(value)
        );
    }
}