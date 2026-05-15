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

export function deleteAccountEmailTemplate(url: string): string {
  const body = `
    ${statusBadge({ label: "Destructive action", tone: "danger" })}
    ${spacer(18)}
    ${eyebrow("Account deletion")}
    ${heading("Confirm account deletion")}
    ${paragraph(
      "We received a request to permanently delete your TryNotifly account. This action is <strong style=\"color:#FAFAFA; font-weight:600;\">irreversible</strong> — once confirmed, your projects, API keys, channels, delivery logs, and team memberships will all be removed.",
    )}
    ${ctaButton({ href: url, label: "Confirm deletion", variant: "destructive" })}
    ${spacer(20)}
    ${infoCard({
      label: "Request details",
      rows: [
        { key: "Action", value: "Permanent deletion" },
        { key: "Link expires", value: "in 1 hour" },
        { key: "Reversible", value: "No" },
      ],
    })}
    ${spacer(20)}
    ${noticeCard({
      tone: "danger",
      title: "Didn't request this?",
      body: `Do not click the button above. Sign in and change your password immediately, then reach <a href="mailto:support@trynotifly.com" style="color:#F87171; text-decoration:underline;">support@trynotifly.com</a> so we can investigate.`,
    })}
    ${fallbackLink(url)}
  `;

  return emailLayout({
    title: "Confirm account deletion · TryNotifly",
    preheader:
      "Confirm you want to permanently delete your TryNotifly account. This link expires in 1 hour.",
    body,
  });
}
