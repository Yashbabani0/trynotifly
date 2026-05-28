import { and, asc, db, emailDomain, eq, ne, organization, senderEmailIdentity } from "@trynotifly/db";
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
  SesProviderError,
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

export type DomainVerificationStatus =
  | "pending"
  | "verified"
  | "failed"
  | "not_configured";

export type DomainReadinessStatus =
  | "draft"
  | "dns_pending"
  | "partially_verified"
  | "ready"
  | "suspended"
  | "failed";

export type DomainStatusSummary = {
  sesIdentityStatus: DomainVerificationStatus;
  dkimStatus: DomainVerificationStatus;
  spfStatus: DomainVerificationStatus;
  dmarcStatus: DomainVerificationStatus;
  mailFromMxStatus: DomainVerificationStatus;
  mailFromSpfStatus: DomainVerificationStatus;
  domainStatus: DomainReadinessStatus;
  fullyVerified: boolean;
  pending: string[];
  failed: string[];
  message: string;
};

export type SenderEmailStatus = "active" | "disabled";

export type SenderEmailRecord = typeof senderEmailIdentity.$inferSelect;

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
const localPartPattern =
  /^(?!\.)(?!.*\.\.)[a-z0-9!#$%&'*+/=?^_`{|}~.-]{1,64}(?<!\.)$/i;

function logDomainEvent(event: string, data: Record<string, unknown>) {
  console.info(`domain.${event}`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

function mapUnknownError(error: unknown): DomainApiError {
  if (error instanceof DomainApiError) {
    return error;
  }

  if (error instanceof SesProviderError) {
    return new DomainApiError(
      error.message,
      error.statusCode,
      error.code,
      error.details,
    );
  }

  const maybeDbError = error as {
    code?: string;
    constraint?: string;
    detail?: string;
    message?: string;
    name?: string;
  };

  if (maybeDbError.code === "23503") {
    return new DomainApiError(
      "Organization not found. Complete onboarding before adding a sending domain.",
      404,
      "ORGANIZATION_NOT_FOUND",
      {
        constraint: maybeDbError.constraint,
        detail: maybeDbError.detail,
      },
    );
  }

  if (maybeDbError.code === "23505") {
    return new DomainApiError(
      "This domain already exists in the organization.",
      409,
      "DUPLICATE_DOMAIN",
      {
        constraint: maybeDbError.constraint,
        detail: maybeDbError.detail,
      },
    );
  }

  if (maybeDbError.code === "42703" || maybeDbError.code === "42P01") {
    return new DomainApiError(
      "The domain database schema is not up to date. Run the latest Drizzle migrations.",
      500,
      "DOMAIN_SCHEMA_OUT_OF_DATE",
      {
        code: maybeDbError.code,
        detail: maybeDbError.detail,
      },
    );
  }

  return new DomainApiError(
    maybeDbError.message ?? "Domain request failed unexpectedly.",
    500,
    "DOMAIN_INTERNAL_ERROR",
    {
      name: maybeDbError.name,
      code: maybeDbError.code,
      detail: maybeDbError.detail,
      stack:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.stack
          : undefined,
    },
  );
}

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
  if (domain.startsWith("*.")) {
    throw new DomainApiError(
      "Wildcard domains are not supported. Add the root domain instead.",
      400,
      "WILDCARD_DOMAIN_UNSUPPORTED",
    );
  }

  if (domain.includes("@")) {
    throw new DomainApiError(
      "Enter a domain, not an email address.",
      400,
      "EMAIL_ADDRESS_NOT_ALLOWED",
    );
  }

  if (!domainPattern.test(domain)) {
    throw new DomainApiError("Enter a valid root domain, for example example.com.", 400, "INVALID_DOMAIN");
  }
}

export function normalizeMailFromDomain(input: string) {
  return normalizeDomain(input);
}

export function assertValidMailFromDomain(mailFromDomain: string, rootDomain: string) {
  assertValidDomain(mailFromDomain);

  if (mailFromDomain === rootDomain) {
    throw new DomainApiError(
      "MAIL FROM must be a subdomain, not the root domain.",
      400,
      "MAIL_FROM_ROOT_NOT_ALLOWED",
      { mailFromDomain, rootDomain },
    );
  }

  if (!mailFromDomain.endsWith(`.${rootDomain}`)) {
    throw new DomainApiError(
      "MAIL FROM must be a subdomain of the sending domain.",
      400,
      "MAIL_FROM_OUTSIDE_DOMAIN",
      { mailFromDomain, rootDomain },
    );
  }
}

export function normalizeSenderEmail(input: string) {
  return input.trim().toLowerCase();
}

export function parseSenderEmail(input: string) {
  const email = normalizeSenderEmail(input);
  const parts = email.split("@");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new DomainApiError(
      "Enter a valid sender email address.",
      400,
      "INVALID_SENDER_EMAIL",
      { email: input },
    );
  }

  const [localPart, domain] = parts;

  if (!localPartPattern.test(localPart)) {
    throw new DomainApiError(
      "Sender email local part is malformed.",
      400,
      "INVALID_SENDER_LOCAL_PART",
      { localPart },
    );
  }

  assertValidDomain(domain);

  return {
    email,
    localPart,
    domain,
  };
}

export function getOrganizationId(headers: Record<string, unknown>) {
  const headerValue = headers["x-organization-id"];
  const headerOrganizationId = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const organizationId =
    typeof headerOrganizationId === "string" ? headerOrganizationId : undefined;

  if (!organizationId) {
    throw new DomainApiError(
      "Organization header is required.",
      401,
      "ORGANIZATION_HEADER_REQUIRED",
    );
  }

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
    checkStatus: "checkStatus" in record ? record.checkStatus : undefined,
    queriedHost: "queriedHost" in record ? record.queriedHost : record.name,
    recordType: "recordType" in record ? record.recordType : record.type,
    matched: "matched" in record ? record.matched : false,
    expectedRecords:
      "expectedRecords" in record
        ? record.expectedRecords
        : [record.priority ? `${record.priority} ${record.value}` : record.value],
    reason: "reason" in record ? record.reason : undefined,
    actualRecords: "actualRecords" in record ? record.actualRecords : [],
    resolverServers: "resolverServers" in record ? record.resolverServers : [],
    resolverError: "resolverError" in record ? record.resolverError : undefined,
  };
}

