import { FaqCta } from "@/components/faq/faq-cta";
import { FaqHero } from "@/components/faq/faq-hero";
import { FaqList } from "@/components/faq/faq-list";

const faqGroups = [
  {
    category: "General",
    items: [
      {
        question: "What is TryNotifly?",
        answer:
          "TryNotifly is a multi-channel notification platform for sending Email, SMS, WhatsApp and Push notifications from one API and dashboard.",
      },
      {
        question: "Which channels does TryNotifly support?",
        answer:
          "TryNotifly supports Email, SMS, WhatsApp and Push notifications.",
      },
      {
        question: "Do I need a credit card to start?",
        answer:
          "No. You can start with the free plan and test the platform before upgrading.",
      },
    ],
  },
  {
    category: "Pricing & billing",
    items: [
      {
        question: "How does pricing work?",
        answer:
          "Plans include monthly credits. Credits are consumed based on the notification channel used.",
      },
      {
        question: "Do yearly plans include a discount?",
        answer:
          "Yes. Yearly billing includes a discount compared to monthly billing.",
      },
      {
        question: "Can I upgrade later?",
        answer: "Yes. You can upgrade as your usage grows.",
      },
    ],
  },
  {
    category: "Credits",
    items: [
      {
        question: "What is a credit?",
        answer:
          "A credit is the unit used to measure notification usage across channels.",
      },
      {
        question: "How many credits does each channel use?",
        answer:
          "Email and Push use 1 credit. SMS uses 25 credits. WhatsApp uses 80 credits.",
      },
      {
        question: "Do unused credits roll over?",
        answer:
          "Monthly plan credits reset every billing cycle. Enterprise plans may support custom credit rules.",
      },
    ],
  },
  {
    category: "API & developers",
    items: [
      {
        question: "Do you provide API keys?",
        answer:
          "Yes. TryNotifly supports test and live API keys for development and production usage.",
      },
      {
        question: "Do you support webhooks?",
        answer:
          "Yes. Webhooks can be used to receive delivery, failure and notification status events.",
      },
      {
        question: "Is there documentation?",
        answer: "Yes. Documentation is available at docs.trynotifly.com.",
      },
    ],
  },
  {
    category: "Domains & sending",
    items: [
      {
        question: "Why do I need to verify a domain?",
        answer:
          "Domain verification improves trust and deliverability for email sending.",
      },
      {
        question: "Which DNS records are required?",
        answer:
          "Email sending typically requires DKIM, SPF and DMARC-related DNS configuration.",
      },
      {
        question: "Can I use multiple sender addresses?",
        answer:
          "Yes. You can use multiple sender addresses under a verified domain.",
      },
    ],
  },
  {
    category: "SMS & WhatsApp compliance",
    items: [
      {
        question: "Do Indian businesses need DLT registration for SMS?",
        answer:
          "Yes. In India, businesses sending SMS through registered headers and templates generally need DLT registration. This includes entity registration, sender/header approval, and content template approval before messages can be delivered reliably.",
      },
      {
        question: "Why can SMS fail even if the API request is successful?",
        answer:
          "In India, SMS messages may be blocked or filtered by telecom operators if the sender ID, DLT entity, or message template is not approved or does not match the registered template exactly.",
      },
      {
        question: "Can TryNotifly help with SMS DLT setup?",
        answer:
          "TryNotifly can guide you through the required DLT setup, but the business usually needs to provide its own legal details, approved sender ID, and approved message templates for compliant SMS delivery.",
      },
      {
        question: "Do WhatsApp messages require business verification?",
        answer:
          "For WhatsApp Business Platform usage, businesses generally need a valid WhatsApp Business account, approved business details, an approved display name, and approved message templates for template-based conversations.",
      },
      {
        question: "Is WhatsApp green tick verification required?",
        answer:
          "No. A WhatsApp Official Business Account badge or green tick is not required for basic WhatsApp Business Platform messaging. It is an additional trust badge granted only to eligible notable brands.",
      },
      {
        question: "Why do WhatsApp templates need approval?",
        answer:
          "WhatsApp template messages are reviewed before use to prevent spam, fraud, misleading content, and policy violations. Messages sent outside an active customer service window usually need an approved template.",
      },
    ],
  },
  {
    category: "Teams & security",
    items: [
      {
        question: "Can I invite team members?",
        answer:
          "Yes. You can invite team members and manage access from the dashboard.",
      },
      {
        question: "Do you support roles?",
        answer:
          "Yes. Role-based access is supported for team and organization management.",
      },
      {
        question: "How are API keys handled?",
        answer:
          "API keys should be stored securely and are designed for separate test and live usage.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main>
      <FaqHero />
      <FaqList faqGroups={faqGroups} />
      <FaqCta />
    </main>
  );
}
