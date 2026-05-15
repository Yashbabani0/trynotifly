import {
  ctaButton,
  emailLayout,
  esc,
  eyebrow,
  fallbackLink,
  heading,
  infoCard,
  noticeCard,
  paragraph,
  spacer,
  statusBadge,
} from "./_primitives";

export function sendInvitationEmailTemplate(
  organizationName: string,
  url: string,
  inviterName: string,
): string {
  const safeOrg = esc(organizationName);
  const safeInviter = esc(inviterName);

  const body = `
    ${statusBadge({ label: "Workspace invitation", tone: "success" })}
    ${spacer(18)}
    ${eyebrow("Team invitation")}
    ${heading(`Join ${organizationName} on TryNotifly`)}
    ${paragraph(
      `<strong style="color:#FAFAFA; font-weight:600;">${safeInviter}</strong> added you to the <strong style="color:#FAFAFA; font-weight:600;">${safeOrg}</strong> workspace. Accept to start collaborating on notification routing, channels, logs, and delivery analytics.`,
    )}
    ${ctaButton({ href: url, label: "Accept invitation" })}
    ${spacer(20)}
    ${infoCard({
      label: "Invitation details",
      rows: [
        { key: "Workspace", value: organizationName },
        { key: "Invited by", value: inviterName },
        { key: "Role", value: "Member" },
        { key: "Expires", value: "in 7 days" },
      ],
    })}
    ${spacer(20)}
    ${noticeCard({
      tone: "info",
      body: `If you don't recognize ${safeInviter} or weren't expecting this invitation, you can safely ignore this email — no account will be created without your consent.`,
    })}
    ${fallbackLink(url)}
  `;

  return emailLayout({
    title: `Invitation to join ${organizationName} · TryNotifly`,
    preheader: `${inviterName} invited you to ${organizationName} on TryNotifly.`,
    body,
  });
}