function toPendingResult(record: RequiredDnsRecord, reason = "Record has not been checked yet."): DnsVerificationResult {
  return {
    ...record,
    exists: false,
    valid: false,
    status: "pending",
    checkStatus: "missing",
    queriedHost: record.name,
    recordType: record.type,
    matched: false,
    actualRecords: [],
    expectedRecords: [record.priority ? `${record.priority} ${record.value}` : record.value],
    resolverServers: [],
    reason,
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

function groupStatus(records: DnsVerificationResult[], hasRequiredRecords = true): DomainVerificationStatus {
  if (!hasRequiredRecords || records.length === 0) {
    return "not_configured";
  }

  if (records.every((record) => record.valid)) {
    return "verified";
  }

  if (records.some((record) => record.status === "failed")) {
    return "failed";
  }

  return "pending";
}

function buildStatusSummary(args: {
  ses: SesIdentity | null;
  dkim: DnsVerificationResult[];
  spf: DnsVerificationResult;
  dmarc: DnsVerificationResult;
  mailFromMx: DnsVerificationResult;
  mailFromSpf: DnsVerificationResult;
  hasDkimTokens: boolean;
}): DomainStatusSummary {
  const sesIdentityStatus: DomainVerificationStatus = args.ses?.verified
    ? "verified"
    : "pending";
  const dkimStatus = groupStatus(args.dkim, args.hasDkimTokens);
  const spfStatus = args.spf.status;
  const dmarcStatus = args.dmarc.status;
  const mailFromMxStatus = args.mailFromMx.status;
  const mailFromSpfStatus = args.mailFromSpf.status;

  const statuses = {
    SES: sesIdentityStatus,
    DKIM: dkimStatus,
    SPF: spfStatus,
    DMARC: dmarcStatus,
    "MAIL FROM MX": mailFromMxStatus,
    "MAIL FROM SPF": mailFromSpfStatus,
  };
  const dnsResults = [
    ...args.dkim,
    args.spf,
    args.dmarc,
    args.mailFromMx,
    args.mailFromSpf,
  ];
  const resolverFailed = dnsResults
    .filter((record) => record.checkStatus === "resolver_failed")
    .map((record) => record.step);
  const mismatched = dnsResults
    .filter((record) => record.checkStatus === "mismatch")
    .map((record) => record.step);
  const partiallyMatched = dnsResults
    .filter((record) => record.checkStatus === "partial")
    .map((record) => record.step);
  const missing = dnsResults
    .filter((record) => record.checkStatus === "missing")
    .map((record) => record.step);
  const pending = Object.entries(statuses)
    .filter(([, status]) => status === "pending" || status === "not_configured")
    .map(([label]) => label);
  const failed = Object.entries(statuses)
    .filter(([, status]) => status === "failed")
    .map(([label]) => label);
  const fullyVerified = pending.length === 0 && failed.length === 0;
  const verifiedCount = Object.values(statuses).filter((status) => status === "verified").length;

  let domainStatus: DomainReadinessStatus = "dns_pending";

  if (fullyVerified) {
    domainStatus = "ready";
  } else if (failed.length > 0 || Object.values(statuses).some((status) => status === "not_configured")) {
    domainStatus = "failed";
  } else if (verifiedCount > 0) {
    domainStatus = "partially_verified";
  }

  const message = fullyVerified
    ? "Domain is ready. You can now send email from this domain."
    : failed.length > 0
      ? `Domain verification needs attention: ${failed.join(", ")} ${failed.length === 1 ? "is" : "are"} failing.`
      : pending.some((label) => statuses[label as keyof typeof statuses] === "not_configured")
        ? "Domain verification is missing required provider records. Refresh the provider identity and try again."
      : resolverFailed.length > 0
        ? `DNS resolver failed while checking ${Array.from(new Set(resolverFailed)).join(", ")}. View actual DNS results for the resolver error.`
      : mismatched.length > 0
        ? `DNS mismatch detected for ${Array.from(new Set(mismatched)).join(", ")}. The hostname exists but does not match the expected value.`
      : partiallyMatched.length > 0
        ? `${Array.from(new Set(partiallyMatched)).join(", ")} partially matched. Check priority, region, or exact target value.`
      : missing.length > 0
        ? `${Array.from(new Set(missing)).join(", ")} ${missing.length === 1 ? "is" : "are"} missing at the queried hostname.`
      : sesIdentityStatus === "verified" && dkimStatus === "pending"
        ? "SES identity verified, but DKIM is still pending. DNS propagation can take up to 72 hours."
        : `${pending.join(", ")} ${pending.length === 1 ? "is" : "are"} still pending. DNS propagation can take up to 72 hours.`;

  return {
    sesIdentityStatus,
    dkimStatus,
    spfStatus,
    dmarcStatus,
    mailFromMxStatus,
    mailFromSpfStatus,
    domainStatus,
    fullyVerified,
    pending,
    failed,
    message,
  };
}

function legacyStatusFromSummary(summary: DomainStatusSummary): DomainState {
  if (summary.domainStatus === "ready") {
    return "VERIFIED";
  }

  if (summary.domainStatus === "failed") {
    return "FAILED";
  }

  if (summary.dkimStatus !== "verified") {
    return "DKIM_PENDING";
  }

  if (summary.spfStatus !== "verified") {
    return "SPF_PENDING";
  }

  if (summary.dmarcStatus !== "verified") {
    return "DMARC_PENDING";
  }

  if (summary.mailFromMxStatus !== "verified" || summary.mailFromSpfStatus !== "verified") {
    return "MAIL_FROM_PENDING";
  }

  if (summary.sesIdentityStatus !== "verified") {
    return "SES_PENDING";
  }

  return "PENDING";
}

function summaryFromStoredDomain(domainData: typeof emailDomain.$inferSelect): DomainStatusSummary {
  const storedSummary = domainData.verificationState?.summary;

  if (storedSummary) {
    return storedSummary;
  }

  const statuses: Omit<
    DomainStatusSummary,
    "domainStatus" | "fullyVerified" | "pending" | "failed" | "message"
  > = {
    sesIdentityStatus: domainData.sesVerified ? "verified" : "pending",
    dkimStatus: domainData.dkimVerified ? "verified" : "pending",
    spfStatus: domainData.spfVerified ? "verified" : "pending",
    dmarcStatus: domainData.dmarcVerified ? "verified" : "pending",
    mailFromMxStatus: domainData.mailFromMxVerified ? "verified" : "pending",
    mailFromSpfStatus: domainData.mailFromSpfVerified ? "verified" : "pending",
  };
  const pending = Object.entries(statuses)
    .filter(([, status]) => status === "pending" || status === "not_configured")
    .map(([label]) =>
      label
        .replace("sesIdentityStatus", "SES")
        .replace("dkimStatus", "DKIM")
        .replace("spfStatus", "SPF")
        .replace("dmarcStatus", "DMARC")
        .replace("mailFromMxStatus", "MAIL FROM MX")
        .replace("mailFromSpfStatus", "MAIL FROM SPF"),
    );
  const failed = domainData.status === "FAILED" ? pending : [];
  const fullyVerified = domainData.fullyVerified;
  const domainStatus: DomainReadinessStatus = fullyVerified
    ? "ready"
    : failed.length > 0
      ? "failed"
      : domainData.sesVerified ||
          domainData.dkimVerified ||
          domainData.spfVerified ||
          domainData.dmarcVerified ||
          domainData.mailFromMxVerified ||
          domainData.mailFromSpfVerified
        ? "partially_verified"
        : "dns_pending";

  return {
    ...statuses,
    domainStatus,
    fullyVerified,
    pending,
    failed,
    message: fullyVerified
      ? "Domain is ready. You can now send email from this domain."
      : "DNS setup is incomplete. Add the required records and refresh verification.",
  };
}

function enrichDomain(domainData: typeof emailDomain.$inferSelect) {
  const statusSummary = summaryFromStoredDomain(domainData);

  return {
    ...domainData,
    provider: "AWS SES",
    domainStatus: statusSummary.domainStatus,
    sesIdentityStatus: statusSummary.sesIdentityStatus,
    dkimStatus: statusSummary.dkimStatus,
    spfStatus: statusSummary.spfStatus,
    dmarcStatus: statusSummary.dmarcStatus,
    mailFromMxStatus: statusSummary.mailFromMxStatus,
    mailFromSpfStatus: statusSummary.mailFromSpfStatus,
    mailFromStatus:
      statusSummary.mailFromMxStatus === "verified" && statusSummary.mailFromSpfStatus === "verified"
        ? "verified"
        : statusSummary.mailFromMxStatus === "failed" || statusSummary.mailFromSpfStatus === "failed"
          ? "failed"
          : statusSummary.mailFromMxStatus === "not_configured" ||
              statusSummary.mailFromSpfStatus === "not_configured"
            ? "not_configured"
            : "pending",
    sendingEnabled: statusSummary.domainStatus === "ready",
    lastVerifiedAt: domainData.verifiedAt,
    statusSummary,
  };
}

function isDomainReady(domainData: typeof emailDomain.$inferSelect) {
  return summaryFromStoredDomain(domainData).domainStatus === "ready";
}

function ensureSenderBelongsToDomain(email: string, domain: string) {
  if (!email.endsWith(`@${domain}`)) {
    throw new DomainApiError(
      "Sender email must use the verified domain.",
      400,
      "SENDER_DOMAIN_MISMATCH",
      { email, domain },
    );
  }
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
  const summary = buildStatusSummary({
    ses: args.ses,
    dkim: args.dkim,
    spf: args.spf,
    dmarc: args.dmarc,
    mailFromMx: args.mailFromMx,
    mailFromSpf: args.mailFromSpf,
    hasDkimTokens: args.dkim.length > 0,
  });

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
    summary,
  };
}

export async function createDomain(input: { domain: string; organizationId: string }) {
  const domain = normalizeDomain(input.domain);
  logDomainEvent("create.request", {
    organizationId: input.organizationId,
    rawDomain: input.domain,
    normalizedDomain: domain,
  });

  try {
    assertValidDomain(domain);

    const existingOrganization = await db.query.organization.findFirst({
      where: eq(organization.id, input.organizationId),
    });

    if (!existingOrganization) {
      throw new DomainApiError(
        "Organization not found. Complete onboarding before adding a sending domain.",
        404,
        "ORGANIZATION_NOT_FOUND",
        { organizationId: input.organizationId },
      );
    }

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

    logDomainEvent("ses.identity.lookup", {
      organizationId: input.organizationId,
      domain,
      exists: Boolean(identity),
    });

    if (!identity) {
      identity = await createIdentity(domain);
      logDomainEvent("ses.identity.created", {
        organizationId: input.organizationId,
        domain,
        dkimTokenCount: identity.dkimTokens.length,
      });
    }

    const mailFromDomain = await enableMailFrom(domain, `mail.${domain}`);
    const syncedIdentity = (await getIdentity(domain)) ?? identity;
    const dkimTokens = syncedIdentity.dkimTokens.length > 0 ? syncedIdentity.dkimTokens : identity.dkimTokens;
    const requiredRecords = generateRequiredDnsRecords(domain, dkimTokens, mailFromDomain);
    const dnsRecords = flattenRequiredRecords(requiredRecords).map(toStoredRecord);
    const pendingDkim = requiredRecords.dkim.map((record) =>
      toPendingResult(record, "DKIM CNAME record has not been checked yet."),
    );
    const pendingSpf = toPendingResult(requiredRecords.spf, "Root SPF TXT record has not been checked yet.");
    const pendingDmarc = toPendingResult(requiredRecords.dmarc, "DMARC TXT record has not been checked yet.");
    const pendingMailFromMx = toPendingResult(requiredRecords.mailFromMx, "MAIL FROM MX record has not been checked yet.");
    const pendingMailFromSpf = toPendingResult(requiredRecords.mailFromSpf, "MAIL FROM SPF TXT record has not been checked yet.");
    const statusSummary = buildStatusSummary({
      ses: syncedIdentity,
      dkim: pendingDkim,
      spf: pendingSpf,
      dmarc: pendingDmarc,
      mailFromMx: pendingMailFromMx,
      mailFromSpf: pendingMailFromSpf,
      hasDkimTokens: dkimTokens.length > 0,
    });

    const inserted = await db
      .insert(emailDomain)
      .values({
        organizationId: input.organizationId,
        domain,
        status: legacyStatusFromSummary(statusSummary),
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
          summary: statusSummary,
        },
      })
      .returning();

    const domainRecord = inserted[0];

    if (!domainRecord) {
      throw new DomainApiError("Failed to save domain.", 500, "DB_INSERT_FAILED");
    }

    logDomainEvent("create.success", {
      organizationId: input.organizationId,
      domain,
      domainId: domainRecord.id,
      dnsRecordCount: dnsRecords.length,
      statusMapping: statusSummary,
    });

    return {
      domain: enrichDomain(domainRecord),
      records: groupedRecords(dnsRecords),
      statusSummary,
    };
  } catch (error) {
    const mappedError = mapUnknownError(error);
    logDomainEvent("create.failed", {
      organizationId: input.organizationId,
      domain,
      code: mappedError.code,
      message: mappedError.message,
      details: mappedError.details,
    });
    throw mappedError;
  }
}

