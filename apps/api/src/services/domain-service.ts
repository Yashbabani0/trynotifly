import { and, asc, db, emailDomain, eq, ne } from "@trynotifly/db";
import type {
  EmailDomainDnsRecord,
  EmailDomainVerificationState,
} from "@trynotifly/db";
import {
  createIdentity,
  deleteIdentity,
  enableMailFrom,
  generateRequiredDnsRecords,
  getIdentity,
  syncVerificationStatus,
  verifyDomainDns,
  type DnsVerificationResult,
  type RequiredDnsRecord,
  type SesIdentity,
} from "@trynotifly/email";

export type DomainState =
  | "PENDING"
  | "DKIM_PENDING"
  | "SPF_PENDING"
  | "DMARC_PENDING"
  | "MAIL_FROM_PENDING"
  | "SES_PENDING"
  | "VERIFIED"
  | "FAILED";

export class DomainApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

const domainPattern =
  /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/;

export function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export function assertValidDomain(domain: string) {
  if (!domainPattern.test(domain)) {
    throw new DomainApiError("Enter a valid root domain, for example example.com.", 400, "INVALID_DOMAIN");
  }
}

export function getOrganizationId(headers: Record<string, unknown>, body?: { organizationId?: string }) {
  const headerValue = headers["x-organization-id"];
  const headerOrganizationId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const organizationId =
    body?.organizationId ??
    (typeof headerOrganizationId === "string" ? headerOrganizationId : undefined) ??
    process.env.DEFAULT_ORGANIZATION_ID ??
    "b7e67033-8f64-450f-b535-82342bfd508a";

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId)) {
    throw new DomainApiError("A valid organization id is required.", 400, "INVALID_ORGANIZATION");
  }

  return organizationId;
}

function flattenRequiredRecords(records: ReturnType<typeof generateRequiredDnsRecords>) {
  return [
    ...records.dkim,
    records.spf,
    records.dmarc,
    records.mailFromMx,
    records.mailFromSpf,
  ];
}

function toStoredRecord(record: RequiredDnsRecord | DnsVerificationResult): EmailDomainDnsRecord {
  return {
    step: record.step,
    type: record.type,
    host: record.host,
    value: record.value,
    priority: record.priority,
    status: "status" in record ? record.status : "pending",
    reason: "reason" in record ? record.reason : undefined,
    actualRecords: "actualRecords" in record ? record.actualRecords : [],
  };
}

function groupedRecords(records: EmailDomainDnsRecord[]) {
  return {
    dkim: records.filter((record) => record.step === "DKIM"),
    spf: records.filter((record) => record.step === "SPF"),
    dmarc: records.filter((record) => record.step === "DMARC"),
    mailFromMx: records.filter((record) => record.step === "MAIL_FROM_MX"),
    mailFromSpf: records.filter((record) => record.step === "MAIL_FROM_SPF"),
  };
}

function computeStatus(args: {
  sesVerified: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  mailFromMxVerified: boolean;
  mailFromSpfVerified: boolean;
  hasDkimTokens: boolean;
}): DomainState {
  if (
    args.sesVerified &&
    args.dkimVerified &&
    args.spfVerified &&
    args.dmarcVerified &&
    args.mailFromMxVerified &&
    args.mailFromSpfVerified
  ) {
    return "VERIFIED";
  }

  if (!args.hasDkimTokens) {
    return "FAILED";
  }

  if (!args.dkimVerified) {
    return "DKIM_PENDING";
  }

  if (!args.spfVerified) {
    return "SPF_PENDING";
  }

  if (!args.dmarcVerified) {
    return "DMARC_PENDING";
  }

  if (!args.mailFromMxVerified || !args.mailFromSpfVerified) {
    return "MAIL_FROM_PENDING";
  }

  if (!args.sesVerified) {
    return "SES_PENDING";
  }

  return "PENDING";
}

