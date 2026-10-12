/**
 * Rounds a money amount to 2 decimals.
 * Amounts are stored as DOUBLE, so every calculation result goes through here
 * to avoid values like 4.500000000000001 in the database and in responses.
 */
export function roundMoney(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}
