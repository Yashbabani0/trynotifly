import { resend } from "@/lib/resend";
import { sendInvitationEmailTemplate } from "./templates/sendInvitation-email";

export async function sendInvitationEmail(
  organizationName: string,
  url: string,
  email: string,
  inviterName: string,
) {
  await resend.emails.send({
    from: "TryNotifly <noreply@yashbabani.com>",

    to: email,

    subject: `Invitation to join ${organizationName}`,

    html: sendInvitationEmailTemplate(organizationName, url, inviterName),
  });
}
