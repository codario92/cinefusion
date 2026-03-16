"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Props = {
  projectId?: string;
  entityType: "character" | "location" | "scene";
  entityId: string;
};

type RulesPayload = {
  // Character-facing defaults (safe for other entity types too)
  displayName?: string;
  description?: string;
  styleNotes?: string;

  // Variants system (outfits, forms, etc.)
  variants?: Array<{
    key: string; // e.g. "red_hoodie"
    label: string; // e.g. "Red Hoodie"
    notes?: string; // locked details to reduce drift
  }>;

  // Anchors that help continuity (image refs, palette, etc.)
  anchors?: {
    referenceImages?: string[]; // URLs
    palette?: string[]; // hex codes
    keywords?: string[]; // prompt anchors
  };

  // Freeform "rules" text for prompt building
  rulesText?: string;
};

export default function CIFEditor({ projectId, entityType, entityId }: Props) {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Stored row id + optional thumbnail
  const [rowId, setRowId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  // Rules
  const [rules, setRules] = useState<RulesPayload>({
    displayName: "",
    description: "",
    styleNotes: "",
    variants: [],
    anchors: { referenceImages: [], palette: [], keywords: [] },
    rulesText: "",
  });

  // JSON editor (advanced)
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    if (!projectId || !entityId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setStatus("");

      const { data, error } = await supabase
        .from("project_entity_rules")
        .select("id, rules, thumbnail_url")
        .eq("project_id", projectId)
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setRowId(data.id);
        setThumbnailUrl(data.thumbnail_url ?? "");
        const loadedRules = (data.rules ?? {}) as RulesPayload;

        // Merge with defaults so UI never breaks
        const merged: RulesPayload = {
          displayName: loadedRules.displayName ?? "",
          description: loadedRules.description ?? "",
          styleNotes: loadedRules.styleNotes ?? "",
          variants: Array.isArray(loadedRules.variants) ? loadedRules.variants : [],
          anchors: {
            referenceImages: Array.isArray(loadedRules.anchors?.referenceImages)
              ? loadedRules.anchors!.referenceImages!
              : [],
            palette: Array.isArray(loadedRules.anchors?.palette) ? loadedRules.anchors!.palette! : [],
            keywords: Array.isArray(loadedRules.anchors?.keywords) ? loadedRules.anchors!.keywords! : [],
          },
          rulesText: loadedRules.rulesText ?? "",
        };

        setRules(merged);
        setJsonText(JSON.stringify(merged, null, 2));
      } else {
        // new entity, keep defaults
        setRowId(null);
        setThumbnailUrl("");
        const defaults: RulesPayload = {
          displayName: "",
          description: "",
          styleNotes: "",
          variants: [],
          anchors: { referenceImages: [], palette: [], keywords: [] },
          rulesText: "",
        };
        setRules(defaults);
        setJsonText(JSON.stringify(defaults, null, 2));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, entityType, entityId, supabase]);

  function syncJsonFromRules(next: RulesPayload) {
    setJsonText(JSON.stringify(next, null, 2));
  }

  function addVariant() {
    const next: RulesPayload = {
      ...rules,
      variants: [...(rules.variants ?? []), { key: "", label: "", notes: "" }],
    };
    setRules(next);
    syncJsonFromRules(next);
  }

  function updateVariant(i: number, patch: Partial<NonNullable<RulesPayload["variants"]>[number]>) {
    const list = [...(rules.variants ?? [])];
    list[i] = { ...list[i], ...patch };
    const next = { ...rules, variants: list };
    setRules(next);
    syncJsonFromRules(next);
  }

  function removeVariant(i: number) {
    const list = [...(rules.variants ?? [])];
    list.splice(i, 1);
    const next = { ...rules, variants: list };
    setRules(next);
    syncJsonFromRules(next);
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    setError("");
    setStatus("Saving…");

    // If user is in JSON mode, validate JSON and use it
    let payload: RulesPayload = rules;
    if (showJson) {
      try {
        payload = JSON.parse(jsonText);
      } catch (e: any) {
        setError("Invalid JSON. Fix formatting before saving.");
        setSaving(false);
        setStatus("");
        return;
      }
    }

    // 1) Upsert current rules
    const { data: upserted, error: upsertError } = await supabase
      .from("project_entity_rules")
      .upsert(
        {
          project_id: projectId,
          entity_type: entityType,
          entity_id: entityId,
          rules: payload,
          thumbnail_url: thumbnailUrl || null,
        },
        { onConflict: "project_id,entity_type,entity_id" }
      )
      .select("id")
      .single();

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      setStatus("");
      return;
    }

    const currentId = upserted?.id ?? rowId;
    if (currentId) setRowId(currentId);

    // 2) Append a version row (history)
    await supabase.from("project_entity_rule_versions").insert({
      project_id: projectId,
      entity_type: entityType,
      entity_id: entityId,
      rules: payload,
      thumbnail_url: thumbnailUrl || null,
      // created_by is handled by RLS/DB link to auth.uid in queries if you want;
      // we keep it nullable to avoid client-side auth complexity.
    });

    // Update local state from payload
    setRules(payload);
    syncJsonFromRules(payload);

    setStatus("Saved.");
    setSaving(false);
    window.setTimeout(() => setStatus(""), 1200);
  }

  if (!projectId) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
        Missing projectId.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-sm text-zinc-300">Loading continuity…</div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {/* Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs text-zinc-400">Continuity File</div>
          <div className="text-sm font-semibold text-white">
            {entityType.toUpperCase()} • {rowId ? "Linked" : "Not saved yet"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
          >
            {showJson ? "Form view" : "JSON view"}
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-linear-to-r from-fuchsia-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {status ? <div className="text-xs text-zinc-300">{status}</div> : null}

      {/* Thumbnail */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <label className="mb-1 block text-xs font-medium text-zinc-300">Thumbnail URL (optional)</label>
        <input
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
        />
        {thumbnailUrl ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt="thumb" className="h-40 w-full object-cover" />
          </div>
        ) : null}
      </div>

      {/* Editor */}
      {showJson ? (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <label className="mb-2 block text-xs font-medium text-zinc-300">Rules JSON</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="min-h-90 w-full rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-zinc-100 outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="mt-2 text-xs text-zinc-400">
            Tip: JSON view is for power users. Form view is safer.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Basics */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Display name</label>
                <input
                  value={rules.displayName ?? ""}
                  onChange={(e) => {
                    const next = { ...rules, displayName: e.target.value };
                    setRules(next);
                    syncJsonFromRules(next);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Description</label>
                <textarea
                  value={rules.description ?? ""}
                  onChange={(e) => {
                    const next = { ...rules, description: e.target.value };
                    setRules(next);
                    syncJsonFromRules(next);
                  }}
                  className="min-h-22.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Style notes (drift anchors)</label>
                <textarea
                  value={rules.styleNotes ?? ""}
                  onChange={(e) => {
                    const next = { ...rules, styleNotes: e.target.value };
                    setRules(next);
                    syncJsonFromRules(next);
                  }}
                  className="min-h-22.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Variants</div>
                <div className="text-xs text-zinc-400">
                  Example: “red_hoodie” should stay consistent across scenes.
                </div>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
              >
                Add variant
              </button>
            </div>

            {(rules.variants ?? []).length === 0 ? (
              <div className="text-sm text-zinc-300">No variants yet.</div>
            ) : (
              <div className="space-y-3">
                {(rules.variants ?? []).map((v, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-300">Key</label>
                        <input
                          value={v.key}
                          onChange={(e) => updateVariant(i, { key: e.target.value })}
                          placeholder="red_hoodie"
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-300">Label</label>
                        <input
                          value={v.label}
                          onChange={(e) => updateVariant(i, { label: e.target.value })}
                          placeholder="Red Hoodie"
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="mb-1 block text-xs font-medium text-zinc-300">Locked notes</label>
                      <textarea
                        value={v.notes ?? ""}
                        onChange={(e) => updateVariant(i, { notes: e.target.value })}
                        placeholder="Exact hoodie shade, logo placement, material, etc."
                        className="min-h-17.5 w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>

                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/15"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prompt rules text */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <label className="mb-1 block text-xs font-medium text-zinc-300">Rules text (used for prompt building)</label>
            <textarea
              value={rules.rulesText ?? ""}
              onChange={(e) => {
                const next = { ...rules, rulesText: e.target.value };
                setRules(next);
                syncJsonFromRules(next);
              }}
              placeholder="Always keep face shape consistent; keep palette; keep hoodie details…"
              className="min-h-30 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

