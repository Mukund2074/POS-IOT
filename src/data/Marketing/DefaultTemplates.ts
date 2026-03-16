// Default email template for new email campaigns (mobile-responsive, inline styles only).
// The <!--LOGO--> comment is replaced at runtime by buildDefaultEmailTemplate().
const EMAIL_TEMPLATE_BASE = `
<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Email</title>
</head>
<body style="margin:0; padding:0; background:#f7f7f9;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="center" style="padding:0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background:#ffffff; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.06);">
<tr>
<td align="center" style="padding:24px 16px 8px 16px;">
<!--LOGO-->
</td>
</tr>
<tr>
<td align="center" style="padding:12px 16px 20px 16px;">
<div style="font-family:Arial, Helvetica, sans-serif; font-size:22px; line-height:28px; font-weight:bold; color:#1f2937;">
Overskrift her
</div>
<div style="margin-top:8px; font-family:Arial, Helvetica, sans-serif; font-size:14px; line-height:20px; color:#6b7280;">
Kort beskrivelse eller undertekst her
</div>
</td>
</tr>
<tr>
<td style="padding:0 16px 20px 16px;">
<div style="font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:24px; color:#374151;">
Hej {name},<br><br>
Dette er en eksempeltekst med dummy-indhold. Her kan der stå information om behandlinger, tilbud eller en vigtig opdatering.<br><br>
Du kan frit tilpasse teksten, så den passer til formålet.
</div>
</td>
</tr>
<tr>
<td align="center" style="padding:4px 16px 28px 16px;">
<a href="{booking_link}" style="display:inline-block; background-color:#fa873c; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:bold; text-decoration:none; padding:10px 24px; border-radius:10px;">
Book tid
</a>
</td>
</tr>
<tr>
<td style="padding:16px; background:#fafafa;">
<div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:18px; color:#9ca3af;">
Denne mail er sendt automatisk fra {outlet_name}.<br>
Har du spørgsmål, kan du kontakte os ved at svare på denne mail.
</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`
    .replace(/>\s+</g, '><')
    .trim();

const LOGO_PLACEHOLDER_HTML =
    '<div style="width:120px; height:120px; border-radius:20px; background:#f3f4f6; border:2px dashed #d1d5db; display:flex; align-items:center; justify-content:center; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#9ca3af; text-align:center;">Inds\u00e6t<br>logo her</div>';

/** Build the default email template, optionally injecting the store profile image. */
export const buildDefaultEmailTemplate = (profileImageUrl?: string): string => {
    const logoHtml = profileImageUrl
        ? `<img src="${profileImageUrl}" alt="Logo" style="width:120px; height:120px; border-radius:20px; object-fit:cover;">`
        : LOGO_PLACEHOLDER_HTML;
    return EMAIL_TEMPLATE_BASE.replace('<!--LOGO-->', logoHtml).replace(/>\s+</g, '><').trim();
};

/** Fallback constant (no profile image) used when settings are unavailable. */
export const DEFAULT_EMAIL_TEMPLATE = buildDefaultEmailTemplate();
