import dns from "node:dns/promises";
import { getSesRegion } from "./ses";

export type DnsRecordStep =
  | "DKIM"
  | "SPF"
  | "DMARC"
  | "MAIL_FROM_MX"
  | "MAIL_FROM_SPF";

export type DnsRecordType = "CNAME" | "TXT" | "MX";
export type DnsCheckStatus =
  | "verified"
  | "partial"
  | "mismatch"
  | "missing"
  | "resolver_failed";

export type RequiredDnsRecord = {
  step: DnsRecordStep;
  type: DnsRecordType;
  host: string;
  name: string;
  value: string;
  priority?: number;
};

export type DnsVerificationResult = RequiredDnsRecord & {
  exists: boolean;
  valid: boolean;
  status: "pending" | "verified" | "failed";
  checkStatus: DnsCheckStatus;
  queriedHost: string;
  recordType: DnsRecordType;
  matched: boolean;
  actualRecords: string[];
  expectedRecords: string[];
  resolverServers: string[];
  resolverError?: {
    code?: string;
    message: string;
  };
  reason?: string;
};

export type DomainDnsVerification = {
  dkim: {
    verified: boolean;
    records: DnsVerificationResult[];
  };
  spf: DnsVerificationResult;
  dmarc: DnsVerificationResult;
  mailFromMx: DnsVerificationResult;
  mailFromSpf: DnsVerificationResult;
};

function trimDot(value: string) {
  return value.toLowerCase().replace(/\.$/, "");
}

function flattenTxt(records: string[][]) {
  return records.map((record) => record.join("").trim());
}

