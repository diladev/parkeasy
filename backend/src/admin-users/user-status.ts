/** What an admin can do to an account, and the status it must have first. */
export const USER_ACTIONS = {
  suspend: { from: ['active'], to: 'suspended' },
  restore: { from: ['suspended'], to: 'active' },
} as const satisfies Record<string, { from: readonly string[]; to: string }>;

export type UserAction = keyof typeof USER_ACTIONS;

/** The status after `action`, or null when the account isn't in a state that allows it. */
export function nextUserStatus(
  current: string,
  action: UserAction,
): string | null {
  const rule = USER_ACTIONS[action];
  return (rule.from as readonly string[]).includes(current) ? rule.to : null;
}
