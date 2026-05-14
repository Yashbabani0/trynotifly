export function sendInvitationEmailTemplate(
  organizationName: string,
  url: string,
  inviterName: string,
) {
  return `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
        color: #111827;
      "
    >
      <h1
        style="
          font-size: 24px;
          margin-bottom: 16px;
        "
      >
        You're invited to join ${organizationName}
      </h1>

      <p style="margin-bottom: 16px;">
        <strong>${inviterName}</strong> invited you to join
        <strong>${organizationName}</strong> on TryNotifly.
      </p>

      <p style="margin-bottom: 24px;">
        This invitation expires in 7 days.
      </p>

      <a
        href="${url}"
        style="
          display: inline-block;
          background-color: #111827;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        "
      >
        Accept Invitation
      </a>

      <p
        style="
          margin-top: 32px;
          font-size: 14px;
          color: #6b7280;
        "
      >
        If you were not expecting this invitation,
        you can safely ignore this email.
      </p>
    </div>
  `;
}
