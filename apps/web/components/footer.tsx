import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Enterprise", href: "/enterprise" },
    { label: "Changelog", href: "/changelog" },
  ],
  Channels: [
    { label: "Email", href: "/email" },
    { label: "SMS", href: "/sms" },
    { label: "WhatsApp", href: "/whatsapp" },
    { label: "Push Notifications", href: "/push-notifications" },
  ],
  Resources: [
    { label: "Documentation", href: "https://docs.trynotifly.com" },
    { label: "FAQ", href: "/faq" },
    { label: "Security", href: "/security" },
    { label: "Status", href: "/status" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Acceptable Use Policy", href: "/acceptable-use-policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 font-semibold"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                T
              </div>

              <span>TryNotifly</span>
            </Link>

            <p className="max-w-xs text-sm text-muted-foreground">
              Multi-channel notifications for Email, SMS, WhatsApp, and Push
              with a developer-first API.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-sm font-semibold">{section}</h3>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TryNotifly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
