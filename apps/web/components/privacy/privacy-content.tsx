const sections = [
  {
    title: "1. Information we collect",
    content: [
      "We may collect account information such as name, email address, organization name, workspace details, billing details, and authentication information.",
      "We may collect notification-related data such as recipient addresses, phone numbers, device tokens, message metadata, delivery status, logs, templates, sender IDs, domains, and provider responses.",
      "We may collect technical information such as IP address, browser type, device information, API usage, request logs, error logs, and security events.",
    ],
  },
  {
    title: "2. How we use information",
    content: [
      "We use information to provide the TryNotifly platform, process notification requests, manage accounts, verify domains, provide billing, prevent abuse, improve reliability, and support customers.",
      "We may use technical and usage information to monitor system performance, debug errors, protect the platform, enforce rate limits, and improve product functionality.",
    ],
  },
  {
    title: "3. Notification data",
    content: [
      "TryNotifly processes notification data so that you can send Email, SMS, WhatsApp, and Push notifications to your users.",
      "You are responsible for ensuring that you have the required consent, legal basis, approved templates, sender registrations, and compliance permissions before sending notifications.",
      "We do not sell notification recipient data.",
    ],
  },
  {
    title: "4. Third-party providers",
    content: [
      "TryNotifly may use third-party infrastructure and communication providers to deliver notifications, process payments, store data, monitor errors, provide analytics, and operate the platform.",
      "Examples may include cloud hosting providers, email providers, SMS providers, WhatsApp Business providers, push notification providers, payment processors, analytics tools, and error monitoring services.",
    ],
  },
  {
    title: "5. Cookies and tracking",
    content: [
      "We may use cookies and similar technologies for authentication, session management, security, preferences, analytics, and product improvement.",
      "You can control cookies through your browser settings, but some platform features may not work correctly without required cookies.",
    ],
  },
  {
    title: "6. Data retention",
    content: [
      "We retain information for as long as needed to provide the service, comply with legal obligations, resolve disputes, prevent abuse, maintain security, and enforce agreements.",
      "Notification logs and delivery records may be retained for operational, billing, debugging, and compliance purposes.",
    ],
  },
  {
    title: "7. Data security",
    content: [
      "We use reasonable technical and organizational measures to protect information from unauthorized access, misuse, loss, disclosure, alteration, and destruction.",
      "No system is completely secure. You are responsible for protecting your account credentials, API keys, webhook secrets, and access to your workspace.",
    ],
  },
  {
    title: "8. Your responsibilities",
    content: [
      "You must only upload, process, or send data that you are legally allowed to use.",
      "You are responsible for obtaining consent from your users where required, following telecom rules, WhatsApp Business policies, email anti-spam rules, and applicable privacy laws.",
      "You must not use TryNotifly for spam, phishing, fraud, harassment, illegal content, or abusive messaging.",
    ],
  },
  {
    title: "9. Your rights",
    content: [
      "Depending on applicable law, you may have rights to access, correct, export, restrict, or delete certain personal information.",
      "To request help with privacy-related matters, contact us using the details provided on our contact page.",
    ],
  },
  {
    title: "10. Changes to this policy",
    content: [
      "We may update this Privacy Policy from time to time. When we make material changes, we may update the date on this page or notify users through appropriate channels.",
    ],
  },
];

export function PrivacyContent() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold tracking-tight">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.content.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          This page is provided for general information and should be reviewed
          with qualified legal counsel before production use.
        </p>
      </div>
    </section>
  );
}