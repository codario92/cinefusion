"use client";

import * as React from "react";
import { buildCanonPayload } from "@/lib/canon-payload";
import type { CreationResult } from "@/lib/cif";

type Props = {
  projectId: string;
  canonId: string;
};

export default function CreateCharacterClient({ projectId, canonId }: Props) {
  const [prompt, setPrompt] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [result, setResult] = React.useState<CreationResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function generate() {
    try {
      setLoading(true);

      const res = await fetch("/api/creation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, name, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");

      setResult(data.result);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveToCanon() {
    if (!result) return;

    try {
      setSaving(true);

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

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save to canon failed");

      window.location.href = `/dashboard/projects/${projectId}/canon/${canonId}`;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">Create Character</h1>
        <p className="text-sm text-white/60">
          Generate first, then approve into canon.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <label className="mb-2 block text-sm">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 p-3"
            rows={4}
            placeholder="Describe the character..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3"
              placeholder="Character name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Role</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3"
              placeholder="Protagonist, mentor, villain..."
            />
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Character"}
        </button>
      </div>

      {result ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold">Review Result</div>

          {result.image_url ? (
            <img
              src={result.image_url}
              alt="Generated character"
              className="h-64 w-64 rounded-xl border border-white/10 object-cover"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-white/50">
              No generated image yet in phase 1.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs uppercase text-white/50">Name</div>
              <div className="mt-1">{result.cif.identity?.name ?? "—"}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs uppercase text-white/50">Role</div>
              <div className="mt-1">{result.cif.identity?.role ?? "—"}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="rounded-lg border border-white/10 bg-black/20 px-4 py-2 hover:bg-black/30"
            >
              Regenerate
            </button>

            <button
              type="button"
              onClick={saveToCanon}
              disabled={saving}
              className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save to Canon"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}