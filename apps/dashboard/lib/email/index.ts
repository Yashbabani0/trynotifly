import { Resend } from "resend";
import { getEmailEnv } from "@/lib/env";
import {
  passwordResetEmail,
  verificationEmail,
  welcomeEmail,
} from "./templates/auth";
import { organizationInvitationEmail } from "./templates/organization";
import type { EmailTemplate } from "./templates/base";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    resendClient = new Resend(getEmailEnv().RESEND_API_KEY);
  }

  return resendClient;
}

async function sendTransactionalEmail(input: {
  to: string;
  template: EmailTemplate;
}) {
  const env = getEmailEnv();

  try {
    const response = await getResend().emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.template.subject,
      html: input.template.html,
      text: input.template.text,
    });

    if (response.error) {
      console.error("Resend email failed", {
        to: input.to,
        subject: input.template.subject,
        error: response.error,
      });
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error("Transactional email send failed", {
      to: input.to,
      subject: input.template.subject,
      error,
    });
    throw error;
  }
}

export async function sendPasswordResetEmail(input: {
  to: string;
  userName: string;
  resetUrl: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    template: passwordResetEmail(input),
  });
}

export async function sendEmailVerificationEmail(input: {
  to: string;
  userName: string;
  verificationUrl: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    template: verificationEmail(input),
  });
}

export async function sendOrganizationInvitationEmail(input: {
  to: string;
  inviterName: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    template: organizationInvitationEmail(input),
  });
}

export async function sendWelcomeEmail(input: {
  to: string;
  userName: string;
  dashboardUrl: string;
  organizationName: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    template: welcomeEmail(input),
  });
}
