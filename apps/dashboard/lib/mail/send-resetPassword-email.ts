import { resend } from "@/lib/resend";
import { passwordResetEmailTemplate } from "./templates/passwordReset-email";

export async function sendPasswordResetEmail(email: string, url: string) {
  await resend.emails.send({
    from: "TryNotifly <noreply@yashbabani.com>",

    to: email,

    subject: "Reset your password",

    html: passwordResetEmailTemplate(url),
  });
}
