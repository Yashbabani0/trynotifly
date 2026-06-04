const sections = [
  {
    title: "1. Purpose",
    content: [
      "TryNotifly is built for legitimate transactional, authentication, operational, and customer notification workflows.",
      "This Acceptable Use Policy helps protect users, recipients, providers, telecom networks, inbox providers, WhatsApp Business ecosystems, and the TryNotifly platform from abuse.",
    ],
  },
  {
    title: "2. Prohibited use",
    content: [
      "You may not use TryNotifly to send spam, phishing messages, malware, fraudulent content, deceptive messages, impersonation attempts, harassment, threats, or illegal content.",
      "You may not use TryNotifly to collect credentials, payment details, personal data, OTPs, authentication codes, or sensitive information through deceptive or unauthorized methods.",
      "You may not use TryNotifly to violate applicable laws, telecom rules, email anti-spam rules, WhatsApp Business policies, privacy laws, or third-party provider requirements.",
    ],
  },
  {
    title: "3. Consent and recipient permissions",
    content: [
      "You are responsible for obtaining valid consent, permissions, or another lawful basis before sending notifications to recipients.",
      "You must honor opt-outs, unsubscribe requests, user preferences, and communication restrictions where applicable.",
      "You must not upload purchased, scraped, rented, or unauthorized contact lists for messaging.",
    ],
  },
  {
    title: "4. Email usage",
    content: [
      "Email must be sent from verified domains and configured with appropriate DNS records such as SPF, DKIM, and DMARC where applicable.",
      "You must not send phishing emails, deceptive sender identities, fake invoices, malicious attachments, or misleading subject lines.",
      "Transactional emails should relate to a real user action, account event, product event, order, payment, security event, or service update.",
    ],
  },
  {
    title: "5. SMS usage",
    content: [
      "SMS usage must follow applicable telecom rules, including DLT registration, approved sender IDs, approved templates, consent requirements, and regional messaging rules where required.",
      "You must not send unauthorized promotional SMS, fake OTPs, financial scams, misleading alerts, or messages intended to bypass telecom compliance.",
      "OTP and authentication messages must only be sent for legitimate verification and security workflows.",
    ],
  },
  {
    title: "6. WhatsApp usage",
    content: [
      "WhatsApp messaging must follow WhatsApp Business policies, template rules, user opt-in requirements, and applicable Meta requirements.",
      "Business-initiated WhatsApp messages should use approved templates where required.",
      "You must not send unsolicited marketing messages, deceptive business identities, prohibited goods or services, scams, or policy-violating content.",
    ],
  },
  {
    title: "7. Push notification usage",
    content: [
      "Push notifications must be sent only to users who have granted permission or otherwise opted in through your application or website.",
      "You must not use push notifications for misleading alerts, abusive engagement tactics, spam, malware distribution, or deceptive redirects.",
    ],
  },
  {
    title: "8. Platform abuse",
    content: [
      "You must not attempt to bypass rate limits, credit limits, account restrictions, security controls, provider rules, or abuse detection systems.",
      "You must not probe, scan, overload, disrupt, reverse engineer, or interfere with TryNotifly systems, APIs, infrastructure, or connected providers.",
      "You must keep API keys, webhook secrets, provider credentials, and account access secure.",
    ],
  },
  {
    title: "9. Restricted content",
    content: [
      "You may not use TryNotifly to promote or facilitate illegal activity, fraud, hate, violence, exploitation, self-harm, regulated goods without proper authorization, or other harmful activity.",
      "Messaging involving financial services, healthcare, legal services, gambling, adult content, political content, or highly regulated sectors may require additional review, approvals, or restrictions.",
    ],
  },
  {
    title: "10. Monitoring and enforcement",
    content: [
      "TryNotifly may monitor usage patterns, delivery behavior, complaints, bounces, provider responses, and abuse reports to protect the platform.",
      "We may suspend, limit, throttle, block, or terminate access if we believe your usage violates this policy, applicable law, provider rules, or platform security requirements.",
      "We may remove content, disable API keys, pause channels, reject messages, or require additional verification where needed.",
    ],
  },
  {
    title: "11. Reporting abuse",
    content: [
      "If you believe TryNotifly is being used for abuse, phishing, spam, fraud, impersonation, or harmful messaging, contact us through the contact page.",
      "Please include relevant message details, sender details, timestamps, screenshots, headers, or other evidence where available.",
    ],
  },
  {
    title: "12. Changes to this policy",
    content: [
      "We may update this Acceptable Use Policy from time to time to reflect product changes, provider requirements, legal requirements, or abuse-prevention improvements.",
    ],
  },
];

export function AcceptableUseContent() {
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
          This policy is provided for general information and should be reviewed
          with qualified legal counsel before production use.
        </p>
      </div>
    </section>
  );
}