function buildVerificationState(args: {
  ses: SesIdentity | null;
  dkim: DnsVerificationResult[];
  spf: DnsVerificationResult;
  dmarc: DnsVerificationResult;
  mailFromMx: DnsVerificationResult;
  mailFromSpf: DnsVerificationResult;
}): EmailDomainVerificationState {
  const sesVerified = Boolean(args.ses?.verified);

  return {
    ses: {
      verified: sesVerified,
      status: sesVerified ? "verified" : "pending",
      dkimStatus: args.ses?.dkimStatus,
      mailFromStatus: args.ses?.mailFromStatus,
      reason: sesVerified ? undefined : "Amazon SES has not marked this identity ready for sending yet.",
    },
    dkim: {
      verified: args.dkim.length > 0 && args.dkim.every((record) => record.valid),
      status: args.dkim.length > 0 && args.dkim.every((record) => record.valid) ? "verified" : "pending",
      records: args.dkim.map(toStoredRecord),
    },
    spf: {
      verified: args.spf.valid,
      status: args.spf.status,
      records: [toStoredRecord(args.spf)],
    },
    dmarc: {
      verified: args.dmarc.valid,
      status: args.dmarc.status,
      records: [toStoredRecord(args.dmarc)],
    },
    mailFromMx: {
      verified: args.mailFromMx.valid,
      status: args.mailFromMx.status,
      records: [toStoredRecord(args.mailFromMx)],
    },
    mailFromSpf: {
      verified: args.mailFromSpf.valid,
      status: args.mailFromSpf.status,
      records: [toStoredRecord(args.mailFromSpf)],
    },
  };
}

export async function createDomain(input: { domain: string; organizationId: string }) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const existingDomain = await db.query.emailDomain.findFirst({
    where: and(
      eq(emailDomain.organizationId, input.organizationId),
      eq(emailDomain.domain, domain),
    ),
  });

  if (existingDomain) {
    throw new DomainApiError("This domain already exists in the organization.", 409, "DUPLICATE_DOMAIN", {
      domain,
    });
  }

  let identity = await getIdentity(domain);

  if (!identity) {
    identity = await createIdentity(domain);
  }

  const mailFromDomain = await enableMailFrom(domain, `mail.${domain}`);
  const syncedIdentity = (await getIdentity(domain)) ?? identity;
  const dkimTokens = syncedIdentity.dkimTokens.length > 0 ? syncedIdentity.dkimTokens : identity.dkimTokens;
  const requiredRecords = generateRequiredDnsRecords(domain, dkimTokens);
  const dnsRecords = flattenRequiredRecords(requiredRecords).map(toStoredRecord);

  const inserted = await db
    .insert(emailDomain)
    .values({
      organizationId: input.organizationId,
      domain,
      status: dkimTokens.length > 0 ? "PENDING" : "FAILED",
      sesVerified: syncedIdentity.verified,
      dkimTokens,
      mailFromDomain,
      dnsRecords,
      verificationState: {
        ses: {
          verified: syncedIdentity.verified,
          status: syncedIdentity.verified ? "verified" : "pending",
          dkimStatus: syncedIdentity.dkimStatus,
          mailFromStatus: syncedIdentity.mailFromStatus,
        },
        dkim: {
          verified: false,
          status: "pending",
          records: dnsRecords.filter((record) => record.step === "DKIM"),
        },
        spf: {
          verified: false,
          status: "pending",
          records: dnsRecords.filter((record) => record.step === "SPF"),
        },
        dmarc: {
          verified: false,
          status: "pending",
          records: dnsRecords.filter((record) => record.step === "DMARC"),
        },
        mailFromMx: {
          verified: false,
          status: "pending",
          records: dnsRecords.filter((record) => record.step === "MAIL_FROM_MX"),
        },
        mailFromSpf: {
          verified: false,
          status: "pending",
          records: dnsRecords.filter((record) => record.step === "MAIL_FROM_SPF"),
        },
      },
    })
    .returning();

  const domainRecord = inserted[0];

  if (!domainRecord) {
    throw new DomainApiError("Failed to save domain.", 500, "DB_INSERT_FAILED");
  }

  return {
    domain: domainRecord,
    records: groupedRecords(dnsRecords),
  };
}

