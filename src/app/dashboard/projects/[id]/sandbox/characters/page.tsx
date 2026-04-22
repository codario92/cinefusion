"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CIFEditor from "@/components/CIFEditor";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type SandboxCharacter = {
  id: string;
  project_id: string;
  name?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
};

export default function CharactersPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const [characters, setCharacters] = useState<SandboxCharacter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteMessage, setPromoteMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);

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

  const selectedCharacter = useMemo(
    () => characters.find((c) => c.id === selectedId) ?? null,
    [characters, selectedId]
  );

  async function handlePromote(characterId: string) {
    try {
      setPromoteMessage(null);
      setPromotingId(characterId);

      const res = await fetch(
        `/api/projects/${projectId}/characters/${characterId}/promote`,
        {
          method: "POST",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to promote character.");
      }

      setPromoteMessage("Character promoted to Canon successfully.");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "Failed to promote character."
      );
    } finally {
      setPromotingId(null);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.18), transparent_65%)]">
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

        {promoteMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">
            {promoteMessage}
          </div>
        )}

        {selectedCharacter && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                  Selected Character
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {selectedCharacter.name || "Untitled Character"}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  {selectedCharacter.description || "No description yet."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePromote(selectedCharacter.id)}
                  disabled={promotingId === selectedCharacter.id}
                  className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-medium text-fuchsia-200 transition hover:bg-fuchsia-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {promotingId === selectedCharacter.id
                    ? "Promoting..."
                    : "Promote to Canon"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedId && (
          <div className="mb-8 rounded-2xl border border-fuchsia-500/30 bg-linear-to-br from-fuchsia-500/10 via-purple-500/5 to-transparent p-6 shadow-[0_0_40px_rgba(217,70,239,0.15)]">
            <CIFEditor
              projectId={projectId}
              entityType="character"
              entityId={selectedId}
            />
          </div>
        )}

        <div className="grid gap-4">
          {characters.map((c) => {
            const isSelected = c.id === selectedId;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`group cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-fuchsia-400/50 bg-fuchsia-500/10"
                    : "border-white/10 bg-white/5 hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">
                      {c.name || "Untitled Character"}
                    </p>
                    <p className="text-sm text-white/60">
                      {c.description || "No description"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(c.id);
                        handlePromote(c.id);
                      }}
                      disabled={promotingId === c.id}
                      className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {promotingId === c.id ? "Promoting..." : "Promote"}
                    </button>

                    <span className="text-fuchsia-400 opacity-0 transition group-hover:opacity-100">
                      ✦
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}