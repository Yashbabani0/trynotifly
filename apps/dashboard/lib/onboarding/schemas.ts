import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(64, "Password must be 64 characters or fewer."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(64, "Password must be 64 characters or fewer."),
    confirmPassword: z.string(),
    token: z.string().min(1, "Reset token is missing."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const organizationStepSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required.").max(80),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  industry: z.string().min(1, "Select an industry."),
  useCase: z.string().min(1, "Select a use case."),
  teamSize: z.string().min(1, "Select a team size."),
  timezone: z.string().min(1, "Select a timezone."),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .pipe(z.string().url("Enter a valid URL.").optional()),
});

export const profileStepSchema = z.object({
  platformUse: z.string().min(1, "Select what you will use TryNotifly for."),
  expectedVolume: z.string().min(1, "Select an expected volume."),
  preferredChannels: z
    .array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP", "IN_APP"]))
    .min(1, "Select at least one channel."),
  teamRole: z.string().min(1, "Select your role."),
  experienceLevel: z.string().min(1, "Select your experience level."),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["admin", "member"]),
});

export const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation id is required."),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OrganizationStepInput = z.infer<typeof organizationStepSchema>;
export type ProfileStepInput = z.infer<typeof profileStepSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
