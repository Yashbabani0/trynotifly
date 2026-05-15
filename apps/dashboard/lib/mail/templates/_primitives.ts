export const T = {
  bg: "#080B0C",
  surface: "#111113",
  surfaceElevated: "#15151A",
  surfaceSunken: "#0D0E10",
  border: "#1F1F22",
  borderSoft: "#18181C",
  text: "#FAFAFA",
  textMuted: "#A3A3AB",
  textSubtle: "#7A7A82",
  primary: "#84CC16",
  primaryDeep: "#5C9211",
  primaryFg: "#0A0F02",
  destructive: "#F87171",
  destructiveDeep: "#B33A3A",
  destructiveFg: "#1A0606",
  destructiveBg: "#1A0A0A",
  destructiveBorder: "#3D0E0E",
  warningBg: "#16110A",
  warningBorder: "#2D2410",
  warning: "#F4D27A",
} as const;

export const FONT_SANS = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
export const FONT_MONO = `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

/* ── Escaping ────────────────────────────────────────────────────────── */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  // Conservative — URLs sent through this should already be encoded.
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export const esc = escapeHtml;

/* ── Layout ──────────────────────────────────────────────────────────── */

export type EmailLayoutOptions = {
  title: string;
  preheader?: string;
  body: string;
};

export function emailLayout({
  title,
  preheader,
  body,
}: EmailLayoutOptions): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="dark only" />
  <meta name="supported-color-schemes" content="dark only" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    table, td, div, h1, p { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${T.bg}; }
    a { text-decoration: none; }
    @media screen and (max-width: 600px) {
      .tn-container { width: 100% !important; max-width: 100% !important; }
      .tn-card-pad { padding: 28px 22px !important; }
      .tn-heading { font-size: 22px !important; line-height: 1.2 !important; }
      .tn-cta-link { display: block !important; }
      .tn-footer-row td { display: block !important; width: 100% !important; text-align: left !important; padding-bottom: 6px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${T.bg}; color:${T.text}; font-family:${FONT_SANS};">
  ${preheader ? preheaderHtml(preheader) : ""}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${T.bg};">
    <tr>
      <td align="center" style="padding: 40px 16px 32px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" class="tn-container" style="max-width:560px; width:100%;">
          <tr><td style="padding: 0 4px 24px;">${brandHeader()}</td></tr>
          <tr><td style="background-color:${T.surface}; border:1px solid ${T.border}; border-radius:10px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td class="tn-card-pad" style="padding: 36px 36px 34px;">${body}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding: 28px 4px 0;">${emailFooter()}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function preheaderHtml(text: string): string {
  return `<div style="display:none !important; visibility:hidden; mso-hide:all; opacity:0; color:transparent; height:0; width:0; max-height:0; max-width:0; overflow:hidden; font-size:1px; line-height:1px;">${escapeHtml(text)}</div>`;
}

/* ── Header / footer ─────────────────────────────────────────────────── */

function brandHeader(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="vertical-align:middle; padding-right:10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr><td width="28" height="28" align="center" valign="middle" style="background-color:${T.surface}; border:1px solid ${T.border}; border-radius:6px; width:28px; height:28px;">
            <span style="display:inline-block; width:8px; height:8px; background-color:${T.primary}; border-radius:50%;"></span>
          </td></tr>
        </table>
      </td>
      <td style="vertical-align:middle;">
        <span style="font-family:${FONT_SANS}; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:${T.text};">TryNotifly</span>
        <span style="font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:${T.textSubtle}; padding-left:6px;">/ dashboard</span>
      </td>
    </tr>
  </table>`;
}

