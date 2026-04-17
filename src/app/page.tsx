"use client";

import Link from "next/link";
import { useState } from "react";

const cards = [
  {
    title: "Production",
    description: "Create your anime with cinematic scenes and creator tools.",
    image: "/landing/production-preview.png",
  },
  {
    title: "Streaming",
    description: "Release episodes in a branded viewing experience.",
    image: "/landing/streaming-preview.png",
  },
  {
    title: "Merch Drops",
    description: "Sell custom merch your audience actually wants.",
    image: "/landing/merch-preview.png",
  },
  {
    title: "Community",
    description: "Build real fans, not just views.",
    image: "/landing/community-preview.png",
  },
];

type InlineWaitlistFormProps = {
  source?: string;
  compact?: boolean;
};

function InlineWaitlistForm({
  source = "landing-page",
  compact = false,
}: InlineWaitlistFormProps) {
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

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          smsOptIn,
          phone: smsOptIn ? phone : null,
          source,
        }),
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
    <form onSubmit={handleSubmit} className="w-full">
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

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070211] text-white">
      <style jsx>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes floatNova {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.02);
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.72;
            filter: blur(110px);
          }
          50% {
            opacity: 1;
            filter: blur(130px);
          }
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-180%) skewX(-18deg);
            opacity: 0;
          }
          18% {
            opacity: 0.08;
          }
          48% {
            opacity: 0.22;
          }
          78% {
            opacity: 0.08;
          }
          100% {
            transform: translateX(220%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes driftA {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(12px, -18px, 0);
            opacity: 0.7;
          }
        }

        @keyframes driftB {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.25;
          }
          50% {
            transform: translate3d(-16px, 12px, 0);
            opacity: 0.55;
          }
        }

        @keyframes cardGlow {
          0%,
          100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.38;
          }
        }

        .hero-logo {
          animation: floatSlow 8s ease-in-out infinite;
        }

        .hero-logo-shimmer {
          animation: shimmerSweep 4.8s ease-in-out infinite;
          -webkit-mask-image: url("/brand/cinefusion-logo.png");
          mask-image: url("/brand/cinefusion-logo.png");
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-position: center;
          mask-position: center;
        }

        .nova-float {
          animation: floatNova 6.5s ease-in-out infinite;
        }

        .glow-pulse {
          animation: pulseGlow 6s ease-in-out infinite;
        }

        .particle-a {
          animation: driftA 7s ease-in-out infinite;
        }

        .particle-b {
          animation: driftB 9s ease-in-out infinite;
        }

        .card-glow {
          animation: cardGlow 4.5s ease-in-out infinite;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090312]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center">
            <img
              src="/brand/cinefusion-logo.png"
              alt="CineFusion"
              className="h-10 w-auto md:h-11"
            />
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/how-it-works"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              How It Works
            </Link>

            <a
              href="#join-beta"
              className="rounded-full border border-fuchsia-400/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(217,70,239,0.15)] transition hover:scale-[1.02] hover:bg-white/15"
            >
              Join Beta
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/landing/bg-city.jpg"
            alt=""
            className="h-full w-full object-cover opacity-45 blur-[3px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070211]/10 via-[#070211]/66 to-[#070211]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.38),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(236,72,153,0.12),transparent_30%)]" />

          <div className="glow-pulse absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-fuchsia-500/22" />
          <div className="glow-pulse absolute right-[-8%] top-16 h-80 w-80 rounded-full bg-cyan-400/10" />
          <div className="glow-pulse absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-purple-500/18" />

          <div className="particle-a absolute left-[18%] top-[18%] h-1.5 w-1.5 rounded-full bg-white/55 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
          <div className="particle-b absolute left-[24%] top-[26%] h-1 w-1 rounded-full bg-fuchsia-300/70 shadow-[0_0_14px_rgba(217,70,239,0.75)]" />
          <div className="particle-a absolute left-[62%] top-[20%] h-1.5 w-1.5 rounded-full bg-cyan-200/60 shadow-[0_0_14px_rgba(34,211,238,0.7)]" />
          <div className="particle-b absolute left-[72%] top-[30%] h-1 w-1 rounded-full bg-white/50 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
          <div className="particle-a absolute left-[54%] top-[55%] h-1 w-1 rounded-full bg-fuchsia-300/65 shadow-[0_0_14px_rgba(217,70,239,0.8)]" />
          <div className="particle-b absolute left-[80%] top-[60%] h-1.5 w-1.5 rounded-full bg-cyan-200/55 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[74vh] max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-14 pt-1 md:px-6 md:pb-16 md:pt-1 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10 lg:pb-20 lg:pt-0">
          <div className="max-w-2xl -mt-14 md:-mt-24 lg:-mt-28">
            <div className="relative mb-1">
              <div className="glow-pulse absolute -left-10 -top-8 h-40 w-40 rounded-full bg-fuchsia-500/18" />

              <div className="hero-logo relative inline-block">
                <img
                  src="/brand/cinefusion-logo.png"
                  alt="CineFusion"
                  className="relative z-10 h-auto w-full max-w-[700px] object-contain drop-shadow-[0_0_34px_rgba(99,102,241,0.38)] md:max-w-[820px]"
                />

                <div className="pointer-events-none absolute inset-0">
                  <div className="hero-logo-shimmer absolute inset-0 bg-transparent">
                    <div className="absolute inset-y-0 left-[-18%] w-[18%] bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-2 inline-flex items-center rounded-full border border-fuchsia-400/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/80 shadow-[0_0_18px_rgba(168,85,247,0.08)]">
              The Future of Anime Creation
            </div>

            <h1 className="text-4xl font-black leading-[0.9] tracking-[-0.045em] md:text-6xl xl:text-7xl">
              Create and
              <br />
              Customize Your Own
              <br />
              Anime Universe
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75 md:text-xl">
              Powered by AI. Built for creators. Write, design, and produce
              your story—then grow a fanbase, sell merch, and stream it to the
              world.
            </p>

            <p className="mt-4 text-lg font-semibold text-fuchsia-200 md:text-xl">
              Your entire anime studio—built in.
            </p>

            <div id="join-beta" className="mt-8 max-w-xl">
              <InlineWaitlistForm source="landing-hero" />
            </div>
          </div>

          <div className="relative flex min-h-[520px] items-center justify-center lg:min-h-[700px] lg:justify-end">
            <div className="absolute inset-x-8 bottom-8 top-16 rounded-[3rem] bg-gradient-to-br from-fuchsia-500/18 via-purple-500/10 to-cyan-400/16 blur-3xl" />
            <div className="glow-pulse absolute left-1/2 top-1/2 z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/20" />

            <img
              src="/landing/hero-preview.png"
              alt="CineFusion hero character"
              className="relative z-10 mx-auto w-full max-w-[650px] translate-y-1 drop-shadow-[0_0_46px_rgba(168,85,247,0.42)]"
            />

            <img
              src="/landing/nova.png"
              alt="Nova companion"
              className="nova-float absolute right-[2%] top-[10%] z-20 w-28 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)] md:w-36"
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-black/15">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-fuchsia-500/10 to-transparent blur-2xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-[-0.03em] md:text-5xl">
              Control Every Part of Your Anime Studio
            </h2>
            <p className="mt-4 text-base leading-7 text-white/65 md:text-lg">
              Build, grow, and monetize your anime—merch, streaming, and
              community included.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl transition duration-300 hover:-translate-y-2 hover:border-fuchsia-400/40 hover:bg-white/[0.07]"
              >
                <div className="card-glow pointer-events-none absolute inset-0 rounded-[28px] border border-fuchsia-400/0 shadow-[0_0_50px_rgba(168,85,247,0.18)]" />
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0414] via-[#0a0414]/15 to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-white/[0.10] to-white/[0.05] p-8 text-center shadow-[0_20px_90px_rgba(0,0,0,0.38)] md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200/90">
              Early Access
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] md:text-5xl">
              From idea to audience—become your own anime studio.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              CineFusion is being built for creators who want more than a tool.
              Get in early and be part of shaping the platform from the start.
            </p>

            <div className="mx-auto mt-8 max-w-xl">
              <InlineWaitlistForm source="landing-footer" compact />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}