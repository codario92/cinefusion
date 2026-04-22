import Link from "next/link";

export default function SandboxNewPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">New Sandbox Project</h1>
          <Link className="rounded-xl px-3 py-2 hover:bg-white/5 text-white/80 hover:text-white" href="/sandbox">
            Back
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70 text-sm">
            This is the stub creator screen. Next step, we save a project in Supabase and route to the pipeline.
          </p>

          <form className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-white/80">Project title</label>
              <input
                className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="Neon Ronin — Episode 1"
              />
            </div>

            <div>
              <label className="text-sm text-white/80">Format</label>
              <select className="mt-2 w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30">
                <option>Anime Episode</option>
                <option>Anime Short</option>
                <option>Teaser / Trailer</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                className="rounded-2xl bg-white text-black px-5 py-3 font-medium hover:opacity-90"
              >
                Create (next: save to Supabase)
              </button>

              <Link
                href="/sandbox/pipeline"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-medium hover:bg-white/10"
              >
                View Pipeline
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
