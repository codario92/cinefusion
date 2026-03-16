"use client";

import { useEffect, useState } from "react";
import CIFEditor from "@/components/CIFEditor";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function CharactersPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const supabase = getSupabaseBrowser();

  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("sandbox_characters")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");

      if (error) setError(error.message);
      else setCharacters(data || []);
    };

    load();
  }, [projectId, supabase]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.18), transparent_65%)]">
      {/* background art */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/brand/cinefusion-hero.png')] bg-right bg-no-repeat bg-contain opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Characters</h1>
          <p className="mt-1 text-white/70">
            Define appearance, traits, and continuity anchors.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* CIF EDITOR */}
        {selectedId && (
          <div className="mb-8 rounded-2xl border border-fuchsia-500/30 bg-linear-to-br from-fuchsia-500/10 via-purple-500/5 to-transparent p-6 shadow-[0_0_40px_rgba(217,70,239,0.15)]">
            <CIFEditor
              projectId={projectId}
              entityType="character"
              entityId={selectedId}
            />
          </div>
        )}

        {/* LIST */}
        <div className="grid gap-4">
          {characters.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="text-sm text-white/60">
                    {c.description || "No description"}
                  </p>
                </div>
                <span className="text-fuchsia-400 opacity-0 transition group-hover:opacity-100">
                  ✦
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
