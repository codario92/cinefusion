"use client";

import Link from "next/link";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

const steps = [
  {
    step: "01",
    title: "Production",
    text: "Create scenes, shape characters, and build cinematic moments inside a dedicated anime workflow.",
  },
  {
    step: "02",
    title: "Streaming",
    text: "Release your episodes in a branded viewing experience built around your work.",
  },
  {
    step: "03",
    title: "Merch Drops",
    text: "Turn your characters and world into products your audience actually wants.",
  },
  {
    step: "04",
    title: "Community",
    text: "Build a real fanbase with posts, engagement, support, and exclusive access.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#070211] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090312]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center">
            <img
              src="/brand/cinefusion-logo.png"
              alt="CineFusion"
              className="h-10 w-auto md:h-11"
            />
          </Link>

          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            Back Home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-20">
        <div className="absolute inset-0">
          <img
            src="/landing/bg-city.jpg"
            alt=""
            className="h-full w-full object-cover opacity-25 blur-[4px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070211]/30 via-[#070211]/82 to-[#070211]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <img
                src="/brand/cinefusion-hero.png"
                alt="CineFusion"
                className="h-auto w-full max-w-[340px] md:max-w-[420px]"
              />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200/90">
              How It Works
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.03em] md:text-6xl">
              Become Your Own Anime Studio
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/70">
              CineFusion is being built to help creators develop anime worlds,
              produce episodes, launch content, monetize their brand, and grow
              a real audience.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
            {steps.map((item) => (
              <div
                key={item.step}
                className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-xl"
              >
                <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200/90">
                  {item.step}
                </p>
                <h2 className="mt-4 text-2xl font-bold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-[36px] border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-500/10 via-white/5 to-cyan-400/10 p-8 md:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200/90">
                Early Development
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] md:text-5xl">
                We’re building CineFusion now.
              </h2>

              <p className="mt-4 text-base leading-7 text-white/65 md:text-lg">
                Sign up for early access and be first in line when beta opens.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                <h3 className="text-2xl font-bold">Why join early?</h3>
                <ul className="mt-5 space-y-4 text-white/70">
                  <li>• Priority visibility when the platform opens</li>
                  <li>• Early access to monetization features</li>
                  <li>• Founder-style early creator status</li>
                  <li>• Influence over what gets built next</li>
                </ul>
              </div>

              <WaitlistForm source="how-it-works" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}