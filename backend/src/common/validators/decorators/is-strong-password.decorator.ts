import {
    registerDecorator,
    ValidationOptions,
} from 'class-validator';

import { IsStrongPasswordValidator } from '../is-strong-password.validator';

export function IsStrongPassword(
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
            validator: IsStrongPasswordValidator,
        });
    };
}