export async function syncDomainStatus(domain: string, organizationId?: string) {
  const normalizedDomain = normalizeDomain(domain);
  logDomainEvent("sync.request", {
    organizationId,
    rawDomain: domain,
    normalizedDomain,
  });
  assertValidDomain(normalizedDomain);

  const domainData = await db.query.emailDomain.findFirst({
    where: organizationId
      ? and(eq(emailDomain.organizationId, organizationId), eq(emailDomain.domain, normalizedDomain))
      : eq(emailDomain.domain, normalizedDomain),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  try {
    const ses = await syncVerificationStatus(normalizedDomain);
    const mailFromDomain = domainData.mailFromDomain ?? `mail.${normalizedDomain}`;
    const dnsStatus = await verifyDomainDns(normalizedDomain, domainData.dkimTokens ?? [], mailFromDomain);
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
    const statusSummary = buildStatusSummary({
      ses,
      dkim: dnsStatus.dkim.records,
      spf: dnsStatus.spf,
      dmarc: dnsStatus.dmarc,
      mailFromMx: dnsStatus.mailFromMx,
      mailFromSpf: dnsStatus.mailFromSpf,
      hasDkimTokens: (domainData.dkimTokens ?? []).length > 0,
    });
    const fullyVerified = statusSummary.fullyVerified;
    const status = legacyStatusFromSummary(statusSummary);
    const dnsRecords = [
      ...dnsStatus.dkim.records,
      dnsStatus.spf,
      dnsStatus.dmarc,
      dnsStatus.mailFromMx,
      dnsStatus.mailFromSpf,
    ].map(toStoredRecord);

    logDomainEvent("verification.mapping", {
      domain: normalizedDomain,
      organizationId: domainData.organizationId,
      providerIdentityStatus: ses?.verified ? "verified" : "pending",
      dkimTokens: domainData.dkimTokens ?? [],
      dnsRecordsExpected: dnsRecords.map((record) => ({
        step: record.step,
        type: record.type,
        host: record.host,
        queriedHost: record.queriedHost,
        value: record.priority ? `${record.priority} ${record.value}` : record.value,
      })),
      dnsRecordsFound: dnsRecords.map((record) => ({
        step: record.step,
        host: record.host,
        queriedHost: record.queriedHost,
        actualRecords: record.actualRecords ?? [],
        checkStatus: record.checkStatus,
        matched: record.matched,
        resolverError: record.resolverError,
      })),
      statusMapping: statusSummary,
      nextDomainStatus: statusSummary.domainStatus,
    });

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

    logDomainEvent("sync.success", {
      organizationId: domainData.organizationId,
      domain: normalizedDomain,
      status,
      fullyVerified,
      domainStatus: statusSummary.domainStatus,
      pending: statusSummary.pending,
      failed: statusSummary.failed,
    });

    return {
      domain: enrichDomain(updatedDomain),
      ses,
      dns: dnsStatus,
      records: groupedRecords(dnsRecords),
      statusSummary,
    };
  } catch (error) {
    const mappedError = mapUnknownError(error);
    logDomainEvent("sync.failed", {
      organizationId: domainData.organizationId,
      domain: normalizedDomain,
      code: mappedError.code,
      message: mappedError.message,
      details: mappedError.details,
    });
    throw mappedError;
  }
}

export async function listDomains(organizationId: string) {
  const domains = await db.query.emailDomain.findMany({
    where: eq(emailDomain.organizationId, organizationId),
    orderBy: [asc(emailDomain.createdAt)],
  });

  return domains.map(enrichDomain);
}

export async function getDomainDetails(input: { domain: string; organizationId: string }) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const domainData = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  const dnsRecords = domainData.dnsRecords ?? [];

  return {
    domain: enrichDomain(domainData),
    records: groupedRecords(dnsRecords),
    statusSummary: summaryFromStoredDomain(domainData),
  };
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

export async function updateMailFromDomain(input: {
  domain: string;
  organizationId: string;
  mailFromDomain: string;
}) {
  const domain = normalizeDomain(input.domain);
  const mailFromDomain = normalizeMailFromDomain(input.mailFromDomain);

  logDomainEvent("mail_from.update.request", {
    organizationId: input.organizationId,
    domain,
    rawMailFromDomain: input.mailFromDomain,
    mailFromDomain,
  });

  assertValidDomain(domain);
  assertValidMailFromDomain(mailFromDomain, domain);

  const existingDomain = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!existingDomain) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  try {
    await enableMailFrom(domain, mailFromDomain);

    const requiredRecords = generateRequiredDnsRecords(
      domain,
      existingDomain.dkimTokens ?? [],
      mailFromDomain,
    );
    const existingNonMailFromRecords = (existingDomain.dnsRecords ?? []).filter(
      (record) => record.step !== "MAIL_FROM_MX" && record.step !== "MAIL_FROM_SPF",
    );
    const mailFromRecords = [requiredRecords.mailFromMx, requiredRecords.mailFromSpf].map(toStoredRecord);
    const dnsRecords = [...existingNonMailFromRecords, ...mailFromRecords];
    const existingState = existingDomain.verificationState;
    const nextSummary = summaryFromStoredDomain({
      ...existingDomain,
      mailFromDomain,
      mailFromMxVerified: false,
      mailFromSpfVerified: false,
      fullyVerified: false,
      status: "MAIL_FROM_PENDING",
      dnsRecords,
      verificationState: existingState
        ? {
            ...existingState,
            mailFromMx: {
              verified: false,
              status: "pending",
              records: [toStoredRecord(requiredRecords.mailFromMx)],
            },
            mailFromSpf: {
              verified: false,
              status: "pending",
              records: [toStoredRecord(requiredRecords.mailFromSpf)],
            },
            summary: undefined,
          }
        : existingState,
    });
    const verificationState: EmailDomainVerificationState | undefined = existingState
      ? {
          ...existingState,
          mailFromMx: {
            verified: false,
            status: "pending",
            records: [toStoredRecord(requiredRecords.mailFromMx)],
          },
          mailFromSpf: {
            verified: false,
            status: "pending",
            records: [toStoredRecord(requiredRecords.mailFromSpf)],
          },
          summary: {
            ...nextSummary,
            mailFromMxStatus: "pending",
            mailFromSpfStatus: "pending",
            domainStatus:
              nextSummary.sesIdentityStatus === "verified" ||
              nextSummary.dkimStatus === "verified" ||
              nextSummary.spfStatus === "verified" ||
              nextSummary.dmarcStatus === "verified"
                ? "partially_verified"
                : "dns_pending",
            fullyVerified: false,
            pending: Array.from(new Set([...nextSummary.pending, "MAIL FROM MX", "MAIL FROM SPF"])),
            failed: [],
            message: "MAIL FROM changed. Add the updated MX and TXT records, then refresh verification.",
          },
        }
      : undefined;

    const updated = await db
      .update(emailDomain)
      .set({
        mailFromDomain,
        mailFromMxVerified: false,
        mailFromSpfVerified: false,
        fullyVerified: false,
        status: "MAIL_FROM_PENDING",
        dnsRecords,
        verificationState,
        verifiedAt: null,
        lastCheckedAt: new Date(),
      })
      .where(eq(emailDomain.id, existingDomain.id))
      .returning();

    const updatedDomain = updated[0];

    if (!updatedDomain) {
      throw new DomainApiError("Failed to update MAIL FROM domain.", 500, "DB_UPDATE_FAILED");
    }

    logDomainEvent("mail_from.update.success", {
      organizationId: input.organizationId,
      domain,
      mailFromDomain,
      dnsRecordsExpected: mailFromRecords,
    });

    return {
      domain: enrichDomain(updatedDomain),
      records: groupedRecords(dnsRecords),
      statusSummary: summaryFromStoredDomain(updatedDomain),
    };
  } catch (error) {
    const mappedError = mapUnknownError(error);
    logDomainEvent("mail_from.update.failed", {
      organizationId: input.organizationId,
      domain,
      mailFromDomain,
      code: mappedError.code,
      message: mappedError.message,
      details: mappedError.details,
    });
    throw mappedError;
  }
}

export async function listSenderEmails(input: {
  organizationId: string;
  domain: string;
}) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const domainData = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  const senders = await db.query.senderEmailIdentity.findMany({
    where: and(
      eq(senderEmailIdentity.organizationId, input.organizationId),
      eq(senderEmailIdentity.domainId, domainData.id),
    ),
    orderBy: [asc(senderEmailIdentity.createdAt)],
  });

  return {
    domain: enrichDomain(domainData),
    senders,
  };
}

