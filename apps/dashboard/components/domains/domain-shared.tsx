"use client";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "failed"
  | "not_configured";

export type DomainStatus =
  | "draft"
  | "dns_pending"
  | "partially_verified"
  | "ready"
  | "suspended"
  | "failed";

export type DnsRecord = {
  step: "DKIM" | "SPF" | "DMARC" | "MAIL_FROM_MX" | "MAIL_FROM_SPF";
  type: "CNAME" | "TXT" | "MX";
  host: string;
  value: string;
  priority?: number;
  ttl?: number;
  status?: VerificationStatus;
  checkStatus?: "verified" | "partial" | "mismatch" | "missing" | "resolver_failed";
  queriedHost?: string;
  recordType?: "CNAME" | "TXT" | "MX";
  matched?: boolean;
  expectedRecords?: string[];
  reason?: string;
  actualRecords?: string[];
  resolverServers?: string[];
  resolverError?: {
    code?: string;
    message: string;
  };
};

export type DomainStatusSummary = {
  sesIdentityStatus: VerificationStatus;
  dkimStatus: VerificationStatus;
  spfStatus: VerificationStatus;
  dmarcStatus: VerificationStatus;
  mailFromMxStatus: VerificationStatus;
  mailFromSpfStatus: VerificationStatus;
  domainStatus: DomainStatus;
  fullyVerified: boolean;
  pending: string[];
  failed: string[];
  message: string;
};

export type EmailDomain = {
  id: string;
  domain: string;
  provider?: string;
  status?: string;
  domainStatus?: DomainStatus;
  sesIdentityStatus?: VerificationStatus;
  dkimStatus?: VerificationStatus;
  spfStatus?: VerificationStatus;
  dmarcStatus?: VerificationStatus;
  mailFromMxStatus?: VerificationStatus;
  mailFromSpfStatus?: VerificationStatus;
  mailFromStatus?: VerificationStatus;
  sendingEnabled?: boolean;
  sesVerified: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  mailFromMxVerified: boolean;
  mailFromSpfVerified: boolean;
  fullyVerified: boolean;
  mailFromDomain?: string | null;
  dnsRecords?: DnsRecord[];
  statusSummary?: DomainStatusSummary;
  verificationState?: {
    summary?: DomainStatusSummary;
  };
  createdAt?: string;
  updatedAt?: string;
  lastCheckedAt?: string;
  lastVerifiedAt?: string;
  verifiedAt?: string;
};

export type SenderEmailIdentity = {
  id: string;
  organizationId: string;
  domainId: string;
  email: string;
  localPart: string;
  displayName?: string | null;
  isDefault: boolean;
  status: "active" | "disabled";
  createdAt?: string;
  updatedAt?: string;
};

const statusLabels: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  failed: "Failed",
  not_configured: "Not configured",
};

const domainStatusLabels: Record<DomainStatus, string> = {
  draft: "Draft",
  dns_pending: "DNS pending",
  partially_verified: "Partially verified",
  ready: "Ready",
  suspended: "Suspended",
  failed: "Failed",
};

export function statusClass(status?: VerificationStatus | DomainStatus) {
  if (status === "verified" || status === "ready") {
    return "border-emerald-700 bg-emerald-600 text-white";
  }

  if (status === "failed" || status === "suspended") {
    return "border-red-700 bg-red-600 text-white";
  }

  if (status === "pending" || status === "dns_pending" || status === "partially_verified") {
    return "border-amber-600 bg-amber-500 text-zinc-950";
  }

  return "border-border bg-muted text-foreground";
}

