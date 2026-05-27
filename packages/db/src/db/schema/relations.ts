import { relations } from "drizzle-orm";
import { apiKey } from "./apiKey-schema";
import {
  organization,
  organizationLegal,
  member,
  invitation,
} from "./organization-schema";
import { creditTransaction } from "./credit-schema";
import { account, session, user } from "./auth-schema";

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(member),
    invitations: many(invitation),
    apiKeys: many(apiKey),
    creditTransactions: many(creditTransaction),
    legal: one(organizationLegal),
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
}));

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