export async function createSenderEmail(input: {
  organizationId: string;
  domain: string;
  email: string;
  displayName?: string | null;
  isDefault?: boolean;
}) {
  const domain = normalizeDomain(input.domain);
  const parsed = parseSenderEmail(input.email);

  assertValidDomain(domain);
  ensureSenderBelongsToDomain(parsed.email, domain);

  const domainData = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  if (!isDomainReady(domainData)) {
    throw new DomainApiError(
      "Domain must be fully verified before sender emails can be activated.",
      409,
      "DOMAIN_NOT_READY_FOR_SENDERS",
      {
        domain,
        domainStatus: summaryFromStoredDomain(domainData).domainStatus,
      },
    );
  }

  const existing = await db.query.senderEmailIdentity.findFirst({
    where: and(
      eq(senderEmailIdentity.organizationId, input.organizationId),
      eq(senderEmailIdentity.email, parsed.email),
    ),
  });

  if (existing) {
    throw new DomainApiError(
      "This sender email already exists in the organization.",
      409,
      "DUPLICATE_SENDER_EMAIL",
      { email: parsed.email },
    );
  }

  const existingSenders = await db.query.senderEmailIdentity.findMany({
    where: and(
      eq(senderEmailIdentity.organizationId, input.organizationId),
      eq(senderEmailIdentity.domainId, domainData.id),
    ),
    limit: 1,
  });
  const shouldBeDefault = input.isDefault ?? existingSenders.length === 0;

  const inserted = await db.transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx
        .update(senderEmailIdentity)
        .set({ isDefault: false })
        .where(eq(senderEmailIdentity.domainId, domainData.id));
    }

    return tx
      .insert(senderEmailIdentity)
      .values({
        organizationId: input.organizationId,
        domainId: domainData.id,
        email: parsed.email,
        localPart: parsed.localPart,
        displayName: input.displayName?.trim() || null,
        isDefault: shouldBeDefault,
        status: "active",
      })
      .returning();
  });

  const sender = inserted[0];

  if (!sender) {
    throw new DomainApiError("Failed to create sender email.", 500, "DB_INSERT_FAILED");
  }

  logDomainEvent("sender.create.success", {
    organizationId: input.organizationId,
    domain,
    senderEmail: sender.email,
    isDefault: sender.isDefault,
  });

  return {
    sender,
  };
}

