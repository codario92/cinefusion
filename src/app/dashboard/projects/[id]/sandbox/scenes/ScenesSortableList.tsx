"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SceneRow = {
  id: string;
  project_id: string;
  title: string | null;
  synopsis?: string | null;
  sort_order: number | null;
};

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function ScenesSortableList({
  projectId,
  initialScenes,
}: {
  projectId: string;
  initialScenes: SceneRow[];
}) {
  const [scenes, setScenes] = React.useState<SceneRow[]>(initialScenes);
  const [savingOrder, setSavingOrder] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setScenes(initialScenes);
  }, [initialScenes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function persistOrder(nextScenes: SceneRow[]) {
    if (!projectId) {
      setOrderError("Missing projectId");
      return false;
    }

    const orderedIds = nextScenes.map((s) => s.id);

    setSavingOrder(true);
    setOrderError(null);

    const res = await fetch(`/dashboard/projects/${projectId}/sandbox/scenes/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });

    const j = await res.json().catch(() => ({}));
    setSavingOrder(false);

    if (!res.ok) {
      setOrderError(j?.error ?? "Failed to save order");
      return false;
    }
    return true;
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = scenes.findIndex((s) => s.id === String(active.id));
    const newIndex = scenes.findIndex((s) => s.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const prev = scenes;
    const next = arrayMove(scenes, oldIndex, newIndex);

    setScenes(next);
    const ok = await persistOrder(next);
    if (!ok) setScenes(prev);
  }

  return (
    <div className="space-y-3">
      {/* Status row */}
      <div className="flex items-center gap-3 text-sm text-white/60">
        {savingOrder ? <span>Saving order…</span> : <span>Order saved</span>}
      </div>

      {/* Order error */}
      {orderError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {orderError}
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="grid gap-2">
            {scenes.map((scene) => (
              <SortableSceneCard
                key={scene.id}
                projectId={projectId}
                scene={scene}
                onLocalPatch={(patch) => {
                  setScenes((cur) =>
                    cur.map((s) => (s.id === scene.id ? { ...s, ...patch } : s))
                  );
                }}
                onLocalRollback={(prev) => {
                  setScenes((cur) => cur.map((s) => (s.id === scene.id ? prev : s)));
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableSceneCard({
  projectId,
  scene,
  onLocalPatch,
  onLocalRollback,
}: {
  projectId: string;
  scene: SceneRow;
  onLocalPatch: (patch: Partial<SceneRow>) => void;
  onLocalRollback: (prev: SceneRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(scene.title ?? "");
  const [synopsis, setSynopsis] = React.useState(scene.synopsis ?? "");
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const prevRef = React.useRef(scene);

  React.useEffect(() => {
    // keep form in sync when not editing
    if (!editing) {
      setTitle(scene.title ?? "");
      setSynopsis(scene.synopsis ?? "");
    }
    prevRef.current = scene;
  }, [scene.title, scene.synopsis, editing]);

  async function saveEdits() {
    const nextTitle = title.trim();
    const nextSynopsis = synopsis.trim();

    if (!nextTitle) {
      setErr("Title cannot be empty.");
      return;
    }

    setSaving(true);
    setErr(null);

    const prev = prevRef.current;

    // Optimistic patch
    onLocalPatch({
      title: nextTitle,
      synopsis: nextSynopsis.length ? nextSynopsis : null,
    });

    const res = await fetch(
      `/dashboard/projects/${projectId}/sandbox/scenes/${scene.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nextTitle,
          synopsis: nextSynopsis.length ? nextSynopsis : null,
        }),
      }
    );

    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      // rollback
      onLocalRollback(prev);
      setErr(j?.error ?? "Failed to save.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border px-3 py-3",
        "bg-black/30 border-white/10",
        isDragging && "opacity-80 ring-2 ring-white/20"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
          className={cn(
            "mt-0.5 grid place-items-center rounded-lg border px-2 py-2",
            "border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15"
          )}
        >
          <span className="text-white/80 leading-none">⠿</span>
        </button>

        <div className="min-w-0 flex-1">
          {/* Title */}
          {!editing ? (
            <button
              type="button"
              className="w-full text-left font-semibold text-white truncate"
              onClick={() => setEditing(true)}
              title="Click to edit"
            >
              {scene.title?.trim() ? scene.title : "(Untitled scene)"}
            </button>
          ) : (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                "w-full rounded-lg border px-3 py-2",
                "border-white/10 bg-black/40 text-white outline-none"
              )}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdits();
                if (e.key === "Escape") {
                  setEditing(false);
                  setErr(null);
                  setTitle(scene.title ?? "");
                  setSynopsis(scene.synopsis ?? "");
                }
              }}
            />
          )}

          {/* Synopsis */}
          {!editing ? (
            <div className="mt-1 text-sm text-white/50 line-clamp-2">
              {scene.synopsis?.trim()
                ? scene.synopsis
                : "Click the title to edit. Synopsis is optional."}
            </div>
          ) : (
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              className={cn(
                "mt-2 w-full rounded-lg border px-3 py-2",
                "border-white/10 bg-black/40 text-white/90 outline-none"
              )}
              placeholder="Synopsis (optional)"
            />
          )}

          {/* Error + actions */}
          {editing ? (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={saveEdits}
                disabled={saving}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-semibold",
                  "border-white/10 bg-white/5 hover:bg-white/10",
                  saving && "opacity-60 cursor-not-allowed"
                )}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setErr(null);
                  setTitle(scene.title ?? "");
                  setSynopsis(scene.synopsis ?? "");
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  "border-white/10 bg-transparent hover:bg-white/5"
                )}
              >
                Cancel
              </button>

              {err ? <div className="text-sm text-red-200">{err}</div> : null}
            </div>
          ) : null}
        </div>

        {/* Open */}
        <a
          href={`/dashboard/projects/${projectId}/sandbox/scenes/${scene.id}`}
          className={cn(
            "shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold",
            "border-white/10 bg-white/5 hover:bg-white/10 text-white"
          )}
        >
          Open
        </a>
      </div>
    </div>
  );
}
