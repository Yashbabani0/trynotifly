"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/auth/form-field";
import {
  copyText,
  DnsRecordsTable,
  formatDate,
  getSummary,
  recordValue,
  StatusBadge,
  type DnsRecord,
  type DomainStatusSummary,
  type EmailDomain,
  type SenderEmailIdentity,
} from "@/components/domains/domain-shared";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error?: { code: string; message: string; details?: unknown } };

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    const message =
      payload && !payload.success
        ? payload.error?.message ?? "Request failed."
        : `Request failed with status ${response.status}.`;
    const error = new Error(message) as Error & { code?: string };
    error.code = payload && !payload.success ? payload.error?.code : undefined;
    throw error;
  }

  return payload.data;
}

function normalizeMailFrom(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

function validateMailFrom(value: string, rootDomain: string) {
  const normalized = normalizeMailFrom(value);

  if (!normalized) {
    return { ok: false as const, message: "Enter a MAIL FROM subdomain." };
  }

  if (normalized === rootDomain) {
    return { ok: false as const, message: "MAIL FROM must be a subdomain, not the root domain." };
  }

  if (!normalized.endsWith(`.${rootDomain}`)) {
    return { ok: false as const, message: `MAIL FROM must end with .${rootDomain}.` };
  }

  if (!/^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(normalized)) {
    return { ok: false as const, message: "Enter a valid MAIL FROM hostname." };
  }

  return { ok: true as const, mailFromDomain: normalized };
}

function Stepper({
  domain,
  records,
  summary,
}: {
  domain: EmailDomain;
  records: DnsRecord[];
  summary: DomainStatusSummary;
}) {
  const ready = summary.domainStatus === "ready";
  const failed = summary.domainStatus === "failed";
  const labels = ["Domain added", "SES identity created", "DNS records generated", "Verifying DNS", "Ready"];
  const currentIndex = ready ? 4 : records.length > 0 ? 3 : domain ? 2 : 0;

  return (
    <section className="grid gap-3 md:grid-cols-5">
      {labels.map((label, index) => {
        const completed = ready ? index <= 4 : index < currentIndex;
        const current = !ready && index === currentIndex;
        const failedStep = failed && current;

        return (
          <div
            key={label}
            className={`rounded-lg border p-3 ${
              failedStep
                ? "border-red-700 bg-red-600/10"
                : completed
                  ? "border-emerald-700 bg-emerald-600/15"
                  : current
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xs">STEP {index + 1}</p>
              {completed ? <span className="text-sm font-bold text-emerald-500">✓</span> : null}
            </div>
            <p className="mt-1 text-sm font-medium">{label}</p>
          </div>
        );
      })}
    </section>
  );
}

export function DomainDetailClient({
  initialDomain,
  canManage = true,
}: {
  initialDomain: string;
  canManage?: boolean;
}) {
  const [domain, setDomain] = useState<EmailDomain | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [savingMailFrom, setSavingMailFrom] = useState(false);
  const [senderLoading, setSenderLoading] = useState(false);
  const [senderActionId, setSenderActionId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mailFromInput, setMailFromInput] = useState("");
  const [senderLocalPart, setSenderLocalPart] = useState("");
  const [senderDisplayName, setSenderDisplayName] = useState("");
  const [senders, setSenders] = useState<SenderEmailIdentity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: "default" | "success" | "error"; message: string } | null>(null);

  const summary = useMemo(() => (domain ? getSummary(domain) : null), [domain]);

  function applyPayload(data: {
    domain: EmailDomain;
    records?: Record<string, DnsRecord[]>;
    statusSummary?: DomainStatusSummary;
  }) {
    const nextDomain = {
      ...data.domain,
      statusSummary: data.statusSummary ?? data.domain.statusSummary,
    };
    setDomain(nextDomain);
    setRecords(data.records ? Object.values(data.records).flat() : data.domain.dnsRecords ?? []);
    setMailFromInput(data.domain.mailFromDomain ?? `mail.${data.domain.domain}`);
  }

  async function loadDomain() {
    setError(null);
    const data = await fetch(`/api/domains/${encodeURIComponent(initialDomain)}`, {
      cache: "no-store",
    }).then(
      handleResponse<{
        domain: EmailDomain;
        records: Record<string, DnsRecord[]>;
        statusSummary?: DomainStatusSummary;
      }>,
    );
    applyPayload(data);
  }

  async function loadSenders(targetDomain = initialDomain) {
    const data = await fetch(`/api/domains/${encodeURIComponent(targetDomain)}/senders`, {
      cache: "no-store",
    }).then(
      handleResponse<{
        senders: SenderEmailIdentity[];
      }>,
    );
    setSenders(data.senders);
  }

  async function refreshVerification() {
    const currentDomain = domain?.domain ?? initialDomain;
    setChecking(true);
    setError(null);

    try {
      const data = await fetch(`/api/domains/${encodeURIComponent(currentDomain)}/check`, {
        method: "POST",
      }).then(
        handleResponse<{
          domain: EmailDomain;
          records: Record<string, DnsRecord[]>;
          statusSummary?: DomainStatusSummary;
        }>,
      );
      applyPayload(data);
      const nextSummary = data.statusSummary ?? getSummary(data.domain);
      setToast({
        tone: nextSummary.domainStatus === "ready" ? "success" : nextSummary.domainStatus === "failed" ? "error" : "default",
        message: nextSummary.message,
      });
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Could not refresh verification.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setChecking(false);
    }
  }

  async function saveMailFrom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!domain) {
      return;
    }

    const validation = validateMailFrom(mailFromInput, domain.domain);

    if (!validation.ok) {
      setError(validation.message);
      setToast({ tone: "error", message: validation.message });
      return;
    }

    setSavingMailFrom(true);
    setError(null);

    try {
      const data = await fetch(`/api/domains/${encodeURIComponent(domain.domain)}/mail-from`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailFromDomain: validation.mailFromDomain }),
      }).then(
        handleResponse<{
          domain: EmailDomain;
          records: Record<string, DnsRecord[]>;
          statusSummary?: DomainStatusSummary;
        }>,
      );
      applyPayload(data);
      setToast({
        tone: "success",
        message: "MAIL FROM updated. Add the new MX and TXT records, then refresh verification.",
      });
    } catch (mailFromError) {
      const message = mailFromError instanceof Error ? mailFromError.message : "Could not update MAIL FROM.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSavingMailFrom(false);
    }
  }

  async function addSenderEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!domain) {
      return;
    }

    const localPart = senderLocalPart.trim().toLowerCase();
    const email = localPart.includes("@") ? localPart : `${localPart}@${domain.domain}`;

    setSenderLoading(true);
    setError(null);

    try {
      await fetch(`/api/domains/${encodeURIComponent(domain.domain)}/senders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName: senderDisplayName.trim() || null,
        }),
      }).then(handleResponse<{ sender: SenderEmailIdentity }>);
      await loadSenders(domain.domain);
      setSenderLocalPart("");
      setSenderDisplayName("");
      setToast({ tone: "success", message: "Sender email added." });
    } catch (senderError) {
      const message = senderError instanceof Error ? senderError.message : "Could not add sender email.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSenderLoading(false);
    }
  }

  async function updateSender(senderId: string, body: { status?: "active" | "disabled"; isDefault?: boolean }) {
    if (!domain) {
      return;
    }

    setSenderActionId(senderId);
    setError(null);

    try {
      const data = await fetch(`/api/domains/${encodeURIComponent(domain.domain)}/senders/${senderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(
        handleResponse<{
          sender?: SenderEmailIdentity;
          senders?: SenderEmailIdentity[];
        }>,
      );

      if (data.senders) {
        setSenders(data.senders);
      } else {
        await loadSenders(domain.domain);
      }

      setToast({
        tone: "success",
        message: body.isDefault ? "Default sender updated." : "Sender email updated.",
      });
    } catch (senderError) {
      const message = senderError instanceof Error ? senderError.message : "Could not update sender email.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSenderActionId(null);
    }
  }

  async function removeSender(sender: SenderEmailIdentity) {
    if (!domain) {
      return;
    }

    if (!window.confirm(`Remove ${sender.email} from approved senders?`)) {
      return;
    }

    setSenderActionId(sender.id);
    setError(null);

    try {
      await fetch(`/api/domains/${encodeURIComponent(domain.domain)}/senders/${sender.id}`, {
        method: "DELETE",
      }).then(handleResponse<{ deleted: boolean; senderId: string }>);
      setSenders((current) => current.filter((item) => item.id !== sender.id));
      setToast({ tone: "success", message: "Sender email removed." });
    } catch (senderError) {
      const message = senderError instanceof Error ? senderError.message : "Could not remove sender email.";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setSenderActionId(null);
    }
  }

  async function deleteDomain() {
    if (!domain) {
      return;
    }

    if (!window.confirm(`Delete ${domain.domain}? This removes the SES identity and cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await fetch(`/api/domains/${encodeURIComponent(domain.domain)}`, {
        method: "DELETE",
      }).then(handleResponse<{ deleted: boolean; domain: string }>);
      window.location.href = "/dashboard/organization/domains";
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Could not delete domain.";
      setError(message);
      setToast({ tone: "error", message });
      setDeleting(false);
    }
  }

  async function copyAllRecords() {
    const output = records
      .map((record) => `${record.type}\t${record.host}\t${recordValue(record)}`)
      .join("\n");
    await copyText(output);
    setToast({ tone: "success", message: "All DNS records copied." });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDomain()
        .then(() => loadSenders(initialDomain))
        .catch((loadError) => {
          const message = loadError instanceof Error ? loadError.message : "Could not load domain.";
          setError(message);
          setToast({ tone: "error", message });
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDomain]);

  if (loading) {
    return (
      <div className="text-foreground">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-80 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!domain || !summary) {
    return (
      <div className="text-foreground">
        <div className="mx-auto max-w-3xl py-16 text-center">
          <h1 className="text-2xl font-semibold">Domain not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error ?? "This domain does not exist in your organization."}</p>
          <Link href="/dashboard/organization/domains" className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Back to domains
          </Link>
        </div>
      </div>
    );
  }

  const mailFromStatus =
    summary.mailFromMxStatus === "verified" && summary.mailFromSpfStatus === "verified"
      ? "verified"
      : summary.mailFromMxStatus === "failed" || summary.mailFromSpfStatus === "failed"
        ? "failed"
        : summary.mailFromMxStatus === "not_configured" ||
            summary.mailFromSpfStatus === "not_configured"
          ? "not_configured"
          : "pending";

  return (
    <div className="text-foreground">
      <Toast tone={toast?.tone} message={toast?.message ?? null} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/dashboard/organization/domains" className="text-sm text-muted-foreground hover:text-foreground">
              Organization / Domains
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal">{domain.domain}</h1>
              <StatusBadge status={summary.domainStatus} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{summary.message}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyAllRecords()}
              className="h-10 rounded-md border border-border px-4 text-sm font-semibold hover:bg-accent"
            >
              Copy all records
            </button>
            <button
              type="button"
              onClick={() => void refreshVerification()}
              disabled={checking || !canManage}
              className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {checking ? "Refreshing..." : "Refresh status"}
            </button>
          </div>
        </header>

        <Stepper domain={domain} records={records} summary={summary} />

        {error ? (
          <div className="rounded-lg border border-red-700 bg-red-600/10 p-4 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["SES identity", summary.sesIdentityStatus],
            ["DKIM", summary.dkimStatus],
            ["SPF", summary.spfStatus],
            ["DMARC", summary.dmarcStatus],
            ["MAIL FROM MX", summary.mailFromMxStatus],
            ["MAIL FROM SPF", summary.mailFromSpfStatus],
          ].map(([label, status]) => (
            <div key={label} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="mt-3">
                <StatusBadge status={status as typeof summary.sesIdentityStatus} />
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">Domain state</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Provider</dt>
                  <dd>{domain.provider ?? "AWS SES"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Sending enabled</dt>
                  <dd>{domain.sendingEnabled ? "Yes" : "No"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(domain.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Last checked</dt>
                  <dd>{formatDate(domain.lastCheckedAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Last verified</dt>
                  <dd>{formatDate(domain.verifiedAt ?? domain.lastVerifiedAt)}</dd>
                </div>
              </dl>
            </section>

            <section id="settings" className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">MAIL FROM</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Controls the return-path and bounce domain used for SPF alignment.
                  </p>
                </div>
                <StatusBadge status={mailFromStatus} />
              </div>
              <form onSubmit={saveMailFrom} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="mailFrom" className="text-sm font-medium text-muted-foreground">
                    MAIL FROM domain
                  </label>
                  <input
                    id="mailFrom"
                    value={mailFromInput}
                    onChange={(event) => setMailFromInput(event.target.value)}
                    placeholder={`mail.${domain.domain}`}
                    disabled={!canManage}
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm outline-none ring-ring transition focus:ring-2"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Most teams should keep <code className="font-mono text-foreground">mail.{domain.domain}</code>. Custom examples: <code className="font-mono text-foreground">bounce.{domain.domain}</code>, <code className="font-mono text-foreground">mailer.{domain.domain}</code>.
                </p>
                <button
                  type="submit"
                  disabled={savingMailFrom || !canManage || normalizeMailFrom(mailFromInput) === domain.mailFromDomain}
                  className="h-10 w-full rounded-md border border-border px-4 text-sm font-semibold hover:bg-accent disabled:opacity-50"
                >
                  {savingMailFrom ? "Saving..." : "Update MAIL FROM"}
                </button>
              </form>
            </section>

            <section id="senders" className="rounded-lg border border-border bg-card p-5">
              <div>
                <h2 className="text-base font-semibold">Sender emails</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once your domain is verified, you can send from any address on this domain. Add common senders like noreply, support, billing, or contact.
                </p>
              </div>

              {summary.domainStatus !== "ready" ? (
                <div className="mt-4 rounded-lg border border-amber-600 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  Domain must be ready before sender emails can be activated.
                </div>
              ) : null}

              <form onSubmit={addSenderEmail} className="mt-5 space-y-3">
                <div>
                  <label htmlFor="senderLocalPart" className="text-sm font-medium text-muted-foreground">
                    Sender local part
                  </label>
                  <div className="mt-2 flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                    <input
                      id="senderLocalPart"
                      value={senderLocalPart}
                      onChange={(event) => setSenderLocalPart(event.target.value)}
                      placeholder="noreply"
                      disabled={!canManage}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                    />
                    <span className="shrink-0 border-l border-border px-3 py-2 font-mono text-xs text-muted-foreground">
                      @{domain.domain}
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="senderDisplayName" className="text-sm font-medium text-muted-foreground">
                    Display name
                  </label>
                  <input
                    id="senderDisplayName"
                    value={senderDisplayName}
                    onChange={(event) => setSenderDisplayName(event.target.value)}
                    placeholder="TryNotifly"
                    disabled={!canManage}
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-ring transition focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={senderLoading || !canManage || summary.domainStatus !== "ready" || !senderLocalPart.trim()}
                  className="h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {senderLoading ? "Adding..." : "Add sender email"}
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {senders.length === 0 ? (
                  <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
                    No sender emails yet. Add one before sending through the API.
                  </div>
                ) : (
                  senders.map((sender) => (
                    <div key={sender.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{sender.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {sender.displayName || "No display name"} · {sender.status}
                            {sender.isDefault ? " · default" : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!sender.isDefault && sender.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => void updateSender(sender.id, { isDefault: true })}
                              disabled={senderActionId === sender.id || !canManage}
                              className="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
                            >
                              Default
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              void updateSender(sender.id, {
                                status: sender.status === "active" ? "disabled" : "active",
                              })
                            }
                            disabled={senderActionId === sender.id || !canManage}
                            className="h-8 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent disabled:opacity-50"
                          >
                            {sender.status === "active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeSender(sender)}
                            disabled={senderActionId === sender.id || !canManage}
                            className="h-8 rounded-md border border-red-700/50 px-3 text-xs font-medium text-red-700 hover:bg-red-600/10 dark:text-red-200 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">What to do next</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {summary.domainStatus === "ready" ? (
                  <li>This domain is ready. You can send production email from it.</li>
                ) : (
                  <>
                    <li>Add or fix the pending DNS records below.</li>
                    <li>DNS propagation usually takes minutes, but can take up to 72 hours.</li>
                    <li>Refresh status after your DNS provider shows the records.</li>
                  </>
                )}
              </ul>
            </section>

            <section className="rounded-lg border border-red-700/40 bg-red-600/10 p-5">
              <h2 className="text-base font-semibold text-red-700 dark:text-red-200">Danger zone</h2>
              <p className="mt-2 text-sm text-red-700/80 dark:text-red-200/80">
                Deletes this domain from TryNotifly and removes the SES identity.
              </p>
              <button
                type="button"
                onClick={() => void deleteDomain()}
                disabled={deleting || !canManage}
                className="mt-4 h-10 w-full rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete domain"}
              </button>
            </section>
          </aside>

          <div className="space-y-5">
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">DNS provider instructions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Some DNS providers automatically append your root domain. Enter only the host portion unless your provider requires full values. For example, use <code className="font-mono text-foreground">mail</code> instead of <code className="font-mono text-foreground">mail.{domain.domain}</code> when the provider appends the domain.
              </p>
            </section>
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">Deliverability guidance</h2>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <p>
                  MAIL FROM is the envelope/return-path domain for bounces. It is separate from the visible From address and should not be used for normal sending or receiving mail.
                </p>
                <p>
                  For stronger sender reputation isolation, use a sending subdomain such as <code className="font-mono text-foreground">mail.example.com</code>, <code className="font-mono text-foreground">notify.example.com</code>, or <code className="font-mono text-foreground">updates.example.com</code> for high-volume transactional email.
                </p>
                <p>
                  Recommended DNS: DKIM verified, SPF includes SES, DMARC present, and custom MAIL FROM MX/SPF. BIMI is optional and does not block sending.
                </p>
              </div>
            </section>
            <DnsRecordsTable records={records} onCopy={(message) => setToast({ tone: "success", message })} />
          </div>
        </section>
      </div>
    </div>
  );
}