export async function setDefaultSenderEmail(input: {
  organizationId: string;
  domain: string;
  senderId: string;
}) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const domainData = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  const sender = await db.query.senderEmailIdentity.findFirst({
    where: and(
      eq(senderEmailIdentity.id, input.senderId),
      eq(senderEmailIdentity.organizationId, input.organizationId),
      eq(senderEmailIdentity.domainId, domainData.id),
    ),
  });

  if (!sender) {
    throw new DomainApiError("Sender email not found.", 404, "SENDER_EMAIL_NOT_FOUND");
  }

  if (sender.status !== "active") {
    throw new DomainApiError(
      "Only active sender emails can be set as default.",
      409,
      "SENDER_EMAIL_DISABLED",
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(senderEmailIdentity)
      .set({ isDefault: false })
      .where(eq(senderEmailIdentity.domainId, domainData.id));
    await tx
      .update(senderEmailIdentity)
      .set({ isDefault: true })
      .where(eq(senderEmailIdentity.id, sender.id));
  });

  return listSenderEmails({ organizationId: input.organizationId, domain });
}

export async function updateSenderEmailStatus(input: {
  organizationId: string;
  domain: string;
  senderId: string;
  status: SenderEmailStatus;
}) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const domainData = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  const sender = await db.query.senderEmailIdentity.findFirst({
    where: and(
      eq(senderEmailIdentity.id, input.senderId),
      eq(senderEmailIdentity.organizationId, input.organizationId),
      eq(senderEmailIdentity.domainId, domainData.id),
    ),
  });

  if (!sender) {
    throw new DomainApiError("Sender email not found.", 404, "SENDER_EMAIL_NOT_FOUND");
  }

  const updated = await db
    .update(senderEmailIdentity)
    .set({
      status: input.status,
      isDefault: input.status === "disabled" ? false : sender.isDefault,
    })
    .where(eq(senderEmailIdentity.id, sender.id))
    .returning();

  return {
    sender: updated[0],
  };
}

