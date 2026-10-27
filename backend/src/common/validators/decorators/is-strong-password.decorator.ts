import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import passwordPolicy from 'src/config/password-policy';
import { IsStrongPasswordValidator } from '../is-strong-password.validator';

/**
 * The translated error message. It's built when validation runs (not when the
 * DTO file is loaded, which happens before .env is read), so the lengths in the
 * message always match the configured policy.
 */
function passwordPolicyMessage(args: ValidationArguments): string {
  const { minLength, maxLength } = passwordPolicy();
  return i18nValidationMessage('validation.PASSWORD_PATTERN', {
    min: minLength,
    max: maxLength,
  })(args);
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: { message: passwordPolicyMessage, ...validationOptions },
      constraints: [],
      validator: IsStrongPasswordValidator,
    });
  };
}
