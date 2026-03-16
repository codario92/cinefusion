'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const TAGLINES = [
  'Where creativity meets community',
  'Build, fund, and launch together',
  'Own your audience. Keep your revenue.',
  'From idea to premiere—on one platform',
];

export default function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % TAGLINES.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2b1a66] via-[#6e2bd9] to-[#120a2c]">
      {/* Rotating conic accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[700px] w-[700px] rounded-full opacity-40 blur-2xl"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(255,255,255,0.15), rgba(255,255,255,0.0) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.0) 75%, rgba(255,255,255,0.15))',
          animation: 'spin 28s linear infinite',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow">
          CINEFUSION
        </h1>

        {/* Rotating tagline */}
        <p
          key={i}
          className="mt-4 text-lg sm:text-xl text-white/85 transition-opacity duration-500"
          style={{ opacity: 1 }}
        >
          {TAGLINES[i]}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 font-semibold border border-white/90 text-white hover:bg-white hover:text-black transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 font-semibold bg-white text-black hover:bg-black hover:text-white border border-white transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 font-semibold text-white/80 hover:text-white transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </section>
  );
}