export async function deleteSenderEmail(input: {
  organizationId: string;
  domain: string;
  senderId: string;
}) {
  const domain = normalizeDomain(input.domain);
  assertValidDomain(domain);

  const domainData = await db.query.emailDomain.findFirst({
    where: and(eq(emailDomain.organizationId, input.organizationId), eq(emailDomain.domain, domain)),
  });

  if (!domainData) {
    throw new DomainApiError("Domain not found.", 404, "DOMAIN_NOT_FOUND");
  }

  const sender = await db.query.senderEmailIdentity.findFirst({
    where: and(
      eq(senderEmailIdentity.id, input.senderId),
      eq(senderEmailIdentity.organizationId, input.organizationId),
      eq(senderEmailIdentity.domainId, domainData.id),
    ),
  });

  if (!sender) {
    throw new DomainApiError("Sender email not found.", 404, "SENDER_EMAIL_NOT_FOUND");
  }

  await db.delete(senderEmailIdentity).where(eq(senderEmailIdentity.id, sender.id));

  return {
    deleted: true,
    senderId: sender.id,
  };
}

export async function validateSenderForSend(input: {
  organizationId: string;
  from: string;
  requireExplicitSender?: boolean;
}) {
  const parsed = parseSenderEmail(input.from);
  const domainData = await db.query.emailDomain.findFirst({
    where: and(
      eq(emailDomain.organizationId, input.organizationId),
      eq(emailDomain.domain, parsed.domain),
    ),
  });

  if (!domainData) {
    throw new DomainApiError(
      "From address domain is not verified in this organization.",
      403,
      "FROM_DOMAIN_NOT_VERIFIED",
      { from: parsed.email, domain: parsed.domain },
    );
  }

  if (!isDomainReady(domainData)) {
    throw new DomainApiError(
      "From address domain is not ready for sending.",
      409,
      "FROM_DOMAIN_NOT_READY",
      { from: parsed.email, domainStatus: summaryFromStoredDomain(domainData).domainStatus },
    );
  }

  if (input.requireExplicitSender ?? true) {
    const sender = await db.query.senderEmailIdentity.findFirst({
      where: and(
        eq(senderEmailIdentity.organizationId, input.organizationId),
        eq(senderEmailIdentity.email, parsed.email),
      ),
    });

    if (!sender) {
      throw new DomainApiError(
        "From address is not approved. Add it as a sender email before sending.",
        403,
        "FROM_SENDER_NOT_APPROVED",
        { from: parsed.email },
      );
    }

    if (sender.status !== "active") {
      throw new DomainApiError(
        "From address sender email is disabled.",
        403,
        "FROM_SENDER_DISABLED",
        { from: parsed.email },
      );
    }

    return {
      allowed: true,
      domain: enrichDomain(domainData),
      sender,
    };
  }

  return {
    allowed: true,
    domain: enrichDomain(domainData),
    sender: null,
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
