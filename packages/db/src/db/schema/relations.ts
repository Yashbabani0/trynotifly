import { relations } from "drizzle-orm";
import { apiKey } from "./apiKey-schema";
import {
  organization,
  organizationLegal,
  organizationMember,
} from "./organization-schema";
import { creditTransaction } from "./credit-schema";

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(organizationMember),
    apiKeys: many(apiKey),
    creditTransactions: many(creditTransaction),
    legal: one(organizationLegal),
  }),
);

export const organizationMemberRelations = relations(
  organizationMember,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationMember.organizationId],
      references: [organization.id],
    }),
  }),
);

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

export const organizationLegalRelations = relations(
  organizationLegal,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationLegal.organizationId],
      references: [organization.id],
    }),
  }),
);