function normalizeTxt(value: string) {
  return value.replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function toStatus(valid: boolean, checkStatus: DnsCheckStatus) {
  if (valid) {
    return "verified" as const;
  }

  return checkStatus === "mismatch" ? ("failed" as const) : ("pending" as const);
}

function getResolverServers() {
  const configured = process.env.DNS_RESOLVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (configured?.length) {
    return configured;
  }

  return ["1.1.1.1", "8.8.8.8"];
}

function createResolver() {
  const resolver = new dns.Resolver();
  const servers = getResolverServers();

  if (servers.length > 0) {
    resolver.setServers(servers);
  }

  return {
    resolver,
    servers,
  };
}

function dnsErrorStatus(error: unknown): DnsCheckStatus {
  const code = (error as { code?: string }).code;

  if (
    code === "ENODATA" ||
    code === "ENOTFOUND" ||
    code === "ENODOMAIN" ||
    code === "NOTFOUND"
  ) {
    return "missing";
  }

  return "resolver_failed";
}

function dnsErrorReason(type: DnsRecordType, status: DnsCheckStatus) {
  if (status === "missing") {
    return `${type} record was not found at the queried hostname.`;
  }

  return `${type} lookup failed. Try again or check the resolver response below.`;
}

export function generateRequiredDnsRecords(
  domain: string,
  dkimTokens: string[],
  mailFromDomain = `mail.${domain}`,
) {
  const region = getSesRegion();
  const mailFromHost = mailFromDomain.endsWith(`.${domain}`)
    ? mailFromDomain.slice(0, -(domain.length + 1))
    : mailFromDomain;

  return {
    dkim: dkimTokens.map((token) => ({
      step: "DKIM" as const,
      type: "CNAME" as const,
      host: `${token}._domainkey`,
      name: `${token}._domainkey.${domain}`,
      value: `${token}.dkim.amazonses.com`,
    })),
    spf: {
      step: "SPF" as const,
      type: "TXT" as const,
      host: "@",
      name: domain,
      value: "v=spf1 include:amazonses.com ~all",
    },
    dmarc: {
      step: "DMARC" as const,
      type: "TXT" as const,
      host: "_dmarc",
      name: `_dmarc.${domain}`,
      value: "v=DMARC1; p=none;",
    },
    mailFromMx: {
      step: "MAIL_FROM_MX" as const,
      type: "MX" as const,
      host: mailFromHost,
      name: mailFromDomain,
      priority: 10,
      value: `feedback-smtp.${region}.amazonses.com`,
    },
    mailFromSpf: {
      step: "MAIL_FROM_SPF" as const,
      type: "TXT" as const,
      host: mailFromHost,
      name: mailFromDomain,
      value: "v=spf1 include:amazonses.com ~all",
    },
  };
}

function invalidResult(
  record: RequiredDnsRecord,
  reason: string,
  checkStatus: DnsCheckStatus,
  resolverServers: string[],
  error?: unknown,
): DnsVerificationResult {
  const maybeError = error as { code?: string; message?: string };

  return {
    ...record,
    exists: false,
    valid: false,
    status: "pending",
    checkStatus,
    queriedHost: record.name,
    recordType: record.type,
    matched: false,
    actualRecords: [],
    expectedRecords: [record.priority ? `${record.priority} ${record.value}` : record.value],
    resolverServers,
    resolverError: maybeError?.message
      ? {
          code: maybeError.code,
          message: maybeError.message,
        }
      : undefined,
    reason,
  };
}

async function verifyCname(record: RequiredDnsRecord): Promise<DnsVerificationResult> {
  const { resolver, servers } = createResolver();

  try {
    const actualRecords = await resolver.resolveCname(record.name);
    const expected = trimDot(record.value);
    const valid = actualRecords.some((actual) => trimDot(actual) === expected);
    const checkStatus: DnsCheckStatus = valid ? "verified" : actualRecords.length > 0 ? "mismatch" : "missing";

    return {
      ...record,
      exists: actualRecords.length > 0,
      valid,
      status: toStatus(valid, checkStatus),
      checkStatus,
      queriedHost: record.name,
      recordType: record.type,
      matched: valid,
      actualRecords,
      expectedRecords: [record.value],
      resolverServers: servers,
      reason: valid
        ? undefined
        : `Expected CNAME ${record.value}, found ${actualRecords.join(", ") || "nothing"}.`,
    };
  } catch (error) {
    const checkStatus = dnsErrorStatus(error);

    return invalidResult(record, dnsErrorReason("CNAME", checkStatus), checkStatus, servers, error);
  }
}

async function verifyTxt(
  record: RequiredDnsRecord,
  matcher: (value: string) => boolean,
  reason: string,
): Promise<DnsVerificationResult> {
  const { resolver, servers } = createResolver();

  try {
    const actualRecords = flattenTxt(await resolver.resolveTxt(record.name));
    const normalizedRecords = actualRecords.map(normalizeTxt);
    const valid = normalizedRecords.some((actual) => matcher(actual));
    const checkStatus: DnsCheckStatus = valid ? "verified" : actualRecords.length > 0 ? "mismatch" : "missing";

    return {
      ...record,
      exists: actualRecords.length > 0,
      valid,
      status: toStatus(valid, checkStatus),
      checkStatus,
      queriedHost: record.name,
      recordType: record.type,
      matched: valid,
      actualRecords,
      expectedRecords: [record.value],
      resolverServers: servers,
      reason: valid ? undefined : `${reason} Found: ${actualRecords.join(" | ") || "nothing"}.`,
    };
  } catch (error) {
    const checkStatus = dnsErrorStatus(error);

    return invalidResult(record, dnsErrorReason("TXT", checkStatus), checkStatus, servers, error);
  }
}

async function verifyMailFromMx(record: RequiredDnsRecord): Promise<DnsVerificationResult> {
  const { resolver, servers } = createResolver();

  try {
    const mxRecords = await resolver.resolveMx(record.name);
    const actualRecords = mxRecords.map(
      (mxRecord) => `${mxRecord.priority} ${mxRecord.exchange}`,
    );
    const valid = mxRecords.some(
      (mxRecord) =>
        mxRecord.priority === (record.priority ?? 10) &&
        trimDot(mxRecord.exchange).includes("feedback-smtp") &&
        trimDot(mxRecord.exchange) === trimDot(record.value),
    );
    const hasSesMx = mxRecords.some((mxRecord) => trimDot(mxRecord.exchange).includes("feedback-smtp"));
    const checkStatus: DnsCheckStatus = valid
      ? "verified"
      : hasSesMx
        ? "partial"
        : actualRecords.length > 0
          ? "mismatch"
          : "missing";

    return {
      ...record,
      exists: mxRecords.length > 0,
      valid,
      status: toStatus(valid, checkStatus),
      checkStatus,
      queriedHost: record.name,
      recordType: record.type,
      matched: valid,
      actualRecords,
      expectedRecords: [`${record.priority ?? 10} ${record.value}`],
      resolverServers: servers,
      reason: valid
        ? undefined
        : `MAIL FROM MX must point to ${record.value} with priority ${record.priority ?? 10}.`,
    };
  } catch (error) {
    const checkStatus = dnsErrorStatus(error);

    return invalidResult(record, dnsErrorReason("MX", checkStatus), checkStatus, servers, error);
  }
}

export async function verifyDomainDns(
  domain: string,
  dkimTokens: string[],
  mailFromDomain = `mail.${domain}`,
): Promise<DomainDnsVerification> {
  const records = generateRequiredDnsRecords(domain, dkimTokens, mailFromDomain);
  const [dkim, rawSpf, dmarc, mailFromMx, mailFromSpf] = await Promise.all([
    Promise.all(records.dkim.map((record) => verifyCname(record))),
    verifyTxt(
      records.spf,
      (value) => value.includes("v=spf1") && value.includes("amazonses.com"),
      "Root SPF TXT record must contain v=spf1 and include amazonses.com.",
    ),
    verifyTxt(
      records.dmarc,
      (value) => value.includes("v=dmarc1"),
      "DMARC TXT record must include v=DMARC1.",
    ),
    verifyMailFromMx(records.mailFromMx),
    verifyTxt(
      records.mailFromSpf,
      (value) => value.includes("v=spf1") && value.includes("amazonses.com"),
      "MAIL FROM SPF TXT record must contain v=spf1 and include amazonses.com.",
    ),
  ]);
  const spfRecordCount = rawSpf.actualRecords.filter((record) =>
    normalizeTxt(record).includes("v=spf1"),
  ).length;
  const spf: DnsVerificationResult =
    rawSpf.valid && spfRecordCount > 1
      ? {
          ...rawSpf,
          checkStatus: "partial",
          reason:
            "Multiple SPF TXT records were found. Merge SES into your existing SPF record instead of publishing duplicate SPF records.",
        }
      : rawSpf;

  return {
    dkim: {
      verified: dkim.length > 0 && dkim.every((record) => record.valid),
      records: dkim,
    },
    spf,
    dmarc,
    mailFromMx,
    mailFromSpf,
  };
}

export async function checkDomainDns(domain: string, dkimTokens: string[]) {
  return verifyDomainDns(domain, dkimTokens);
}
