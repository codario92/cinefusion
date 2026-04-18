"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CanonVersionRow = {
  id: string;
  canon_entity_id: string;
  version: number;
  payload: any;
  notes: string | null;
  created_at: string;
  image_url: string | null;
  image_meta?: any;
  is_current?: boolean | null;
  sort_order?: number | null;
};

type Props = {
  projectId: string;
  canonId: string;
  initialVersions: CanonVersionRow[];
};

function getImageUrl(v: CanonVersionRow): string | null {
  return v.image_url || v?.payload?.image?.url || null;
}

function SortableItem({
  version,
  children,
}: {
  version: CanonVersionRow;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: version.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute right-3 top-3 z-10 cursor-grab active:cursor-grabbing text-lg text-white/40 hover:text-white"
        title="Drag to reorder"
      >
        ☰
      </div>

      {children}
    </div>
  );
}

export default function VersionsDnDList({
  projectId,
  canonId,
  initialVersions,
}: Props) {
  const [versions, setVersions] = React.useState<CanonVersionRow[]>(initialVersions);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setVersions(initialVersions);
  }, [initialVersions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  async function saveOrder(updated: CanonVersionRow[]) {
    setSaving(true);
    setError(null);

    const updates = updated.map((v, index) => ({
      id: v.id,
      sort_order: index,
    }));

    try {
      const res = await fetch(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save order");
      }
    } catch (err) {
      console.error("Reorder error:", err);
      setError(err instanceof Error ? err.message : "Failed to save order");
      setVersions(initialVersions);
    } finally {
      setSaving(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = versions.findIndex((v) => v.id === active.id);
    const newIndex = versions.findIndex((v) => v.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(versions, oldIndex, newIndex).map((v, index) => ({
      ...v,
      sort_order: index,
    }));

    setVersions(newOrder);
    void saveOrder(newOrder);
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        {versions.map((v) => {
          const img = getImageUrl(v);

          return (
            <div key={v.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between pr-8">
                <div>
                  <div className="text-white font-semibold">v{v.version}</div>
                  <div className="text-xs text-white/50">
                    {new Date(v.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {v.is_current ? (
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                    >
                      Set Current
                    </button>
                  )}

                  <button
                    type="button"
                    className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                  >
                    Duplicate
                  </button>
                </div>
              </div>

              {img ? (
                <img
                  src={img}
                  alt={`Version ${v.version}`}
                  className="mt-3 h-32 w-32 rounded-lg object-cover"
                />
              ) : (
                <div className="mt-3 flex h-32 w-32 items-center justify-center border border-dashed border-white/10 text-xs text-white/40">
                  No image
                </div>
              )}

              {v.notes ? (
                <div className="mt-2 text-sm text-white/70">{v.notes}</div>
              ) : null}

              <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/40 p-2 text-xs text-white/60">
                {JSON.stringify(v.payload, null, 2)}
              </pre>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saving ? <div className="text-xs text-white/50">Saving order...</div> : null}

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={versions.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          {versions.map((v) => {
            const img = getImageUrl(v);

            return (
              <SortableItem key={v.id} version={v}>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <div className="text-white font-semibold">v{v.version}</div>
                      <div className="text-xs text-white/50">
                        {new Date(v.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.is_current ? (
                        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                          Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `/dashboard/projects/${projectId}/canon/${canonId}/versions/set-current`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ versionId: v.id }),
                                }
                              );

                              if (!res.ok) {
                                const data = await res.json().catch(() => ({}));
                                throw new Error(data?.error || "Failed to set current");
                              }

                              window.location.reload();
                            } catch (err) {
                              console.error(err);
                              alert(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to set current"
                              );
                            }
                          }}
                          className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                        >
                          Set Current
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `/dashboard/projects/${projectId}/canon/${canonId}/versions/${v.id}/duplicate`,
                              { method: "POST" }
                            );

                            if (!res.ok) {
                              const data = await res.json().catch(() => ({}));
                              throw new Error(data?.error || "Failed to duplicate");
                            }

                            window.location.reload();
                          } catch (err) {
                            console.error(err);
                            alert(
                              err instanceof Error
                                ? err.message
                                : "Failed to duplicate"
                            );
                          }
                        }}
                        className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                      >
                        Duplicate
                      </button>
                    </div>
                  </div>

                  {img ? (
                    <img
                      src={img}
                      alt={`Version ${v.version}`}
                      className="mt-3 h-32 w-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mt-3 flex h-32 w-32 items-center justify-center border border-dashed border-white/10 text-xs text-white/40">
                      No image
                    </div>
                  )}

                  {v.notes ? (
                    <div className="mt-2 text-sm text-white/70">{v.notes}</div>
                  ) : null}

                  <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/40 p-2 text-xs text-white/60">
                    {JSON.stringify(v.payload, null, 2)}
                  </pre>
                </div>
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}