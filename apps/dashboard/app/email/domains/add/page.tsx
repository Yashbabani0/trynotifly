"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/auth/form-field";

type VerificationStatus = "pending" | "verified" | "failed";
type DomainReadinessStatus =
  | "draft"
  | "dns_pending"
  | "partially_verified"
  | "ready"
  | "failed";
type DomainStatus =
  | "PENDING"
  | "DKIM_PENDING"
  | "SPF_PENDING"
  | "DMARC_PENDING"
  | "MAIL_FROM_PENDING"
  | "SES_PENDING"
  | "VERIFIED"
  | "FAILED";

type DnsRecord = {
  step: "DKIM" | "SPF" | "DMARC" | "MAIL_FROM_MX" | "MAIL_FROM_SPF";
  type: "CNAME" | "TXT" | "MX";
  host: string;
  value: string;
  priority?: number;
  status?: VerificationStatus;
  checkStatus?: "verified" | "partial" | "mismatch" | "missing" | "resolver_failed";
  queriedHost?: string;
  expectedRecords?: string[];
  matched?: boolean;
  reason?: string;
  actualRecords?: string[];
  resolverServers?: string[];
  resolverError?: {
    code?: string;
    message: string;
  };
};

type DomainStatusSummary = {
  sesIdentityStatus: VerificationStatus;
  dkimStatus: VerificationStatus;
  spfStatus: VerificationStatus;
  dmarcStatus: VerificationStatus;
  mailFromMxStatus: VerificationStatus;
  mailFromSpfStatus: VerificationStatus;
  domainStatus: DomainReadinessStatus;
  fullyVerified: boolean;
  pending: string[];
  failed: string[];
  message: string;
};

type DomainRecord = {
  domain: string;
  status: DomainStatus;
  sesVerified: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  mailFromMxVerified: boolean;
  mailFromSpfVerified: boolean;
  fullyVerified: boolean;
  dnsRecords?: DnsRecord[];
  verificationState?: {
    summary?: DomainStatusSummary;
  };
  lastCheckedAt?: string;
  verifiedAt?: string;
};

type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error?: {
        code: string;
        message: string;
        details?: unknown;
      };
    };

const groups: {
  key: keyof Pick<
    DomainStatusSummary,
    "dkimStatus" | "spfStatus" | "dmarcStatus" | "mailFromMxStatus" | "mailFromSpfStatus"
  >;
  title: string;
  description: string;
  steps: DnsRecord["step"][];
}[] = [
  {
    key: "dkimStatus",
    title: "DKIM",
    description: "Add all three CNAME records so TryNotifly can sign mail for this domain.",
    steps: ["DKIM"],
  },
  {
    key: "spfStatus",
    title: "Root SPF",
    description: "Authorizes Amazon SES as an allowed sender for the root domain.",
    steps: ["SPF"],
  },
  {
    key: "dmarcStatus",
    title: "DMARC",
    description: "Starts DMARC monitoring with a non-blocking policy.",
    steps: ["DMARC"],
  },
  {
    key: "mailFromMxStatus",
    title: "MAIL FROM MX",
    description: "Routes bounce handling through the custom MAIL FROM domain.",
    steps: ["MAIL_FROM_MX"],
  },
  {
    key: "mailFromSpfStatus",
    title: "MAIL FROM SPF",
    description: "Authorizes SES for bounce-domain SPF checks.",
    steps: ["MAIL_FROM_SPF"],
  },
];

const statusLabels: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  failed: "Failed",
};

function statusTone(status?: VerificationStatus | "not_configured") {
  if (status === "verified") {
    return "border-emerald-700 bg-emerald-600 text-white";
  }

  if (status === "failed") {
    return "border-red-700 bg-red-600 text-white";
  }

  if (status === "pending") {
    return "border-amber-600 bg-amber-500 text-zinc-950";
  }

  return "border-border bg-muted text-foreground";
}

function readinessLabel(status?: DomainReadinessStatus) {
  switch (status) {
    case "ready":
      return "Domain ready for sending";
    case "partially_verified":
      return "Domain is partially verified";
    case "failed":
      return "Domain verification needs attention";
    case "dns_pending":
      return "DNS records are pending";
    default:
      return "Add a sending domain";
  }
}

