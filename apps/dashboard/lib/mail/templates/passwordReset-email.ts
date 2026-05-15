import {
  ctaButton,
  emailLayout,
  eyebrow,
  fallbackLink,
  heading,
  infoCard,
  noticeCard,
  paragraph,
  spacer,
  statusBadge,
} from "./_primitives";

export function passwordResetEmailTemplate(url: string): string {
  const body = `
    ${statusBadge({ label: "Security action", tone: "warning" })}
    ${spacer(18)}
    ${eyebrow("Password reset")}
    ${heading("Reset your password")}
    ${paragraph(
      "We received a request to reset the password for your TryNotifly account. Use the secure link below to choose a new one — your existing sessions will stay signed in until you complete the reset.",
    )}
    ${ctaButton({ href: url, label: "Reset password" })}
    ${spacer(20)}
    ${infoCard({
      label: "Request details",
      rows: [
        { key: "Action", value: "Password reset" },
        { key: "Link expires", value: "in 1 hour" },
        { key: "Single-use", value: "Yes" },
      ],
    })}
    ${spacer(20)}
    ${noticeCard({
      tone: "warning",
      title: "Didn't request this?",
      body: `Your account is still safe — this link only works once and expires soon. If you're seeing repeated requests you didn't make, rotate your password and contact <a href="mailto:support@trynotifly.com" style="color:#A3A3AB; text-decoration:underline;">support@trynotifly.com</a>.`,
    })}
    ${fallbackLink(url)}
  `;

  return emailLayout({
    title: "Reset your password · TryNotifly",
    preheader:
      "Reset the password on your TryNotifly account. This link expires in 1 hour.",
    body,
  });
}
