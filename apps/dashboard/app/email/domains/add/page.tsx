"use client";

import React, { useEffect, useMemo, useState } from "react";

type VerificationStatus = "pending" | "verified" | "failed";
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
  reason?: string;
  actualRecords?: string[];
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
      };
    };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";
const organizationId =
  process.env.NEXT_PUBLIC_ORGANIZATION_ID ??
  "b7e67033-8f64-450f-b535-82342bfd508a";

const groups: {
  key: string;
  title: string;
  description: string;
  steps: DnsRecord["step"][];
}[] = [
  {
    key: "dkim",
    title: "DKIM",
    description: "Proves TryNotifly is allowed to sign mail for this domain.",
    steps: ["DKIM"],
  },
  {
    key: "spf",
    title: "Root SPF",
    description: "Authorizes Amazon SES as a sender for the root domain.",
    steps: ["SPF"],
  },
  {
    key: "dmarc",
    title: "DMARC",
    description: "Starts DMARC monitoring with a non-blocking policy.",
    steps: ["DMARC"],
  },
  {
    key: "mailFromMx",
    title: "MAIL FROM MX",
    description: "Routes bounce handling through the custom MAIL FROM domain.",
    steps: ["MAIL_FROM_MX"],
  },
  {
    key: "mailFromSpf",
    title: "MAIL FROM SPF",
    description: "Authorizes SES for bounce-domain SPF checks.",
    steps: ["MAIL_FROM_SPF"],
  },
];

function statusTone(status?: VerificationStatus | DomainStatus) {
  if (status === "verified" || status === "VERIFIED") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "failed" || status === "FAILED") {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }

  return "border-amber-400/30 bg-amber-400/10 text-amber-100";
}

