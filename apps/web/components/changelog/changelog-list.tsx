// this component will be made dinamically with the changelog data from the database, but for now we will hardcode it for the initial release
import { Badge } from "@/components/ui/badge";

const changelog = [
  {
    version: "v0.4.0",
    date: "June 2026",
    label: "Latest",
    title: "Channel pages and public trust pages",
    changes: [
      "Added public pages for Email, SMS, WhatsApp, and Push Notifications.",
      "Added Privacy, Security, About, and Use Cases pages.",
      "Improved public website structure for SEO and product clarity.",
    ],
  },
  {
    version: "v0.3.0",
    date: "May 2026",
    label: "Platform",
    title: "Organization and workspace foundation",
    changes: [
      "Added organization and workspace-based product structure.",
      "Added support for members, roles, onboarding, and dashboard navigation.",
      "Prepared billing, usage, and notification workflows for production setup.",
    ],
  },
  {
    version: "v0.2.0",
    date: "May 2026",
    label: "Infrastructure",
    title: "API keys, domains, and notification channels",
    changes: [
      "Added support for test and live API key workflows.",
      "Added email domain verification planning with SPF, DKIM, and DMARC guidance.",
      "Prepared Email, SMS, WhatsApp, and Push notification channel architecture.",
    ],
  },
  {
    version: "v0.1.0",
    date: "May 2026",
    label: "Initial",
    title: "TryNotifly project started",
    changes: [
      "Created the initial TryNotifly marketing site and dashboard structure.",
      "Planned multi-channel notification platform architecture.",
      "Started core pages for features, pricing, FAQ, contact, and enterprise.",
    ],
  },
];

export function ChangelogList() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative space-y-8">
          {changelog.map((item) => (
            <article
              key={item.version}
              className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{item.version}</Badge>
                <Badge>{item.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {item.date}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                {item.title}
              </h2>

              <ul className="mt-5 space-y-3">
                {item.changes.map((change) => (
                  <li
                    key={change}
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