export function StatusBadge({ status }: { status?: VerificationStatus | DomainStatus }) {
  const label =
    status && status in statusLabels
      ? statusLabels[status as VerificationStatus]
      : status && status in domainStatusLabels
        ? domainStatusLabels[status as DomainStatus]
        : "Not configured";

  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${statusClass(status)}`}>
      {label}
    </span>
  );
}

export function DnsCheckBadge({ status }: { status?: DnsRecord["checkStatus"] }) {
  const label =
    status === "verified"
      ? "Verified"
      : status === "partial"
        ? "Partially matched"
        : status === "mismatch"
          ? "Mismatch detected"
          : status === "resolver_failed"
            ? "Resolver failed"
            : "Missing";
  const tone =
    status === "verified"
      ? "border-emerald-700 bg-emerald-600 text-white"
      : status === "partial"
        ? "border-amber-600 bg-amber-500 text-zinc-950"
        : status === "mismatch" || status === "resolver_failed"
          ? "border-red-700 bg-red-600 text-white"
          : "border-border bg-muted text-foreground";

  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getSummary(domain: EmailDomain): DomainStatusSummary {
  const stored = domain.statusSummary ?? domain.verificationState?.summary;

  if (stored) {
    return stored;
  }

  const pending = [
    domain.sesVerified ? null : "SES",
    domain.dkimVerified ? null : "DKIM",
    domain.spfVerified ? null : "SPF",
    domain.dmarcVerified ? null : "DMARC",
    domain.mailFromMxVerified ? null : "MAIL FROM MX",
    domain.mailFromSpfVerified ? null : "MAIL FROM SPF",
  ].filter((item): item is string => Boolean(item));

  return {
    sesIdentityStatus: domain.sesVerified ? "verified" : "pending",
    dkimStatus: domain.dkimVerified ? "verified" : "pending",
    spfStatus: domain.spfVerified ? "verified" : "pending",
    dmarcStatus: domain.dmarcVerified ? "verified" : "pending",
    mailFromMxStatus: domain.mailFromMxVerified ? "verified" : "pending",
    mailFromSpfStatus: domain.mailFromSpfVerified ? "verified" : "pending",
    domainStatus: domain.fullyVerified ? "ready" : domain.sesVerified ? "partially_verified" : "dns_pending",
    fullyVerified: domain.fullyVerified,
    pending,
    failed: domain.status === "FAILED" ? pending : [],
    message: domain.fullyVerified
      ? "Domain is ready. You can now send email from this domain."
      : "DNS setup is incomplete. Add the required records and refresh verification.",
  };
}

export function recordValue(record: DnsRecord) {
  return record.priority ? `${record.priority} ${record.value}` : record.value;
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function DnsRecordsTable({
  records,
  onCopy,
}: {
  records: DnsRecord[];
  onCopy?: (message: string) => void;
}) {
  async function copy(value: string, message: string) {
    await copyText(value);
    onCopy?.(message);
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        DNS records have not been generated yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted-foreground">
          <tr>
            <th className="w-24 px-4 py-3 font-medium">Type</th>
            <th className="w-64 px-4 py-3 font-medium">Host</th>
            <th className="px-4 py-3 font-medium">Value</th>
              <th className="w-20 px-4 py-3 font-medium">TTL</th>
            <th className="w-44 px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={`${record.step}-${record.host}-${index}`} className="border-b border-border last:border-b-0">
              <td className="px-4 py-4 align-top font-mono text-foreground">{record.type}</td>
              <td className="px-4 py-4 align-top">
                <p className="mb-2 text-xs text-muted-foreground">Copy exactly this host</p>
                <div className="flex items-start gap-2">
                  <code className="block max-w-[260px] overflow-x-auto whitespace-nowrap rounded-md border border-border bg-zinc-100 px-2.5 py-2 font-mono text-xs text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                    {record.host}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copy(record.host, "Host copied.")}
                    className="h-8 shrink-0 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-accent"
                  >
                    Copy
                  </button>
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <p className="mb-2 text-xs text-muted-foreground">Copy exactly this value</p>
                {record.type === "MX" && record.priority ? (
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                      Priority: <code className="font-mono text-foreground">{record.priority}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => void copy(recordValue(record), "Combined MX value copied.")}
                      className="rounded-md border border-border px-2 py-1 font-medium hover:bg-accent"
                    >
                      Copy combined MX value
                    </button>
                  </div>
                ) : null}
                <div className="flex items-start gap-2">
                  <code className="block max-w-[520px] overflow-x-auto whitespace-nowrap rounded-md border border-border bg-zinc-100 px-2.5 py-2 font-mono text-xs text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                    {record.type === "MX" ? record.value : recordValue(record)}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copy(record.type === "MX" ? record.value : recordValue(record), "Value copied.")}
                    className="h-8 shrink-0 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-accent"
                  >
                    Copy
                  </button>
                </div>
                {record.reason ? (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{record.reason}</p>
                ) : null}
                {record.actualRecords?.length ? (
                  <p className="mt-2 break-all text-xs text-muted-foreground">
                    Found: {record.actualRecords.join(", ")}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-4 align-top font-mono text-xs text-muted-foreground">
                {record.ttl ?? "Auto"}
              </td>
              <td className="px-4 py-4 align-top">
                <div className="space-y-2">
                  <StatusBadge status={record.status ?? "pending"} />
                  <DnsCheckBadge status={record.checkStatus} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-border p-4">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            View actual DNS results
          </summary>
          <div className="mt-4 space-y-3">
            {records.map((record, index) => (
              <div key={`${record.step}-debug-${index}`} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{record.step}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {record.recordType ?? record.type} lookup for {record.queriedHost ?? record.host}
                    </p>
                  </div>
                  <DnsCheckBadge status={record.checkStatus} />
                </div>
                <dl className="mt-4 grid gap-3 text-xs md:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Expected values</dt>
                    <dd className="mt-1 space-y-1">
                      {(record.expectedRecords?.length ? record.expectedRecords : [recordValue(record)]).map((value) => (
                        <code key={value} className="block overflow-x-auto whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                          {value}
                        </code>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Resolved values</dt>
                    <dd className="mt-1 space-y-1">
                      {record.actualRecords?.length ? (
                        record.actualRecords.map((value) => (
                          <code key={value} className="block overflow-x-auto whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                            {value}
                          </code>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No records returned</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Matched</dt>
                    <dd className="mt-1 font-mono text-foreground">{record.matched ? "true" : "false"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Resolvers</dt>
                    <dd className="mt-1 font-mono text-foreground">
                      {record.resolverServers?.join(", ") || "System default"}
                    </dd>
                  </div>
                  {record.resolverError ? (
                    <div className="md:col-span-2">
                      <dt className="text-muted-foreground">Resolver error</dt>
                      <dd className="mt-1 rounded-md bg-red-600/10 px-2 py-1 font-mono text-red-700 dark:text-red-200">
                        {record.resolverError.code ? `${record.resolverError.code}: ` : ""}
                        {record.resolverError.message}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
