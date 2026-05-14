export function verificationEmailTemplate(url: string) {
  return `
    <div>
      <h1>Verify your email</h1>

      <p>
        Click the button below to verify your account.
      </p>

      <a href="${url}">
        Verify Email
      </a>
    </div>
  `;
}