function formatTime(value?: string) {
  if (!value) {
    return "Not checked yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeDomainInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

function validateDomainInput(value: string) {
  const normalized = normalizeDomainInput(value);

  if (!normalized) {
    return { ok: false as const, message: "Enter a domain to continue." };
  }

  if (normalized.startsWith("*.")) {
    return {
      ok: false as const,
      message: "Wildcard domains are not supported. Add the root domain instead.",
    };
  }

  if (normalized.includes("@")) {
    return { ok: false as const, message: "Enter a domain, not an email address." };
  }

  if (!/^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(normalized)) {
    return {
      ok: false as const,
      message: "Enter a valid root domain, for example example.com.",
    };
  }

  return { ok: true as const, domain: normalized };
}

function defaultSummary(domainRecord: DomainRecord | null): DomainStatusSummary | null {
  if (!domainRecord) {
    return null;
  }

  const summary = domainRecord.verificationState?.summary;

  if (summary) {
    return summary;
  }

  const pending = [
    domainRecord.sesVerified ? null : "SES",
    domainRecord.dkimVerified ? null : "DKIM",
    domainRecord.spfVerified ? null : "SPF",
    domainRecord.dmarcVerified ? null : "DMARC",
    domainRecord.mailFromMxVerified ? null : "MAIL FROM MX",
    domainRecord.mailFromSpfVerified ? null : "MAIL FROM SPF",
  ].filter((item): item is string => Boolean(item));

  return {
    sesIdentityStatus: domainRecord.sesVerified ? "verified" : "pending",
    dkimStatus: domainRecord.dkimVerified ? "verified" : "pending",
    spfStatus: domainRecord.spfVerified ? "verified" : "pending",
    dmarcStatus: domainRecord.dmarcVerified ? "verified" : "pending",
    mailFromMxStatus: domainRecord.mailFromMxVerified ? "verified" : "pending",
    mailFromSpfStatus: domainRecord.mailFromSpfVerified ? "verified" : "pending",
    domainStatus: domainRecord.fullyVerified
      ? "ready"
      : domainRecord.sesVerified
        ? "partially_verified"
        : "dns_pending",
    fullyVerified: domainRecord.fullyVerified,
    pending,
    failed: domainRecord.status === "FAILED" ? pending : [],
    message: domainRecord.fullyVerified
      ? "Domain is ready. You can now send email from this domain."
      : "DNS verification is still pending. DNS propagation can take up to 72 hours.",
  };
}

function Badge({ status }: { status?: VerificationStatus | "not_configured" }) {
  const label = status ? (status === "not_configured" ? "Not configured" : statusLabels[status]) : "Pending";

  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${statusTone(status ?? "pending")}`}>
      {label}
    </span>
  );
}

function DnsCheckBadge({ status }: { status?: DnsRecord["checkStatus"] }) {
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

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="h-8 shrink-0 rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition hover:border-primary/60 hover:bg-accent disabled:opacity-60"
      title={label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function codeValue(record: DnsRecord) {
  return record.priority ? `${record.priority} ${record.value}` : record.value;
}

function Stepper({
  domainRecord,
  records,
  summary,
}: {
  domainRecord: DomainRecord | null;
  records: DnsRecord[];
  summary: DomainStatusSummary | null;
}) {
  const ready = summary?.domainStatus === "ready" || domainRecord?.fullyVerified;
  const stepStates = [
    Boolean(domainRecord),
    Boolean(domainRecord),
    records.length > 0,
    records.length > 0,
    Boolean(ready),
  ];
  const currentIndex = ready ? 4 : records.length > 0 ? 3 : domainRecord ? 2 : 0;
  const labels = ["Domain added", "SES identity created", "DNS records generated", "Verifying DNS", "Ready"];

  return (
    <section className="grid gap-3 md:grid-cols-5">
      {labels.map((step, index) => {
        const completed = stepStates[index] && (index < currentIndex || ready);
        const current = index === currentIndex && !ready;
        const neutral = !completed && !current;

        return (
          <div
            key={step}
            className={`rounded-lg border p-3 transition ${
              completed
                ? "border-emerald-700 bg-emerald-600/15 text-foreground"
                : current
                  ? "border-primary bg-primary/10 text-foreground"
                  : neutral
                    ? "border-border bg-card text-muted-foreground"
                    : "border-border bg-card text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xs">STEP {index + 1}</p>
              {completed ? <span className="text-sm font-bold text-emerald-500">✓</span> : null}
            </div>
            <p className="mt-1 text-sm font-medium">{step}</p>
          </div>
        );
      })}
    </section>
  );
}

