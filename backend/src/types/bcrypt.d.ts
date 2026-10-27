/**
 * The two bcrypt functions the app uses. bcrypt 6 ships no type definitions,
 * and declaring them here avoids an extra @types package for two signatures.
 */
declare module 'bcrypt' {
  export function hash(
    data: string,
    saltOrRounds: string | number,
  ): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}
