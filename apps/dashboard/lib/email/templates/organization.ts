import { renderBrandedEmail, type EmailTemplate } from "./base";

export function organizationInvitationEmail(input: {
  inviterName: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
}): EmailTemplate {
  return {
    subject: `Join ${input.organizationName} on TryNotifly`,
    html: renderBrandedEmail({
      title: `Join ${input.organizationName}`,
      preview: `${input.inviterName} invited you to TryNotifly.`,
      body: [
        `${input.inviterName} invited you to join ${input.organizationName} as ${input.role}.`,
        "Accept the invitation to collaborate on API keys, channels, sending domains, and notification setup.",
      ],
      cta: {
        label: "Accept invitation",
        url: input.invitationUrl,
      },
    }),
    text: `${input.inviterName} invited you to join ${input.organizationName} on TryNotifly: ${input.invitationUrl}`,
  };
}
