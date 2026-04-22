"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CanonVersionRow = {
  id: string;
  canon_entity_id: string;
  version: number;
  notes: string | null;
  payload: any;
  created_at: string;
  image_url?: string | null;
  image_meta?: any;
  is_current?: boolean | null;
  sort_order?: number | null;
};

type Props = {
  projectId: string;
  canonId: string;
  initialVersions: CanonVersionRow[];
};

function prettyJson(value: any): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getImageUrl(v: CanonVersionRow): string | null {
  if (v.image_url && typeof v.image_url === "string") {
    return v.image_url;
  }

  const payload = v.payload;

  if (payload?.image?.url && typeof payload.image.url === "string") {
    return payload.image.url;
  }

  if (payload?.image?.path && typeof payload.image.path === "string") {
    return payload.image.path;
  }

  return null;
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

function SortableVersionCard({
  v,
  onSetCurrent,
}: {
  v: CanonVersionRow;
  onSetCurrent: (versionId: string) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: v.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const img = getImageUrl(v);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-white/10 bg-white/5 p-4"
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="mt-1 cursor-grab select-none rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs text-white/70 active:cursor-grabbing"
          title="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          {img ? (
            <img
              src={img}
              alt={`Version ${v.version}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center border border-dashed border-white/10 text-xs text-white/40">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-white/60">v{v.version}</div>

            {v.is_current ? (
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                Current Version
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSetCurrent(v.id)}
                className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              >
                Set as Current
              </button>
            )}

            <div className="ml-auto text-xs text-white/50">
              {v.created_at ? new Date(v.created_at).toLocaleString() : ""}
            </div>
          </div>

          <div className="mt-2 text-sm text-white">
            {v.notes?.trim() ? v.notes : "No notes"}
          </div>

          {img ? (
            <img
              src={img}
              alt={`Version ${v.version}`}
              className="mt-3 h-32 w-32 rounded-lg border border-white/10 object-cover"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="mt-3 flex h-32 w-32 items-center justify-center border border-dashed border-white/10 text-xs text-white/40">
              No image
            </div>
          )}

          <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/80">
            {prettyJson(v.payload ?? {})}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function VersionsDnDList({
  projectId,
  canonId,
  initialVersions,
}: Props) {
  const [versions, setVersions] = React.useState<CanonVersionRow[]>(
    initialVersions ?? []
  );
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setVersions(initialVersions ?? []);
  }, [initialVersions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function onSetCurrent(versionId: string) {
    try {
      setBusy(true);

      const res = await fetch(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions/set-current`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to set current");
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to set current");
    } finally {
      setBusy(false);
    }
  }

  async function onRollback() {
    try {
      setBusy(true);

      await postJson(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions/rollback`,
        {}
      );

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Rollback failed");
    } finally {
      setBusy(false);
    }
  }

  async function persistOrder(next: CanonVersionRow[]) {
    const items = next.map((v, idx) => ({
      id: v.id,
      sort_order: idx + 1,
    }));

    await postJson(
      `/dashboard/projects/${projectId}/canon/${canonId}/versions/reorder`,
      { items }
    );
  }

  async function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = versions.findIndex((v) => v.id === active.id);
    const newIndex = versions.findIndex((v) => v.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(versions, oldIndex, newIndex);
    setVersions(next);

    try {
      await persistOrder(next);
    } catch (err) {
      console.error(err);
      alert("Failed to save new order");
      setVersions(initialVersions ?? []);
    }
  }

  if (!versions.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
        No versions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">Versions</div>

        <button
          type="button"
          disabled={busy}
          onClick={onRollback}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50"
        >
          Rollback
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={versions.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {versions.map((v) => (
              <SortableVersionCard
                key={v.id}
                v={v}
                onSetCurrent={onSetCurrent}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}