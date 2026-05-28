export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderBrandedEmail({
  title,
  preview,
  body,
  cta,
}: {
  title: string;
  preview: string;
  body: string[];
  cta?: {
    label: string;
    url: string;
  };
}) {
  const safeTitle = escapeHtml(title);
  const safePreview = escapeHtml(preview);
  const paragraphs = body
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:24px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  const button = cta
    ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;border-radius:12px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;line-height:20px;padding:12px 18px;text-decoration:none;">${escapeHtml(cta.label)}</a>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${safePreview}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 16px;">
                <div style="font-size:18px;font-weight:800;color:#18181b;">TryNotifly</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <h1 style="margin:0 0 14px;color:#18181b;font-size:28px;line-height:34px;">${safeTitle}</h1>
                ${paragraphs}
                ${button ? `<div style="margin-top:24px;">${button}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e4e4e7;padding:18px 28px;color:#71717a;font-size:12px;line-height:18px;">
                You received this email because your address is used with TryNotifly.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
