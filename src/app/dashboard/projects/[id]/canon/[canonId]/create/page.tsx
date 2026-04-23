"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { buildCanonPayload } from "@/lib/canon-payload";
import type { CharacterCIF, CreationResult } from "@/lib/cif";

function updateNestedField<T extends object>(
  obj: T | undefined,
  key: string,
  value: string
): T {
  return {
    ...(obj ?? ({} as T)),
    [key]: value,
  };
}

function updateArrayFromCommaList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function commaList(value?: string[]) {
  return (value ?? []).join(", ");
}

export default function CreateCharacterPage() {
  const params = useParams<{ id: string; canonId: string }>();
  const router = useRouter();

  if (!params?.id || !params?.canonId) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const projectId = params.id;
  const canonId = params.canonId;

  const [prompt, setPrompt] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [result, setResult] = React.useState<CreationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/creation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, name, role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Generation failed");
      }

      setResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function updateCIF(nextCif: CharacterCIF) {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cif: nextCif,
      };
    });
  }

  function updateNotes(notes: string) {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notes,
      };
    });
  }

  async function saveToCanon() {
    if (!result) return;

    try {
      setSaving(true);
      setError(null);

      const payload = buildCanonPayload(result);

      const res = await fetch(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: result.notes ?? "Saved from creation flow",
            payload,
            image_url: result.image_url,
            image_meta: result.image_path ? { path: result.image_path } : null,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Save to canon failed");
      }

      router.push(`/dashboard/projects/${projectId}/canon/${canonId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const cif = result?.cif ?? {};

  return (
    <div className="space-y-6 p-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">Create Character</h1>
        <p className="text-sm text-white/60">
          Generate a character, review the CIF, then save it into canon.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your character..."
            className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
            rows={4}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Role
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Character"}
          </button>

          {result ? (
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="rounded border border-white/10 bg-black/20 px-4 py-2 text-white hover:bg-black/30 disabled:opacity-50"
            >
              Regenerate
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <h2 className="text-xl font-semibold">Review Result</h2>
            <p className="text-sm text-white/60">
              Edit the CIF before saving this version into canon.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 text-xs uppercase tracking-wide text-white/50">
                  Preview
                </div>

                {result.image_url ? (
                  <img
                    src={result.image_url}
                    alt="Generated character"
                    className="h-72 w-full rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-white/50">
                    No generated image yet
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 text-xs uppercase tracking-wide text-white/50">
                  Generation Metadata
                </div>

                <div className="space-y-2 text-sm text-white/80">
                  <div>
                    <span className="text-white/50">Provider:</span>{" "}
                    {result.generation_meta?.provider ?? "—"}
                  </div>
                  <div>
                    <span className="text-white/50">Model:</span>{" "}
                    {result.generation_meta?.model ?? "—"}
                  </div>
                  <div className="break-words">
                    <span className="text-white/50">Prompt:</span>{" "}
                    {result.generation_meta?.prompt ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 text-sm font-semibold text-white">
                  Identity
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={cif.identity?.name ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        identity: updateNestedField(
                          cif.identity,
                          "name",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Character name"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.identity?.role ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        identity: updateNestedField(
                          cif.identity,
                          "role",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Character role"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.identity?.archetype ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        identity: updateNestedField(
                          cif.identity,
                          "archetype",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Archetype"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 sm:col-span-2"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 text-sm font-semibold text-white">
                  Appearance
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={cif.appearance?.hair ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        appearance: updateNestedField(
                          cif.appearance,
                          "hair",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Hair"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.appearance?.eyes ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        appearance: updateNestedField(
                          cif.appearance,
                          "eyes",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Eyes"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.appearance?.height ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        appearance: updateNestedField(
                          cif.appearance,
                          "height",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Height"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.appearance?.build ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        appearance: updateNestedField(
                          cif.appearance,
                          "build",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Build"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.appearance?.outfit ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        appearance: updateNestedField(
                          cif.appearance,
                          "outfit",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Outfit"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 sm:col-span-2"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 text-sm font-semibold text-white">
                  Style
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={cif.style?.visual_style ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        style: updateNestedField(
                          cif.style,
                          "visual_style",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Visual style"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.style?.lighting ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        style: updateNestedField(
                          cif.style,
                          "lighting",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Lighting"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={cif.style?.tone ?? ""}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        style: updateNestedField(
                          cif.style,
                          "tone",
                          e.target.value
                        ),
                      })
                    }
                    placeholder="Tone"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 sm:col-span-2"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 text-sm font-semibold text-white">
                  Constraints
                </div>

                <div className="grid gap-4">
                  <input
                    value={commaList(cif.constraints?.must_keep)}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        constraints: {
                          ...(cif.constraints ?? {}),
                          must_keep: updateArrayFromCommaList(e.target.value),
                        },
                      })
                    }
                    placeholder="Must keep (comma separated)"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />

                  <input
                    value={commaList(cif.constraints?.avoid)}
                    onChange={(e) =>
                      updateCIF({
                        ...cif,
                        constraints: {
                          ...(cif.constraints ?? {}),
                          avoid: updateArrayFromCommaList(e.target.value),
                        },
                      })
                    }
                    placeholder="Avoid (comma separated)"
                    className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 text-sm font-semibold text-white">
                  Version Notes
                </div>
                <textarea
                  value={result.notes ?? ""}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Why does this version exist?"
                  rows={4}
                  className="w-full rounded border border-white/10 bg-black/20 p-3 text-white placeholder:text-white/70 placeholder:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={generate}
                  disabled={loading}
                  className="rounded border border-white/10 bg-black/20 px-4 py-2 text-white hover:bg-black/30 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Regenerate"}
                </button>

                <button
                  type="button"
                  onClick={saveToCanon}
                  disabled={saving}
                  className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save to Canon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="text-xs text-white/40">
        projectId: {projectId} | canonId: {canonId}
      </div>
    </div>
  );
}