export function deleteAccountEmailTemplate(url: string) {
  return `
    <div>
      <h1>Confirm account deletion</h1>

      <p>
        We received a request to delete your TryNotifly account.
      </p>

      <p>
        This action cannot be undone.
      </p>

      <a href="${url}">
        Delete Account
      </a>

      <p>
        This link expires in 1 hour.
      </p>

      <p>
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;
}