export function emailFooter(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td style="padding-top: 20px; border-top: 1px solid ${T.borderSoft};">
      <p style="margin: 0 0 16px; font-family:${FONT_SANS}; font-size:12px; line-height:1.65; color:${T.textSubtle};">
        You're receiving this because of an account event on TryNotifly. Need help? Reach us at <a href="mailto:support@trynotifly.com" style="color:${T.textMuted}; text-decoration:underline;">support@trynotifly.com</a>.
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="tn-footer-row">
        <tr>
          <td style="font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:${T.textSubtle};">© ${new Date().getFullYear()} TryNotifly</td>
          <td align="right" style="font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:${T.textSubtle};">
            <span style="display:inline-block; width:6px; height:6px; background-color:${T.primary}; border-radius:50%; vertical-align:middle; margin-right:6px;"></span>
            All systems operational
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`;
}

/* ── Typography blocks ───────────────────────────────────────────────── */

export function eyebrow(text: string): string {
  return `<p style="margin:0 0 14px; font-family:${FONT_MONO}; font-size:10.5px; letter-spacing:0.22em; text-transform:uppercase; color:${T.primary};">${escapeHtml(text)}</p>`;
}

export function heading(text: string): string {
  return `<h1 class="tn-heading" style="margin:0 0 14px; font-family:${FONT_SANS}; font-size:24px; line-height:1.2; font-weight:600; letter-spacing:-0.02em; color:${T.text};">${escapeHtml(text)}</h1>`;
}

export function paragraph(html: string, opts: { muted?: boolean } = {}): string {
  const color = opts.muted ? T.textMuted : T.text;
  return `<p style="margin:0 0 18px; font-family:${FONT_SANS}; font-size:14px; line-height:1.7; color:${color};">${html}</p>`;
}

/* ── CTA button ──────────────────────────────────────────────────────── */

export type CTAVariant = "primary" | "destructive" | "secondary";

export function ctaButton({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: CTAVariant;
}): string {
  const v =
    variant === "destructive"
      ? {
          bg: T.destructive,
          border: T.destructiveDeep,
          color: T.destructiveFg,
        }
      : variant === "secondary"
        ? { bg: T.surfaceElevated, border: T.border, color: T.text }
        : { bg: T.primary, border: T.primaryDeep, color: T.primaryFg };

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 8px 0 4px;">
    <tr>
      <td align="center" bgcolor="${v.bg}" style="background-color:${v.bg}; border-radius:6px; border:1px solid ${v.border};">
        <a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" class="tn-cta-link" style="display:inline-block; padding:13px 26px; font-family:${FONT_SANS}; font-size:14px; font-weight:600; line-height:1; letter-spacing:-0.005em; color:${v.color}; text-decoration:none; mso-padding-alt:0; mso-line-height-rule:exactly;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

/* ── Info card ───────────────────────────────────────────────────────── */

export type InfoCardOptions = {
  label?: string;
  rows: Array<{ key: string; value: string }>;
};

export function infoCard({ label, rows }: InfoCardOptions): string {
  const rowsHtml = rows
    .map(
      ({ key, value }, i) => `
    <tr>
      <td style="padding: ${i === 0 ? "12px" : "10px"} 16px 10px; font-family:${FONT_MONO}; font-size:11px; letter-spacing:0.04em; color:${T.textSubtle}; width:45%; ${i > 0 ? `border-top:1px solid ${T.borderSoft};` : ""}">${escapeHtml(key)}</td>
      <td style="padding: ${i === 0 ? "12px" : "10px"} 16px 10px; font-family:${FONT_SANS}; font-size:13px; color:${T.text}; text-align:right; ${i > 0 ? `border-top:1px solid ${T.borderSoft};` : ""}">${escapeHtml(value)}</td>
    </tr>`,
    )
    .join("");
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${T.surfaceSunken}; border:1px solid ${T.border}; border-radius:8px; margin: 4px 0 8px;">
    ${
      label
        ? `<tr><td style="padding: 10px 16px; font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:${T.textSubtle}; border-bottom:1px solid ${T.borderSoft};">${escapeHtml(label)}</td></tr>`
        : ""
    }
    <tr><td style="padding:0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rowsHtml}</table>
    </td></tr>
  </table>`;
}

/* ── Status badge ────────────────────────────────────────────────────── */

export type StatusTone = "info" | "success" | "warning" | "danger";

export function statusBadge({
  label,
  tone = "info",
}: {
  label: string;
  tone?: StatusTone;
}): string {
  const c =
    tone === "success"
      ? { bg: "#0E1505", border: "#1F3308", text: T.primary, dot: T.primary }
      : tone === "warning"
        ? { bg: T.warningBg, border: T.warningBorder, text: T.warning, dot: T.warning }
        : tone === "danger"
          ? {
              bg: T.destructiveBg,
              border: T.destructiveBorder,
              text: T.destructive,
              dot: T.destructive,
            }
          : {
              bg: T.surfaceElevated,
              border: T.border,
              text: T.textMuted,
              dot: T.textSubtle,
            };

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display:inline-block;"><tr><td style="background-color:${c.bg}; border:1px solid ${c.border}; border-radius:999px; padding:4px 10px 4px 8px; font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:${c.text};">
    <span style="display:inline-block; width:5px; height:5px; background-color:${c.dot}; border-radius:50%; vertical-align:middle; margin-right:6px;"></span>${escapeHtml(label)}
  </td></tr></table>`;
}

/* ── Divider ─────────────────────────────────────────────────────────── */

export function divider({
  spacing = 28,
}: { spacing?: number } = {}): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${spacing}px 0;"><tr><td style="height:1px; line-height:1px; font-size:0; background-color:${T.border};">&nbsp;</td></tr></table>`;
}

/* ── Notice card (subtle inline callout) ─────────────────────────────── */

export type NoticeTone = "info" | "warning" | "danger";

export function noticeCard({
  tone = "info",
  title,
  body,
}: {
  tone?: NoticeTone;
  title?: string;
  body: string;
}): string {
  const c =
    tone === "warning"
      ? { bg: T.warningBg, border: T.warningBorder, accent: T.warning }
      : tone === "danger"
        ? {
            bg: T.destructiveBg,
            border: T.destructiveBorder,
            accent: T.destructive,
          }
        : { bg: T.surfaceSunken, border: T.border, accent: T.textMuted };

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${c.bg}; border:1px solid ${c.border}; border-radius:8px; margin: 4px 0 8px;">
    <tr><td style="padding: 14px 16px;">
      ${title ? `<p style="margin:0 0 4px; font-family:${FONT_SANS}; font-size:12.5px; font-weight:600; line-height:1.45; color:${c.accent};">${escapeHtml(title)}</p>` : ""}
      <p style="margin:0; font-family:${FONT_SANS}; font-size:12.5px; line-height:1.65; color:${T.textMuted};">${body}</p>
    </td></tr>
  </table>`;
}

/* ── Fallback link block ─────────────────────────────────────────────── */

export function fallbackLink(href: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${T.surfaceSunken}; border:1px solid ${T.border}; border-radius:6px; margin-top:24px;">
    <tr><td style="padding: 12px 16px;">
      <p style="margin:0 0 6px; font-family:${FONT_MONO}; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:${T.textSubtle};">Or copy this link</p>
      <p style="margin:0; font-family:${FONT_MONO}; font-size:11.5px; line-height:1.55; word-break:break-all; color:${T.textMuted};">${escapeHtml(href)}</p>
    </td></tr>
  </table>`;
}

/* ── Spacer ──────────────────────────────────────────────────────────── */

export function spacer(px: number): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td style="height:${px}px; line-height:${px}px; font-size:0;">&nbsp;</td></tr></table>`;
}