function labelForStatus(status?: VerificationStatus | DomainStatus) {
  if (!status || status === "PENDING") {
    return "Pending";
  }

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function recordKey(record: DnsRecord, index: number) {
  return `${record.step}-${record.type}-${record.host}-${index}`;
}

function Badge({ status }: { status?: VerificationStatus | DomainStatus }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium ${statusTone(
        status,
      )}`}
    >
      {labelForStatus(status)}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
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
      className="h-8 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
      title="Copy value"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function FieldValue({ value }: { value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <code className="min-w-0 flex-1 break-all rounded-md bg-muted px-2.5 py-2 font-mono text-xs text-zinc-100">
        {value}
      </code>
      <CopyButton value={value} />
    </div>
  );
}

function RecordGroup({
  title,
  description,
  records,
}: {
  title: string;
  description: string;
  records: DnsRecord[];
}) {
  const groupStatus = records.every((record) => record.status === "verified")
    ? "verified"
    : records.some((record) => record.status === "failed")
      ? "failed"
      : "pending";

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge status={groupStatus} />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        {records.map((record, index) => (
          <div
            key={recordKey(record, index)}
            className="grid gap-4 border-b border-border p-4 last:border-b-0 lg:grid-cols-[90px_1fr_1.5fr_92px]"
          >
            <div>
              <p className="text-xs uppercase text-muted-foreground">Type</p>
              <p className="mt-2 font-mono text-sm">{record.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Host</p>
              <div className="mt-2">
                <FieldValue value={record.host} />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Value</p>
              <div className="mt-2">
                <FieldValue
                  value={
                    record.priority
                      ? `${record.priority} ${record.value}`
                      : record.value
                  }
                />
              </div>
              {record.actualRecords && record.actualRecords.length > 0 ? (
                <p className="mt-2 break-all text-xs text-muted-foreground">
                  Actual: {record.actualRecords.join(", ")}
                </p>
              ) : null}
              {record.reason ? (
                <p className="mt-2 text-xs text-amber-100">{record.reason}</p>
              ) : null}
            </div>
            <div className="flex items-start lg:justify-end">
              <Badge status={record.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AddDomainPage() {
  const [domain, setDomain] = useState("");
  const [domainRecord, setDomainRecord] = useState<DomainRecord | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = domainRecord?.fullyVerified ? 5 : records.length > 0 ? 4 : domain ? 1 : 1;
  const groupedRecords = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        records: records.filter((record) => group.steps.includes(record.step)),
      })),
    [records],
  );

  async function handleResponse<T>(response: Response): Promise<T> {
    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      throw new Error(
        !payload.success
          ? payload.error?.message ?? "Request failed."
          : "Request failed.",
      );
    }

    return payload.data;
  }

  async function createDomain(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await fetch(`${apiUrl}/v1/domain/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId,
        },
        body: JSON.stringify({
          domain,
        }),
      }).then(
        handleResponse<{
          domain: DomainRecord;
          records: Record<string, DnsRecord[]>;
        }>,
      );

      setDomainRecord(data.domain);
      setDomain(data.domain.domain);
      setRecords(Object.values(data.records).flat());
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create domain.");
    } finally {
      setLoading(false);
    }
  }

  async function checkDomain() {
    const targetDomain = domainRecord?.domain ?? domain;

    if (!targetDomain) {
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const data = await fetch(`${apiUrl}/v1/domain/check/${targetDomain}`, {
        method: "POST",
        headers: {
          "x-organization-id": organizationId,
        },
      }).then(
        handleResponse<{
          domain: DomainRecord;
          records: Record<string, DnsRecord[]>;
        }>,
      );

      setDomainRecord(data.domain);
      setRecords(Object.values(data.records).flat());
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "Could not verify domain.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (!domainRecord || domainRecord.fullyVerified) {
      return;
    }

    const interval = window.setInterval(() => {
      void checkDomain();
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [domainRecord?.domain, domainRecord?.fullyVerified]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Dashboard / Email / Domains</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Add sending domain
            </h1>
          </div>
          {domainRecord ? <Badge status={domainRecord.status} /> : null}
        </header>

        <section className="grid gap-3 md:grid-cols-5">
          {["Add domain", "Create identity", "DNS setup", "Verify", "Ready"].map(
            (step, index) => {
              const active = currentStep >= index + 1;

              return (
                <div
                  key={step}
                  className={`rounded-lg border p-3 ${
                    active
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <p className="font-mono text-xs">STEP {index + 1}</p>
                  <p className="mt-1 text-sm font-medium">{step}</p>
                </div>
              );
            },
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Domain</h2>
            <form onSubmit={createDomain} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="domain"
                  className="text-sm font-medium text-muted-foreground"
                >
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
                disabled={loading || !domain}
                className="h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Generate DNS records"}
              </button>

              {domainRecord ? (
                <button
                  type="button"
                  onClick={checkDomain}
                  disabled={checking}
                  className="h-10 w-full rounded-md border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checking ? "Checking..." : "Retry verification"}
                </button>
              ) : null}
            </form>

            {error ? (
              <div className="mt-5 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="mt-5 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
              DNS providers often append your domain automatically. If your DNS
              UI asks for a host, enter values like{" "}
              <code className="font-mono text-foreground">mail</code> or{" "}
              <code className="font-mono text-foreground">_dmarc</code>, not the
              full domain, unless your provider explicitly requires it.
            </div>
          </aside>

          <div className="space-y-5">
            {domainRecord?.fullyVerified ? (
              <section className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-6">
                <h2 className="text-xl font-semibold text-emerald-100">
                  Domain ready for sending
                </h2>
                <p className="mt-2 text-sm text-emerald-100/80">
                  SES, DKIM, SPF, DMARC, and MAIL FROM checks are all verified.
                </p>
              </section>
            ) : null}

            {domainRecord ? (
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["SES", domainRecord.sesVerified],
                  ["DKIM", domainRecord.dkimVerified],
                  ["SPF", domainRecord.spfVerified],
                  ["DMARC", domainRecord.dmarcVerified],
                  ["MAIL FROM MX", domainRecord.mailFromMxVerified],
                  ["MAIL FROM SPF", domainRecord.mailFromSpfVerified],
                ].map(([label, verified]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <div className="mt-3">
                      <Badge status={verified ? "verified" : "pending"} />
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {records.length > 0 ? (
              groupedRecords.map((group) =>
                group.records.length > 0 ? (
                  <RecordGroup
                    key={group.key}
                    title={group.title}
                    description={group.description}
                    records={group.records}
                  />
                ) : null,
              )
            ) : (
              <section className="rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="text-lg font-semibold">DNS setup will appear here</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add a root domain to create the SES identity and generate every
                  DNS record needed for production sending.
                </p>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