export async function syncDomainStatus(domain: string, organizationId?: string) {
  const normalizedDomain = normalizeDomain(domain);
  assertValidDomain(normalizedDomain);

  const domainData = await db.query.emailDomain.findFirst({
    where: organizationId
      ? and(eq(emailDomain.organizationId, organizationId), eq(emailDomain.domain, normalizedDomain))
      : eq(emailDomain.domain, normalizedDomain),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  const ses = await syncVerificationStatus(normalizedDomain);
  const dnsStatus = await verifyDomainDns(normalizedDomain, domainData.dkimTokens ?? []);
  const state = buildVerificationState({
    ses,
    dkim: dnsStatus.dkim.records,
    spf: dnsStatus.spf,
    dmarc: dnsStatus.dmarc,
    mailFromMx: dnsStatus.mailFromMx,
    mailFromSpf: dnsStatus.mailFromSpf,
  });

  const sesVerified = Boolean(ses?.verified);
  const dkimVerified = dnsStatus.dkim.verified;
  const spfVerified = dnsStatus.spf.valid;
  const dmarcVerified = dnsStatus.dmarc.valid;
  const mailFromMxVerified = dnsStatus.mailFromMx.valid;
  const mailFromSpfVerified = dnsStatus.mailFromSpf.valid;
  const fullyVerified =
    sesVerified &&
    dkimVerified &&
    spfVerified &&
    dmarcVerified &&
    mailFromMxVerified &&
    mailFromSpfVerified;
  const status = computeStatus({
    sesVerified,
    dkimVerified,
    spfVerified,
    dmarcVerified,
    mailFromMxVerified,
    mailFromSpfVerified,
    hasDkimTokens: (domainData.dkimTokens ?? []).length > 0,
  });
  const dnsRecords = [
    ...dnsStatus.dkim.records,
    dnsStatus.spf,
    dnsStatus.dmarc,
    dnsStatus.mailFromMx,
    dnsStatus.mailFromSpf,
  ].map(toStoredRecord);

  const updated = await db
    .update(emailDomain)
    .set({
      status,
      sesVerified,
      dkimVerified,
      spfVerified,
      dmarcVerified,
      mailFromMxVerified,
      mailFromSpfVerified,
      fullyVerified,
      verificationState: state,
      dnsRecords,
      lastCheckedAt: new Date(),
      verifiedAt: fullyVerified ? (domainData.verifiedAt ?? new Date()) : null,
    })
    .where(eq(emailDomain.id, domainData.id))
    .returning();

  const updatedDomain = updated[0];

  if (!updatedDomain) {
    throw new DomainApiError("Failed to update domain.", 500, "DB_UPDATE_FAILED");
  }

  return {
    domain: updatedDomain,
    ses,
    dns: dnsStatus,
    records: groupedRecords(dnsRecords),
  };
}

export async function listDomains(organizationId: string) {
  return db.query.emailDomain.findMany({
    where: eq(emailDomain.organizationId, organizationId),
    orderBy: [asc(emailDomain.createdAt)],
  });
}

export async function deleteDomain(input: { domain: string; organizationId: string }) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const existingDomain = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!existingDomain) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  await deleteIdentity(domain);
  await db.delete(emailDomain).where(eq(emailDomain.id, existingDomain.id));

  return {
    domain,
    deleted: true,
  };
}

export async function pollPendingDomains(limit = 25) {
  const pendingDomains = await db.query.emailDomain.findMany({
    where: ne(emailDomain.status, "VERIFIED"),
    orderBy: [asc(emailDomain.lastCheckedAt), asc(emailDomain.createdAt)],
    limit,
  });

  const results = [];

  for (const domainData of pendingDomains) {
    try {
      results.push(await syncDomainStatus(domainData.domain, domainData.organizationId));
    } catch (error) {
      results.push({
        domain: domainData.domain,
        error,
      });
    }
  }

  return results;
}
