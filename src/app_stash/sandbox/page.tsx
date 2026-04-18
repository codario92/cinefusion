import Link from "next/link";

type SandboxProject = {
  id: string;
  title: string;
  createdAt: string;
  status: "Draft" | "Generating" | "Ready";
  progress: number; // 0-100
};

const demoProjects: SandboxProject[] = [
  {
    id: "sbx_001",
    title: "Neon Ronin — Episode 1",
    createdAt: "Today",
    status: "Draft",
    progress: 10,
  },
  {
    id: "sbx_002",
    title: "Hollowing Place — Teaser",
    createdAt: "Yesterday",
    status: "Generating",
    progress: 62,
  },
];

function Badge({ status }: { status: SandboxProject["status"] }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border";
  if (status === "Ready")
    return <span className={`${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-200`}>Ready</span>;
  if (status === "Generating")
    return <span className={`${base} border-amber-400/30 bg-amber-500/10 text-amber-200`}>Generating</span>;
  return <span className={`${base} border-white/15 bg-white/5 text-white/80`}>Draft</span>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-linear-to-r from-fuchsia-500 to-violet-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function SandboxPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-fuchsia-500 to-violet-600 shadow-[0_0_25px_rgba(168,85,247,0.35)]" />
            <div>
              <div className="text-sm text-white/70">CineFusion</div>
              <div className="text-lg font-semibold leading-tight">Sandbox</div>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-xl px-3 py-2 hover:bg-white/5 text-white/80 hover:text-white" href="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-white/5 text-white/80 hover:text-white" href="/account">
              Account
            </Link>
            <Link className="rounded-xl px-3 py-2 bg-white text-black font-medium hover:opacity-90" href="/sandbox/new">
              New Project
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-white/0 p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-semibold">
              Build anime with a guided pipeline.
            </h1>
            <p className="mt-3 text-white/70 max-w-2xl">
              Script → characters → style bible → scenes → render → publish. We’ll later wire the generation APIs.
              For now, this is the production-grade shell.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/sandbox/new"
                className="rounded-2xl bg-white text-black px-5 py-3 font-medium hover:opacity-90"
              >
                Create a Sandbox Project
              </Link>
              <Link
                href="/sandbox/pipeline"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-medium hover:bg-white/10"
              >
                View Pipeline
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline cards */}
      <section className="mx-auto max-w-6xl px-6 py-6">
        <h2 className="text-lg font-semibold">Pipeline</h2>
        <p className="text-sm text-white/60 mt-1">
          This is the “doable, simple, step-by-step” creation flow. Each step becomes a module.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: "Script & Beats", d: "Import or write script. Auto-break into beats and shot list." },
            { n: "02", t: "Characters", d: "Create character cards + reference pack (anchors for consistency)." },
            { n: "03", t: "Style Bible", d: "Global palette, line weight, lighting rules, camera rules." },
            { n: "04", t: "Scenes", d: "Build scenes from beats; track location/props continuity." },
            { n: "05", t: "Render", d: "Queue renders, retries, cost controls, and drift checks." },
            { n: "06", t: "Publish", d: "Export episode, shorts, and marketing cutdowns." },
          ].map((x) => (
            <div key={x.n} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/50">{x.n}</div>
                <div className="h-2 w-2 rounded-full bg-violet-400/80" />
              </div>
              <div className="mt-3 text-base font-semibold">{x.t}</div>
              <div className="mt-2 text-sm text-white/70">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mx-auto max-w-6xl px-6 py-6 pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Your Sandbox Projects</h2>
            <p className="text-sm text-white/60 mt-1">
              Local demo data for now. Next step: persist in Supabase.
            </p>
          </div>

          <Link
            href="/sandbox/new"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            + New
          </Link>
        </div>

        <div className="mt-4 grid gap-4">
          {demoProjects.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{p.title}</div>
                  <div className="text-xs text-white/50 mt-1">Created: {p.createdAt} • ID: {p.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={p.status} />
                  <Link
                    href={`/sandbox/${p.id}`}
                    className="rounded-xl bg-white text-black px-3 py-2 text-sm font-medium hover:opacity-90"
                  >
                    Open
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="text-xs text-white/60 w-20">Progress</div>
                <div className="flex-1">
                  <ProgressBar value={p.progress} />
                </div>
                <div className="text-xs text-white/60 w-10 text-right">{p.progress}%</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
