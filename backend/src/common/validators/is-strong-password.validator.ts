import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

import passwordPolicy from 'src/config/password-policy';

/**
 * Builds the password regex from the policy in src/config/password-policy.ts.
 *
 * Any non-whitespace character is allowed (symbols like # - _ or Kurdish
 * letters too); the policy only decides which character classes are required.
 */
export function buildPasswordRegex(): RegExp {
    const policy = passwordPolicy();
    let lookaheads = '';

    if (policy.requireUppercase) lookaheads += '(?=.*[A-Z])';
    if (policy.requireLowercase) lookaheads += '(?=.*[a-z])';
    if (policy.requireNumber) lookaheads += '(?=.*\\d)';
    if (policy.requireSpecial) lookaheads += '(?=.*[^A-Za-z0-9\\s])';

    return new RegExp(`^${lookaheads}\\S{${policy.minLength},${policy.maxLength}}$`, 'u');
}

/**
 * No constructor dependencies on purpose: class-validator can always create it,
 * with or without Nest's DI container. The regex is built on first use, after
 * ConfigModule has loaded .env.
 */
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordValidator implements ValidatorConstraintInterface {
    private static regex?: RegExp;

    validate(value: unknown): boolean {
        IsStrongPasswordValidator.regex ??= buildPasswordRegex();
        return typeof value === 'string' && IsStrongPasswordValidator.regex.test(value);
    }
}
