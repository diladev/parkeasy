import { Transform } from 'class-transformer';

/**
 * Input clean-up that runs before validation (the global pipe has `transform: true`).
 * Non-string values are passed through untouched so the validators can reject them.
 */

/** "  Dilan " -> "Dilan" */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/** " Dilan@Example.com" -> "dilan@example.com", so one address is always one account. */
export const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

/** " 22  sul 12345 " -> "22 SUL 12345", so the same plate is always stored the same way. */
export const NormalizePlate = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().replace(/\s+/g, ' ').toUpperCase()
      : value,
  );

/** " b1 " -> "B1", so "b1" and "B1" are the same level or slot. */
export const UpperCaseTrim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
