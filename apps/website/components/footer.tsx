"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BellRing } from "lucide-react";
import { FaLinkedin, FaTwitter } from "react-icons/fa6";
import { BsGithub } from "react-icons/bs";

const URLS = {
  dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000",

  docs: process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002",

  status: process.env.NEXT_PUBLIC_STATUS_URL ?? "http://localhost:3001/status",

  github: "https://github.com/yashbabani09",
  x: "https://x.com/yashbabani0",
};

const footerLinks = {
  Product: [
    { label: "Email", href: "/email" },
    { label: "SMS", href: "/sms" },
    { label: "WhatsApp", href: "/whatsapp" },
    { label: "Push", href: "/push" },
    { label: "Pricing", href: "/pricing" },
  ],
  Resources: [
    { label: "Documentation", href: URLS.docs },
    { label: "API Reference", href: URLS.docs },
    { label: "Status", href: URLS.status },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Security", href: "/security" },
    { label: "Privacy", href: "/privacy" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Acceptable Use", href: "/acceptable-use-policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="border-b border-white/10 py-16"
        >
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Start sending notifications today
              </h2>

              <p className="mt-3 max-w-2xl text-white/60">
                Email, SMS, WhatsApp and Push notifications from a single API
                and dashboard.
              </p>
            </div>

            <Link
              href={`${URLS.dashboard}/sign-up`}
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Start free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-white text-black">
                <BellRing className="size-5" />
              </div>

              <span className="text-lg font-semibold text-white">
                TryNotifly
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
              Multi-channel notification infrastructure for modern applications.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href={URLS.github}
                className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/20 hover:text-white"
              >
                <BsGithub className="size-4" />
              </Link>

              <Link
                href={URLS.x}
                className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/20 hover:text-white"
              >
                <FaTwitter className="size-4" />
              </Link>

              <Link
                href="#"
                className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/20 hover:text-white"
              >
                <FaLinkedin className="size-4" />
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} TryNotifly. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>

            <Link href="/security" className="hover:text-white">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
