"use client";

import * as React from "react";

type WaitlistFormProps = {
  className?: string;
  buttonText?: string;
  showPhone?: boolean;
  title?: string;
  subtitle?: string;
};

export default function WaitlistForm({
  className = "",
  buttonText = "Join the Beta",
  showPhone = true,
  title,
  subtitle,
}: WaitlistFormProps) {
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const payload: { email: string; phone?: string } = {
        email: email.trim(),
      };

      if (showPhone && phone.trim()) {
        payload.phone = phone.trim();
      }

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setSuccess(data?.message || "You're on the list.");
      setEmail("");
      setPhone("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      {title ? (
        <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
      ) : null}

      {subtitle ? (
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="waitlist-email" className="mb-2 block text-sm font-medium text-white/90">
            Email
          </label>
          <input
            id="waitlist-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/35 focus:bg-white/10"
          />
        </div>

        {showPhone ? (
          <div>
            <label htmlFor="waitlist-phone" className="mb-2 block text-sm font-medium text-white/90">
              Phone <span className="text-white/45">(optional)</span>
            </label>
            <input
              id="waitlist-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/35 focus:bg-white/10"
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : buttonText}
        </button>

        {success ? <p className="text-sm font-medium text-green-400">{success}</p> : null}
        {error ? <p className="text-sm font-medium text-red-400">{error}</p> : null}
      </form>
    </div>
  );
}