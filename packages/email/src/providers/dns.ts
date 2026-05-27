import dns from "node:dns/promises";
import { getSesRegion } from "./ses";

export type DnsRecordStep =
  | "DKIM"
  | "SPF"
  | "DMARC"
  | "MAIL_FROM_MX"
  | "MAIL_FROM_SPF";

export type DnsRecordType = "CNAME" | "TXT" | "MX";

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
  actualRecords: string[];
  expectedRecords: string[];
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
  return records.map((record) => record.join(""));
}

function toStatus(valid: boolean, exists: boolean) {
  if (valid) {
    return "verified" as const;
  }

  return exists ? ("failed" as const) : ("pending" as const);
}

export function generateRequiredDnsRecords(domain: string, dkimTokens: string[]) {
  const mailFromDomain = `mail.${domain}`;
  const region = getSesRegion();

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
      host: "mail",
      name: mailFromDomain,
      priority: 10,
      value: `feedback-smtp.${region}.amazonses.com`,
    },
    mailFromSpf: {
      step: "MAIL_FROM_SPF" as const,
      type: "TXT" as const,
      host: "mail",
      name: mailFromDomain,
      value: "v=spf1 include:amazonses.com ~all",
    },
  };
}

function invalidResult(record: RequiredDnsRecord, reason: string): DnsVerificationResult {
  return {
    ...record,
    exists: false,
    valid: false,
    status: "pending",
    actualRecords: [],
    expectedRecords: [record.value],
    reason,
  };
}

async function verifyCname(record: RequiredDnsRecord): Promise<DnsVerificationResult> {
  try {
    const actualRecords = await dns.resolveCname(record.name);
    const expected = trimDot(record.value);
    const valid = actualRecords.some((actual) => trimDot(actual) === expected);

    return {
      ...record,
      exists: actualRecords.length > 0,
      valid,
      status: toStatus(valid, actualRecords.length > 0),
      actualRecords,
      expectedRecords: [record.value],
      reason: valid
        ? undefined
        : `Expected CNAME ${record.value}, found ${actualRecords.join(", ") || "nothing"}.`,
    };
  } catch {
    return invalidResult(record, "CNAME record has not propagated yet.");
  }
}

async function verifyTxt(
  record: RequiredDnsRecord,
  matcher: (value: string) => boolean,
  reason: string,
): Promise<DnsVerificationResult> {
  try {
    const actualRecords = flattenTxt(await dns.resolveTxt(record.name));
    const valid = actualRecords.some((actual) => matcher(actual.toLowerCase()));

    return {
      ...record,
      exists: actualRecords.length > 0,
      valid,
      status: toStatus(valid, actualRecords.length > 0),
      actualRecords,
      expectedRecords: [record.value],
      reason: valid ? undefined : reason,
    };
  } catch {
    return invalidResult(record, "TXT record has not propagated yet.");
  }
}

async function verifyMailFromMx(record: RequiredDnsRecord): Promise<DnsVerificationResult> {
  try {
    const mxRecords = await dns.resolveMx(record.name);
    const actualRecords = mxRecords.map(
      (mxRecord) => `${mxRecord.priority} ${mxRecord.exchange}`,
    );
    const valid = mxRecords.some(
      (mxRecord) =>
        mxRecord.priority === (record.priority ?? 10) &&
        trimDot(mxRecord.exchange).includes("feedback-smtp") &&
        trimDot(mxRecord.exchange) === trimDot(record.value),
    );

    return {
      ...record,
      exists: mxRecords.length > 0,
      valid,
      status: toStatus(valid, mxRecords.length > 0),
      actualRecords,
      expectedRecords: [`${record.priority ?? 10} ${record.value}`],
      reason: valid
        ? undefined
        : "MAIL FROM MX must point to the regional Amazon SES feedback SMTP host.",
    };
  } catch {
    return invalidResult(record, "MX record has not propagated yet.");
  }
}

export async function verifyDomainDns(
  domain: string,
  dkimTokens: string[],
): Promise<DomainDnsVerification> {
  const records = generateRequiredDnsRecords(domain, dkimTokens);
  const [dkim, spf, dmarc, mailFromMx, mailFromSpf] = await Promise.all([
    Promise.all(records.dkim.map((record) => verifyCname(record))),
    verifyTxt(
      records.spf,
      (value) => value.includes("v=spf1") && value.includes("amazonses.com"),
      "Root SPF TXT record must start with v=spf1 and include amazonses.com.",
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
      "MAIL FROM SPF TXT record must start with v=spf1 and include amazonses.com.",
    ),
  ]);

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