function SummaryCard({
  summary,
  domainRecord,
}: {
  summary: DomainStatusSummary | null;
  domainRecord: DomainRecord | null;
}) {
  const status = summary?.domainStatus;
  const isReady = status === "ready";
  const isFailed = status === "failed";

  return (
    <section
      className={`rounded-lg border p-5 ${
        isReady
          ? "border-emerald-700 bg-emerald-600/10"
          : isFailed
            ? "border-red-700 bg-red-600/10"
            : "border-border bg-card"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Current readiness</p>
          <h2 className="mt-1 text-xl font-semibold">{readinessLabel(status)}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {summary?.message ??
              "Enter a root domain to create the SES identity and generate the exact DNS records."}
          </p>
        </div>
        <Badge status={isReady ? "verified" : isFailed ? "failed" : domainRecord ? "pending" : "not_configured"} />
      </div>
      {domainRecord ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Last checked: {formatTime(domainRecord.lastCheckedAt)}
        </p>
      ) : null}
    </section>
  );
}

function StatusCards({
  summary,
  lastCheckedAt,
}: {
  summary: DomainStatusSummary | null;
  lastCheckedAt?: string;
}) {
  const cards = [
    {
      label: "SES identity",
      status: summary?.sesIdentityStatus,
      explanation: "Amazon SES identity status. This alone does not mean the domain is ready.",
    },
    {
      label: "DKIM",
      status: summary?.dkimStatus,
      explanation: "All SES DKIM CNAME records must resolve to the expected Amazon SES targets.",
    },
    {
      label: "SPF",
      status: summary?.spfStatus,
      explanation: "Root TXT record must include v=spf1 and amazonses.com.",
    },
    {
      label: "DMARC",
      status: summary?.dmarcStatus,
      explanation: "DMARC TXT record must include v=DMARC1.",
    },
    {
      label: "MAIL FROM MX",
      status: summary?.mailFromMxStatus,
      explanation: "The mail subdomain MX must point to the regional SES feedback SMTP host.",
    },
    {
      label: "MAIL FROM SPF",
      status: summary?.mailFromSpfStatus,
      explanation: "The mail subdomain TXT record must include v=spf1 and amazonses.com.",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{card.label}</p>
            <Badge status={card.status ?? "not_configured"} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{card.explanation}</p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Last checked: {formatTime(lastCheckedAt)}
          </p>
        </div>
      ))}
    </section>
  );
}

function RecordGroup({
  title,
  description,
  status,
  records,
}: {
  title: string;
  description: string;
  status?: VerificationStatus;
  records: DnsRecord[];
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge status={status ?? "pending"} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-24 px-4 py-3 font-medium">Type</th>
              <th className="w-60 px-4 py-3 font-medium">Host</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="w-36 px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={`${record.step}-${record.type}-${record.host}-${index}`} className="border-b border-border last:border-b-0">
                <td className="px-4 py-4 align-top">
                  <span className="font-mono text-sm text-foreground">{record.type}</span>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="mb-2 text-xs text-muted-foreground">Copy exactly this host</p>
                  <div className="flex items-start gap-2">
                    <code className="block max-w-[260px] overflow-x-auto whitespace-nowrap rounded-md border border-border bg-zinc-100 px-2.5 py-2 font-mono text-xs text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                      {record.host}
                    </code>
                    <CopyButton value={record.host} />
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="mb-2 text-xs text-muted-foreground">Copy exactly this value</p>
                  {record.type === "MX" && record.priority ? (
                    <div className="mb-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">
                        Priority: <code className="font-mono text-foreground">{record.priority}</code>
                      </span>
                      <CopyButton value={codeValue(record)} label="Copy combined MX" />
                    </div>
                  ) : null}
                  <div className="flex items-start gap-2">
                    <code className="block max-w-[520px] overflow-x-auto whitespace-nowrap rounded-md border border-border bg-zinc-100 px-2.5 py-2 font-mono text-xs text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50">
                      {record.type === "MX" ? record.value : codeValue(record)}
                    </code>
                    <CopyButton value={record.type === "MX" ? record.value : codeValue(record)} />
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
                <td className="px-4 py-4 align-top">
                  <div className="space-y-2">
                    <Badge status={record.status ?? "pending"} />
                    <DnsCheckBadge status={record.checkStatus} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="border-t border-border p-5">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          View actual DNS results
        </summary>
        <div className="mt-4 space-y-3">
          {records.map((record, index) => (
            <div key={`${record.step}-debug-${index}`} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs text-muted-foreground">
                  {record.type} lookup for {record.queriedHost ?? record.host}
                </p>
                <DnsCheckBadge status={record.checkStatus} />
              </div>
              <div className="mt-3 grid gap-3 text-xs md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Expected</p>
                  {(record.expectedRecords?.length ? record.expectedRecords : [codeValue(record)]).map((value) => (
                    <code key={value} className="mt-1 block overflow-x-auto whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                      {value}
                    </code>
                  ))}
                </div>
                <div>
                  <p className="text-muted-foreground">Resolved</p>
                  {record.actualRecords?.length ? (
                    record.actualRecords.map((value) => (
                      <code key={value} className="mt-1 block overflow-x-auto whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-foreground">
                        {value}
                      </code>
                    ))
                  ) : (
                    <p className="mt-1 text-muted-foreground">No records returned</p>
                  )}
                </div>
                <p className="font-mono text-muted-foreground">Matched: {record.matched ? "true" : "false"}</p>
                <p className="font-mono text-muted-foreground">
                  Resolvers: {record.resolverServers?.join(", ") || "System default"}
                </p>
                {record.resolverError ? (
                  <p className="md:col-span-2 font-mono text-red-700 dark:text-red-200">
                    {record.resolverError.code ? `${record.resolverError.code}: ` : ""}
                    {record.resolverError.message}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

export default function AddDomainPage() {
  const [domain, setDomain] = useState("");
  const [domainRecord, setDomainRecord] = useState<DomainRecord | null>(null);
  const [summary, setSummary] = useState<DomainStatusSummary | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    tone: "default" | "success" | "error";
    message: string;
  } | null>(null);

  const effectiveSummary = summary ?? defaultSummary(domainRecord);
  const groupedRecords = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        records: records.filter((record) => group.steps.includes(record.step)),
      })),
    [records],
  );

  function applyDomainPayload(data: {
    domain: DomainRecord;
    records: Record<string, DnsRecord[]>;
    statusSummary?: DomainStatusSummary;
  }) {
    setDomainRecord(data.domain);
    setDomain(data.domain.domain);
    setRecords(Object.values(data.records).flat());
    setSummary(data.statusSummary ?? data.domain.verificationState?.summary ?? defaultSummary(data.domain));
  }

  async function handleResponse<T>(response: Response): Promise<T> {
    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || !payload?.success) {
      const message =
        payload && !payload.success
          ? payload.error?.message ?? "Request failed."
          : `Request failed with status ${response.status}.`;
      const apiError = new Error(message) as Error & { code?: string; details?: unknown };
      apiError.code = payload && !payload.success ? payload.error?.code : undefined;
      apiError.details = payload && !payload.success ? payload.error?.details : undefined;
      throw apiError;
    }

    return payload.data;
  }

  function verificationToast(nextSummary: DomainStatusSummary) {
    if (nextSummary.domainStatus === "ready") {
      return {
        tone: "success" as const,
        message: "Domain is ready. You can now send email from this domain.",
      };
    }

    if (nextSummary.domainStatus === "failed") {
      return {
        tone: "error" as const,
        message: nextSummary.message,
      };
    }

    return {
      tone: "default" as const,
      message: nextSummary.message,
    };
  }

  async function createDomain(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setErrorCode(null);

    const validation = validateDomainInput(domain);

    if (!validation.ok) {
      setError(validation.message);
      setErrorCode("INVALID_DOMAIN");
      setToast({ tone: "error", message: validation.message });
      setLoading(false);
      return;
    }

    try {
      console.info("dashboard.domain.ui.create", {
        rawDomain: domain,
        normalizedDomain: validation.domain,
      });

      const data = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: validation.domain }),
      }).then(
        handleResponse<{
          domain: DomainRecord;
          records: Record<string, DnsRecord[]>;
          statusSummary?: DomainStatusSummary;
        }>,
      );

      applyDomainPayload(data);
      setToast({
        tone: "success",
        message: "Domain created. Add the DNS records below, then refresh status.",
      });
    } catch (createError) {
      const errorWithCode = createError as Error & { code?: string };
      setError(createError instanceof Error ? createError.message : "Could not create domain.");
      setErrorCode(errorWithCode.code ?? "DOMAIN_CREATE_FAILED");
      setToast({
        tone: "error",
        message: createError instanceof Error ? createError.message : "Could not create domain.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkDomain({ quiet = false }: { quiet?: boolean } = {}) {
    const targetDomain = domainRecord?.domain ?? domain;

    if (!targetDomain || checking) {
      return;
    }

    setChecking(true);
    setError(null);
    setErrorCode(null);

    try {
      const validation = validateDomainInput(targetDomain);

      if (!validation.ok) {
        setError(validation.message);
        setErrorCode("INVALID_DOMAIN");
        setToast({ tone: "error", message: validation.message });
        return;
      }

      const data = await fetch(`/api/domains/${encodeURIComponent(validation.domain)}/check`, {
        method: "POST",
      }).then(
        handleResponse<{
          domain: DomainRecord;
          records: Record<string, DnsRecord[]>;
          statusSummary?: DomainStatusSummary;
        }>,
      );

      applyDomainPayload(data);
      const nextSummary = data.statusSummary ?? data.domain.verificationState?.summary ?? defaultSummary(data.domain);

      if (!quiet && nextSummary) {
        setToast(verificationToast(nextSummary));
      }
    } catch (checkError) {
      const errorWithCode = checkError as Error & { code?: string };
      setError(checkError instanceof Error ? checkError.message : "Could not verify domain.");
      setErrorCode(errorWithCode.code ?? "DOMAIN_CHECK_FAILED");
      if (!quiet) {
        setToast({
          tone: "error",
          message: checkError instanceof Error ? checkError.message : "Could not verify domain.",
        });
      }
    } finally {
      setChecking(false);
    }
  }

  async function deleteCurrentDomain() {
    const targetDomain = domainRecord?.domain;

    if (!targetDomain || deleting) {
      return;
    }

    const confirmed = window.confirm(`Delete ${targetDomain} from TryNotifly? This also removes the SES identity.`);

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);
    setErrorCode(null);

    try {
      await fetch(`/api/domains/${encodeURIComponent(targetDomain)}`, {
        method: "DELETE",
      }).then(handleResponse<{ deleted: boolean; domain: string }>);

      setDomainRecord(null);
      setSummary(null);
      setRecords([]);
      setDomain("");
      setToast({ tone: "success", message: "Domain deleted." });
    } catch (deleteError) {
      const errorWithCode = deleteError as Error & { code?: string };
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete domain.");
      setErrorCode(errorWithCode.code ?? "DOMAIN_DELETE_FAILED");
      setToast({
        tone: "error",
        message: deleteError instanceof Error ? deleteError.message : "Could not delete domain.",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function copyAllRecords() {
    if (records.length === 0) {
      return;
    }

    const output = records
      .map((record) => `${record.type}\t${record.host}\t${codeValue(record)}`)
      .join("\n");

    await navigator.clipboard.writeText(output);
    setToast({ tone: "success", message: "All DNS records copied." });
  }

  useEffect(() => {
    if (!domainRecord || effectiveSummary?.domainStatus === "ready") {
      return;
    }

    const interval = window.setInterval(() => {
      void checkDomain({ quiet: true });
    }, 30_000);

    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainRecord?.domain, effectiveSummary?.domainStatus]);

  return (
    <div className="text-foreground">
      <Toast tone={toast?.tone} message={toast?.message ?? null} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Organization / Domains</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Add sending domain</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {domainRecord ? (
              <button
                type="button"
                onClick={copyAllRecords}
                className="h-10 rounded-md border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-accent"
              >
                Copy all records
              </button>
            ) : null}
            {domainRecord ? (
              <button
                type="button"
                onClick={() => void checkDomain()}
                disabled={checking}
                className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? "Refreshing..." : "Refresh status"}
              </button>
            ) : null}
          </div>
        </header>

        <Stepper domainRecord={domainRecord} records={records} summary={effectiveSummary} />

        <SummaryCard summary={effectiveSummary} domainRecord={domainRecord} />

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">Domain</h2>
              <form onSubmit={createDomain} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="domain" className="text-sm font-medium text-muted-foreground">
                    Root domain
                  </label>
                  <input
                    id="domain"
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="example.com"
                    className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring transition placeholder:text-muted-foreground focus:ring-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !domain || Boolean(domainRecord)}
                  className="h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating..." : domainRecord ? "Domain added" : "Generate DNS records"}
                </button>

                {domainRecord ? (
                  <button
                    type="button"
                    onClick={() => void checkDomain()}
                    disabled={checking}
                    className="h-10 w-full rounded-md border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checking ? "Checking..." : "Retry verification"}
                  </button>
                ) : null}
              </form>

              {error ? (
                <div className="mt-5 rounded-lg border border-red-700 bg-red-600/10 p-3 text-sm text-red-700 dark:text-red-200">
                  {errorCode ? (
                    <p className="mb-1 font-mono text-xs uppercase tracking-wide text-red-700 dark:text-red-200">
                      {errorCode}
                    </p>
                  ) : null}
                  {error}
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">What to do next</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>1. Open your DNS provider for {domainRecord?.domain ?? "this domain"}.</li>
                <li>2. Add every record exactly as shown in the table.</li>
                <li>3. Use the short host values like <code className="font-mono text-foreground">mail</code> and <code className="font-mono text-foreground">_dmarc</code> unless your DNS provider asks for the full hostname.</li>
                <li>4. Click Refresh status. DNS propagation can take a few minutes and sometimes up to 72 hours.</li>
              </ol>
            </section>

            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">DNS provider note</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Many DNS providers automatically append the root domain. If the record says host <code className="font-mono text-foreground">mail</code>, entering <code className="font-mono text-foreground">mail.example.com</code> may create the wrong hostname on those providers.
              </p>
            </section>

            {domainRecord ? (
              <section className="rounded-lg border border-red-700/40 bg-red-600/10 p-5">
                <h2 className="text-base font-semibold text-red-700 dark:text-red-200">Danger zone</h2>
                <p className="mt-2 text-sm text-red-700/80 dark:text-red-200/80">
                  Delete this domain if you need to restart setup or remove the SES identity.
                </p>
                <button
                  type="button"
                  onClick={deleteCurrentDomain}
                  disabled={deleting}
                  className="mt-4 h-10 w-full rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete domain"}
                </button>
              </section>
            ) : null}
          </aside>

          <div className="space-y-5">
            {domainRecord ? (
              <StatusCards summary={effectiveSummary} lastCheckedAt={domainRecord.lastCheckedAt} />
            ) : null}

            {records.length > 0 ? (
              groupedRecords.map((group) =>
                group.records.length > 0 ? (
                  <RecordGroup
                    key={group.key}
                    title={group.title}
                    description={group.description}
                    status={effectiveSummary?.[group.key]}
                    records={group.records}
                  />
                ) : null,
              )
            ) : (
              <section className="rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="text-lg font-semibold">DNS setup will appear here</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add a root domain to create the SES identity and generate the DNS records needed for production sending.
                </p>
              </section>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
