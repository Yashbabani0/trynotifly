"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, BellRing, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3000";

const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002/docs";

const SIGN_IN_URL = `${DASHBOARD_URL}/sign-in`;
const SIGN_UP_URL = `${DASHBOARD_URL}/sign-up`;

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Channels", href: "#channels" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: DOCS_URL },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50"
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav className="flex h-16 items-center justify-between rounded-full border border-white/10 bg-black/70 px-4 shadow-2xl shadow-black/40 backdrop-blur-xl md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-white text-black">
              <BellRing className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              TryNotifly
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              asChild
              variant="ghost"
              className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link href={SIGN_IN_URL}>Sign in</Link>
            </Button>

            <Button
              asChild
              className="rounded-full bg-white text-black hover:bg-white/90"
            >
              <Link href={SIGN_UP_URL}>
                Start free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-white hover:bg-white/10 md:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="border-white/10 bg-black text-white"
            >
              <div className="mt-8 flex flex-col gap-2">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="mt-8 grid gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href={SIGN_IN_URL}>Sign in</Link>
                </Button>

                <Button
                  asChild
                  className="rounded-full bg-white text-black hover:bg-white/90"
                >
                  <Link href={SIGN_UP_URL}>
                    Start free
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </motion.header>
  );
}
