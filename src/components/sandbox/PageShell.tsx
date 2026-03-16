"use client";

import React from "react";

type PageShellProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  backgroundImageUrl?: string; // ✅ add this
  children: React.ReactNode;
};

export default function PageShell({
  title,
  subtitle,
  right,
  backgroundImageUrl,
  children,
}: PageShellProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full">
      {/* background */}
      {backgroundImageUrl ? (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(1.15)",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-white/70">{subtitle}</p>
            ) : null}
          </div>
          {right ? <div>{right}</div> : null}
        </div>

        {children}
      </div>
    </div>
  );
}
