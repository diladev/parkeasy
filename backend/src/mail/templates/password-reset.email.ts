export interface PasswordResetEmailContent {
    lang: string;
    direction: 'ltr' | 'rtl';
    title: string;
    greeting: string;
    intro: string;
    code: string;
    expiry: string;
    ignore: string;
}

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

/**
 * HTML for the password-reset email. Built in code instead of a .hbs file, so
 * there's no template engine to install and no asset folder to copy into dist/.
 * Every text value is escaped (the user's name comes from user input).
 */
export function renderPasswordResetEmail(content: PasswordResetEmailContent): string {
    const c = Object.fromEntries(
        Object.entries(content).map(([key, value]) => [key, escapeHtml(String(value))]),
    ) as unknown as PasswordResetEmailContent;

    return `<!DOCTYPE html>
<html lang="${c.lang}" dir="${c.direction}">
<head>
  <meta charset="utf-8" />
  <title>${c.title}</title>
</head>
<body style="margin:0;padding:0;background:#111114;font-family:Arial,sans-serif;color:#F0EFF8;">
  <div style="max-width:480px;margin:40px auto;background:#1C1C21;border-radius:16px;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;font-size:22px;font-weight:bold;color:#1D9E75;">ParkEasy</div>
    <p>${c.greeting}</p>
    <p>${c.intro}</p>
    <div dir="ltr" style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1D9E75;text-align:center;margin:24px 0;">${c.code}</div>
    <p style="font-size:13px;color:#9998A8;text-align:center;">${c.expiry}</p>
    <p style="font-size:13px;color:#9998A8;text-align:center;">${c.ignore}</p>
    <div style="font-size:11px;color:#5C5B6E;text-align:center;margin-top:32px;">&copy; ${new Date().getFullYear()} ParkEasy</div>
  </div>
</body>
</html>`;
}
