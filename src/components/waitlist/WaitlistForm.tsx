"use client";

import { useState } from "react";

type WaitlistFormProps = {
  source?: string;
  compact?: boolean;
  className?: string;
};

export default function WaitlistForm({
  source = "landing-page",
  compact = false,
  className = "",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      email: email.trim(),
      smsOptIn,
      phone: smsOptIn ? phone.trim() : null,
      source: String(source || "landing-page").trim(),
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setEmail("");
      setSmsOptIn(false);
      setPhone("");
      setSuccessMessage(data.message || "You’re on the list.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div
        className={`rounded-[30px] border border-white/15 bg-white/[0.12] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] ${
          compact ? "p-4 md:p-5" : "p-5 md:p-6"
        }`}
      >
        <label className="text-sm font-medium text-white/90">
          Email address
        </label>

        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-3 h-12 w-full rounded-2xl border border-white/15 bg-black/25 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-fuchsia-400/70"
        />

        <label className="mt-4 flex items-center gap-3 text-sm text-white/85">
          <input
            type="checkbox"
            checked={smsOptIn}
            onChange={(e) => {
              const checked = e.target.checked;
              setSmsOptIn(checked);
              if (!checked) setPhone("");
            }}
            className="h-4 w-4 rounded"
          />
          Get optional text alerts for early access
        </label>

        {smsOptIn && (
          <div className="mt-4">
            <label className="text-sm font-medium text-white/90">
              Phone number
            </label>

            <input
              type="tel"
              required={smsOptIn}
              autoComplete="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-3 h-12 w-full rounded-2xl border border-white/15 bg-black/25 px-4 text-white placeholder:text-white/35 outline-none transition focus:border-fuchsia-400/70"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-12 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-400 to-cyan-300 px-5 font-semibold text-white shadow-[0_10px_40px_rgba(217,70,239,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Joining..." : "Join the Beta"}
        </button>

        {!successMessage && !errorMessage && (
          <p className="mt-3 text-sm text-white/65">
            Early creators get priority visibility, fan tools, and monetization
            access.
          </p>
        )}

        {successMessage && (
          <p className="mt-3 text-sm font-medium text-emerald-300">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-3 text-sm font-medium text-red-300">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}