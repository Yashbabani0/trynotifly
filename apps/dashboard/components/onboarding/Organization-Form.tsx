"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getNames } from "country-list";

const countries = getNames().sort();

const industryOptions = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "logistics", label: "Logistics" },
  { value: "gaming", label: "Gaming" },
  { value: "other", label: "Other" },
];

const sizeOptions = [
  { value: "1", label: "1" },
  { value: "2_10", label: "2–10" },
  { value: "11_50", label: "11–50" },
  { value: "51_200", label: "51–200" },
  { value: "201_500", label: "201–500" },
  { value: "501_1000", label: "501–1000" },
  { value: "1000_plus", label: "1000+" },
];

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeWebsite(input: string) {
  if (!input.trim()) return "";

  let value = input.trim().toLowerCase();

  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);

    return `${url.protocol}//${url.hostname}`;
  } catch {
    return null;
  }
}

const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(80, "Organization name is too long")
    .regex(
      /^[a-zA-Z0-9\s&.,'-]+$/,
      "Organization name contains invalid characters",
    ),

  slug: z
    .string()
    .trim()
    .min(2, "Organization slug is required")
    .max(32, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),

  website: z
    .string()
    .optional()
    .transform((value) => normalizeWebsite(value || ""))
    .refine((value) => value !== null, "Enter a valid website"),

  industry: z.string().min(1, "Select an industry"),

  size: z.string().min(1, "Select organization size"),

  country: z
    .string()
    .refine((value) => countries.includes(value), "Select a valid country"),

  billingEmail: z.email("Enter a valid billing email"),
});

export default function OrganizationForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    slugTouched: false,
    website: "",
    industry: "saas",
    size: "1",
    country: "",
    billingEmail: "",
  });

  const [countryFocused, setCountryFocused] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!form.country) {
      return countries.slice(0, 8);
    }

    return countries
      .filter((country) =>
        country.toLowerCase().includes(form.country.toLowerCase()),
      )
      .slice(0, 8);
  }, [form.country]);

  function updateField(key: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const checkSlugAvailability = useCallback(
    async (slug: string) => {
      if (!slug || slug.length < 2) {
        return;
      }

      try {
        setSlugChecking(true);

        const response = await fetch(`/api/onboarding/check-slug?slug=${slug}`);

        const data = await response.json();

        if (slug !== form.slug) {
          return;
        }

        setSlugAvailable(data.available);
      } catch {
        if (slug === form.slug) {
          setSlugAvailable(null);
        }
      } finally {
        if (slug === form.slug) {
          setSlugChecking(false);
        }
      }
    },
    [form.slug],
  );

  useEffect(() => {
    if (!form.slug || form.slug.length < 2) {
      return;
    }

    const timeout = setTimeout(() => {
      checkSlugAvailability(form.slug);
    }, 500);

    return () => clearTimeout(timeout);
  }, [form.slug, checkSlugAvailability]);

  function handleNameChange(value: string) {
    updateField("name", value);

    if (!form.slugTouched) {
      const generatedSlug = generateSlug(value);

      setSlugAvailable(null);

      updateField("slug", generatedSlug);
    }
  }

  function handleSlugChange(value: string) {
    const formatted = generateSlug(value);

    setSlugAvailable(null);

    updateField("slugTouched", true);

    updateField("slug", formatted);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    const validated = organizationSchema.safeParse(form);

    if (!validated.success) {
      setError(validated.error.issues[0]?.message || "Invalid form");

      return;
    }

    if (slugAvailable !== true) {
      setError("Please choose an available organization slug");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/onboarding/organization", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(validated.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create organization");

        return;
      }

      router.push("/onboarding/plan");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-lime-400">
          Step 01 · Organization
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Create organization
        </h1>

        <p className="mt-4 leading-7 text-zinc-400">
          Configure your organization profile before setting up notification
          channels and API infrastructure.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Organization name"
            value={form.name}
            onChange={handleNameChange}
            placeholder="TryNotifly"
          />

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Organization slug
            </label>

            <div>
              <input
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="trynotifly"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/3 px-4 text-white outline-none transition focus:border-lime-400/50 focus:bg-white/5"
              />

              <div className="mt-2 text-xs">
                {form.slug.length < 2 ? (
                  <span className="text-zinc-500">
                    Used in your organization URL
                  </span>
                ) : slugChecking ? (
                  <span className="text-zinc-500">
                    Checking availability...
                  </span>
                ) : slugAvailable === true ? (
                  <span className="text-lime-400">Slug available</span>
                ) : slugAvailable === false ? (
                  <span className="text-red-400">Slug already taken</span>
                ) : (
                  <span className="text-zinc-500">
                    Waiting for validation...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Field
          label="Website"
          value={form.website}
          onChange={(value) => updateField("website", value)}
          placeholder="trynotifly.com"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Industry"
            value={form.industry}
            onChange={(value) => updateField("industry", value)}
            options={industryOptions}
          />

          <SelectField
            label="Organization size"
            value={form.size}
            onChange={(value) => updateField("size", value)}
            options={sizeOptions}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Country
            </label>

            <div className="relative">
              <input
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                onFocus={() => setCountryFocused(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setCountryFocused(false);
                  }, 150);
                }}
                placeholder="India"
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/3 px-4 text-white outline-none transition focus:border-lime-400/50 focus:bg-white/5"
              />

              {countryFocused && filteredCountries.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#090909] shadow-2xl">
                  {filteredCountries.map((country) => (
                    <button
                      type="button"
                      key={country}
                      onMouseDown={() => {
                        updateField("country", country);
                        setCountryFocused(false);
                      }}
                      className="flex min-h-11 w-full items-center px-4 text-left text-sm text-white transition hover:bg-white/4"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Field
            label="Billing email"
            value={form.billingEmail}
            onChange={(value) => updateField("billingEmail", value)}
            placeholder="billing@company.com"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || slugChecking || slugAvailable !== true}
          className="group flex h-14 w-full items-center justify-center rounded-2xl bg-lime-400 px-6 text-sm font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating organization..." : "Continue"}

          <span className="ml-2 transition group-hover:translate-x-1">→</span>
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/3 px-4 text-white outline-none transition focus:border-lime-400/50 focus:bg-white/5"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-white/10 bg-[#090909] px-4 text-white outline-none transition focus:border-lime-400/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
