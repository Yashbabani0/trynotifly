"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  // Will integrate with a backend in the future. For now, it just shows a success message on submit.

  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-primary">Send a message</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tell us how we can help
          </h2>

          <p className="mt-5 text-lg text-muted-foreground">
            Fill out the form and we will review your message. For urgent
            platform abuse reports, choose “Abuse report” as the inquiry type.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="rounded-2xl border bg-muted/20 p-6">
              <h3 className="text-xl font-semibold">Message received</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Thank you. We will review your message and get back to you.
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
                  <label className="text-sm font-medium">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Inquiry type</label>
                <select
                  required
                  name="type"
                  defaultValue=""
                  className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="sales">Sales</option>
                  <option value="support">Support</option>
                  <option value="billing">Billing</option>
                  <option value="abuse">Abuse report</option>
                  <option value="partnership">Partnership</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <input
                  required
                  name="subject"
                  className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  required
                  name="message"
                  rows={6}
                  className="mt-2 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none ring-ring/20 transition focus:ring-4"
                  placeholder="Write your message..."
                />
              </div>

              <Button type="submit" className="w-full">
                Submit message
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
