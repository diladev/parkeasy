import { escapeHtml } from './escape-html';

export interface BookingReceiptEmailContent {
    lang: string;
    direction: 'ltr' | 'rtl';
    title: string;
    greeting: string;
    intro: string;
    /** "Receipt PE-000123" */
    number: string;
    /** (label, value) lines, e.g. ("Total", "4,500 IQD"). */
    rows: [string, string][];
    footer: string;
}

/**
 * HTML for the receipt sent when a booking finishes. Same approach as the
 * password-reset email: built in code, every value escaped.
 */
export function renderBookingReceiptEmail(content: BookingReceiptEmailContent): string {
    const e = (value: string) => escapeHtml(value);
    const rows = content.rows
        .map(
            ([label, value]) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #26262D;color:#9998A8;font-size:13px;">${e(label)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #26262D;text-align:end;font-size:13px;">${e(value)}</td>
      </tr>`,
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="${e(content.lang)}" dir="${content.direction}">
<head>
  <meta charset="utf-8" />
  <title>${e(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:#111114;font-family:Arial,sans-serif;color:#F0EFF8;">
  <div style="max-width:480px;margin:40px auto;background:#1C1C21;border-radius:16px;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;font-size:22px;font-weight:bold;color:#1D9E75;">ParkEasy</div>
    <p>${e(content.greeting)}</p>
    <p>${e(content.intro)}</p>
    <p style="font-size:12px;color:#5C5B6E;">${e(content.number)}</p>
    <table style="width:100%;border-collapse:collapse;color:#F0EFF8;">${rows}
    </table>
    <p style="font-size:12px;color:#9998A8;text-align:center;margin-top:24px;">${e(content.footer)}</p>
    <div style="font-size:11px;color:#5C5B6E;text-align:center;margin-top:32px;">&copy; ${new Date().getFullYear()} ParkEasy</div>
  </div>
</body>
</html>`;
}
