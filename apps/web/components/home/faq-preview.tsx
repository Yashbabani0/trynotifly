// components/home/faq-preview.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is TryNotifly?",
    answer:
      "TryNotifly is a multi-channel notification platform that lets you send Email, SMS, WhatsApp and Push notifications from one API and dashboard.",
  },
  {
    question: "Can I start for free?",
    answer:
      "Yes. TryNotifly includes a free plan with monthly credits so you can test the platform before upgrading.",
  },
  {
    question: "Do I need separate providers for every channel?",
    answer:
      "No. TryNotifly gives you one dashboard, one API, one billing system and unified analytics across supported channels.",
  },
  {
    question: "Can I use it for OTPs and transactional messages?",
    answer:
      "Yes. TryNotifly is designed for transactional notifications such as OTPs, account updates, order alerts, invoices and system notifications.",
  },
  {
    question: "Where do I manage domains and templates?",
    answer:
      "You can manage verified sending domains, templates, API keys, team members and analytics inside the TryNotifly dashboard.",
  },
];

export function FaqPreview() {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-primary">Questions</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently asked questions
          </h2>

          <p className="mt-5 text-lg text-muted-foreground">
            Quick answers about TryNotifly, channels, credits and how the
            platform works.
          </p>

          <Link
            href="/faq"
            className="mt-8 inline-flex items-center text-sm font-medium text-primary"
          >
            View all FAQs
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
