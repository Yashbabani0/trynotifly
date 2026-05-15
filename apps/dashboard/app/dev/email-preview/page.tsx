import { deleteAccountEmailTemplate } from "@/lib/mail/templates/deleteAccount-email";
import { passwordResetEmailTemplate } from "@/lib/mail/templates/passwordReset-email";
import { sendInvitationEmailTemplate } from "@/lib/mail/templates/sendInvitation-email";
import { verificationEmailTemplate } from "@/lib/mail/templates/verification-email";

export default function EmailPreviewPage() {
  //   const html = verificationEmailTemplate(
  //     "https://trynotifly.com/verify?token=test123",
  //   );

  // switch template here:
  //   const html = passwordResetEmailTemplate("https://example.com");
  //   const html = deleteAccountEmailTemplate("https://example.com");
  const html = sendInvitationEmailTemplate(
    "Acme Inc",
    "https://example.com",
    "Yash",
  );

  return (
    <div className="min-h-screen bg-black p-10 overflow-auto">
      <div
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </div>
  );
}
