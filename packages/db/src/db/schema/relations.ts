import { relations } from "drizzle-orm";
import { apiKey } from "./apiKey-schema";
import {
  organization,
  organizationOnboardingAnswer,
  organizationLegal,
  member,
  invitation,
} from "./organization-schema";
import { creditTransaction } from "./credit-schema";
import { account, session, user } from "./auth-schema";
import { emailDomain, senderEmailIdentity } from "./domain-schema";
import { organizationBilling, plans } from "./pricing-schema";

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(member),
    invitations: many(invitation),
    apiKeys: many(apiKey),
    emailDomains: many(emailDomain),
    senderEmailIdentities: many(senderEmailIdentity),
    creditTransactions: many(creditTransaction),
    onboardingAnswers: many(organizationOnboardingAnswer),
    legal: one(organizationLegal),
    billing: one(organizationBilling),
  }),
);

export const plansRelations = relations(plans, ({ many }) => ({
  organizationBillings: many(organizationBilling),
}));

export const organizationBillingRelations = relations(
  organizationBilling,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationBilling.organizationId],
      references: [organization.id],
    }),
    plan: one(plans, {
      fields: [organizationBilling.planId],
      references: [plans.id],
    }),
  }),
);

export const organizationOnboardingAnswerRelations = relations(
  organizationOnboardingAnswer,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationOnboardingAnswer.organizationId],
      references: [organization.id],
    }),
  }),
);

export const organizationLegalRelations = relations(
  organizationLegal,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationLegal.organizationId],
      references: [organization.id],
    }),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),

  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),

  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  organization: one(organization, {
    fields: [apiKey.organizationId],
    references: [organization.id],
  }),
  creator: one(user, {
    fields: [apiKey.createdByUserId],
    references: [user.id],
  }),
  revoker: one(user, {
    fields: [apiKey.revokedByUserId],
    references: [user.id],
  }),
}));

export const emailDomainRelations = relations(emailDomain, ({ one, many }) => ({
  organization: one(organization, {
    fields: [emailDomain.organizationId],
    references: [organization.id],
  }),
  senderEmails: many(senderEmailIdentity),
}));

export const senderEmailIdentityRelations = relations(
  senderEmailIdentity,
  ({ one }) => ({
    organization: one(organization, {
      fields: [senderEmailIdentity.organizationId],
      references: [organization.id],
    }),
    domain: one(emailDomain, {
      fields: [senderEmailIdentity.domainId],
      references: [emailDomain.id],
    }),
  }),
);

export const creditTransactionRelations = relations(
  creditTransaction,
  ({ one }) => ({
    organization: one(organization, {
      fields: [creditTransaction.organizationId],
      references: [organization.id],
    }),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
