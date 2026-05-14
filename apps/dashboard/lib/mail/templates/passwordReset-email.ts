export function passwordResetEmailTemplate(url: string) {
  return `
    <div>
      <h1>Reset your password</h1>

      <p>
        This link expires in 1 hour.
      </p>

      <p>
        Click the button below to reset your password.
      </p>

      <a href="${url}">
        Reset Password
      </a>
    </div>
  `;
}
