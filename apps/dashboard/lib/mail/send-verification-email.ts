import { resend } from "@/lib/resend";

import { verificationEmailTemplate } from "./templates/verification-email";

export async function sendVerificationEmail(email: string, url: string) {
  await resend.emails.send({
    from: "TryNotifly <noreply@yashbabani.com>",

    to: email,

    subject: "Verify your email",

    html: verificationEmailTemplate(url),
  });
}
