"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Custom monthly credits",
  "Higher rate limits",
  "SLA options",
  "Dedicated support",
  "Custom integrations",
];

export function EnterpriseForm() {
  const [submitted, setSubmitted] = useState(false);
  // Will add form handling logic here in the future, e.g. send data to CRM or email

  return (
    <section id="contact-sales" className="border-t py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-primary">Contact sales</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tell us about your notification volume
          </h2>

          <p className="mt-5 text-lg text-muted-foreground">
            Share your expected monthly usage and required channels. We will
            help you choose the right enterprise setup.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="rounded-2xl border bg-muted/20 p-6">
              <h3 className="text-xl font-semibold">Request received</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Thank you. We will review your requirements and get back to you.
              </p>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    required
                    name="name"
                    className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Work email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <input
                    required
                    name="company"
                    className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Monthly volume</label>
                  <select
                    required
                    name="volume"
                    className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select volume
                    </option>
                    <option value="100k-500k">100k - 500k</option>
                    <option value="500k-1m">500k - 1M</option>
                    <option value="1m-5m">1M - 5M</option>
                    <option value="5m+">5M+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Required channels</label>
                <input
                  name="channels"
                  className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                  placeholder="Email, SMS, WhatsApp, Push"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  className="mt-2 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                  placeholder="Tell us about your use case..."
                />
              </div>

              <Button type="submit" className="w-full">
                Submit request
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
