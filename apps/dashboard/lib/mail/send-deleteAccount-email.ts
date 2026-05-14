import { resend } from "@/lib/resend";
import { deleteAccountEmailTemplate } from "./templates/deleteAccount-email";

export async function sendDeleteAccountEmail(email: string, url: string) {
  await resend.emails.send({
    from: "TryNotifly <noreply@yashbabani.com>",

    to: email,

    subject: "Confirm account deletion",

    html: deleteAccountEmailTemplate(url),
  });
}
