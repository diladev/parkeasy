/** "50%_off" -> "50\%\_off", so LIKE treats the user's text literally. */
export const escapeLike = (text: string): string =>
  text.replace(/[\\%_]/g, '\\$&');
