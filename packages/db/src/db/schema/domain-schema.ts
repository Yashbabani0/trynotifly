import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./organization-schema";

export const emailDomainStatus = pgEnum("email_domain_status", [
  "PENDING",
  "DKIM_PENDING",
  "SPF_PENDING",
  "DMARC_PENDING",
  "MAIL_FROM_PENDING",
  "SES_PENDING",
  "VERIFIED",
  "FAILED",
]);
export type EmailDomainVerificationStatus = "pending" | "verified" | "failed";
export type EmailDomainDnsRecord = {
  step: "DKIM" | "SPF" | "DMARC" | "MAIL_FROM_MX" | "MAIL_FROM_SPF";
  type: "CNAME" | "TXT" | "MX";
  host: string;
  value: string;
  priority?: number;
  status?: EmailDomainVerificationStatus;
  reason?: string;
  actualRecords?: string[];
};

export type EmailDomainVerificationState = {
  ses: {
    verified: boolean;
    status: EmailDomainVerificationStatus;
    dkimStatus?: string;
    mailFromStatus?: string;
    reason?: string;
  };
  dkim: {
    verified: boolean;
    status: EmailDomainVerificationStatus;
    records: EmailDomainDnsRecord[];
  };
  spf: {
    verified: boolean;
    status: EmailDomainVerificationStatus;
    records: EmailDomainDnsRecord[];
  };
  dmarc: {
    verified: boolean;
    status: EmailDomainVerificationStatus;
    records: EmailDomainDnsRecord[];
  };
  mailFromMx: {
    verified: boolean;
    status: EmailDomainVerificationStatus;
    records: EmailDomainDnsRecord[];
  };
  mailFromSpf: {
    verified: boolean;
    status: EmailDomainVerificationStatus;
    records: EmailDomainDnsRecord[];
  };
};

export const emailDomain = pgTable(
  "email_domain",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    domain: varchar("domain", {
      length: 255,
    }).notNull(),
    status: emailDomainStatus("status").notNull().default("PENDING"),
    sesVerified: boolean("ses_verified").notNull().default(false),
    dkimVerified: boolean("dkim_verified").notNull().default(false),
    spfVerified: boolean("spf_verified").notNull().default(false),
    dmarcVerified: boolean("dmarc_verified").notNull().default(false),
    mailFromMxVerified: boolean("mail_from_mx_verified")
      .notNull()
      .default(false),
    mailFromSpfVerified: boolean("mail_from_spf_verified")
      .notNull()
      .default(false),
    fullyVerified: boolean("fully_verified").notNull().default(false),
    verificationState: jsonb("verification_state")
      .$type<EmailDomainVerificationState>()
      .default({
        ses: {
          verified: false,
          status: "pending",
        },
        dkim: {
          verified: false,
          status: "pending",
          records: [],
        },
        spf: {
          verified: false,
          status: "pending",
          records: [],
        },
        dmarc: {
          verified: false,
          status: "pending",
          records: [],
        },
        mailFromMx: {
          verified: false,
          status: "pending",
          records: [],
        },
        mailFromSpf: {
          verified: false,
          status: "pending",
          records: [],
        },
      }),
    dkimTokens: jsonb("dkim_tokens").$type<string[]>().default([]),
    mailFromDomain: varchar("mail_from_domain", {
      length: 255,
    }),
    dnsRecords: jsonb("dns_records")
      .$type<EmailDomainDnsRecord[]>()
      .default([]),
    lastCheckedAt: timestamp("last_checked_at"),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("email_domain_unique_idx").on(
      table.organizationId,
      table.domain,
    ),
    index("email_domain_org_idx").on(table.organizationId),
    index("email_domain_domain_idx").on(table.domain),
    index("email_domain_status_idx").on(table.status),
  ],
);

export type EmailDomain = typeof emailDomain.$inferSelect;

export type NewEmailDomain = typeof emailDomain.$inferInsert;
