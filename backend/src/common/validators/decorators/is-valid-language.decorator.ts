import {
    registerDecorator,
    ValidationOptions,
} from 'class-validator';
import { SUPPORTED_LANGUAGES } from 'src/config/languages';

export function IsValidLanguage(
    validationOptions?: ValidationOptions,
) {
    return function (
        object: object,
        propertyName: string,
    ) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: unknown): boolean {
                    return (
                        typeof value === 'string' &&
                        SUPPORTED_LANGUAGES.includes(
                            value as typeof SUPPORTED_LANGUAGES[number],
                        )
                    );
                },
            },
        });
    };
}