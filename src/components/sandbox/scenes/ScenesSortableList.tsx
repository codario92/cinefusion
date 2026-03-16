"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SceneRow = {
  id: string;
  title: string;
  summary?: string | null;
  sort_order?: number | null;
};

type Props = {
  projectId: string;
  initialScenes: SceneRow[];
  onOpenEdit?: (scene: SceneRow) => void; // optional: plug into your existing edit flow
};

export default function ScenesSortableList({
  projectId,
  initialScenes,
  onOpenEdit,
}: Props) {
  const [scenes, setScenes] = React.useState<SceneRow[]>(() =>
    [...initialScenes].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );

  // Keep list in sync if server data changes (e.g. after create/delete)
  React.useEffect(() => {
    setScenes([...initialScenes].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
  }, [initialScenes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function persistOrder(orderedIds: string[]) {
    const res = await fetch(`/dashboard/projects/${projectId}/sandbox/scenes/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });

    if (!res.ok) {
      console.error("Failed to persist scene order");
      // Optional: if you want hard recovery, refresh:
      // window.location.reload();
    }
  }

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      if (active.id === over.id) return;

      setScenes((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === String(active.id));
        const newIndex = prev.findIndex((s) => s.id === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;

        const next = arrayMove(prev, oldIndex, newIndex);

        // Optimistic persist
        persistOrder(next.map((s) => s.id));

        // Also update local sort_order so UI stays stable without refetch
        return next.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
      });
    },
    [projectId]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {scenes.map((scene) => (
            <SortableSceneCard key={scene.id} scene={scene} onOpenEdit={onOpenEdit} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableSceneCard({
  scene,
  onOpenEdit,
}: {
  scene: SceneRow;
  onOpenEdit?: (scene: SceneRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-2xl border border-white/10 bg-black/35 backdrop-blur",
        "px-4 py-3 shadow-sm",
        "hover:border-white/20",
        isDragging ? "opacity-70 ring-2 ring-purple-500/40" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to reorder"
          className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          {...attributes}
          {...listeners}
        >
          <span className="text-lg leading-none">⠿</span>
        </button>

        {/* Content */}
        <button
          type="button"
          onClick={() => onOpenEdit?.(scene)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="truncate text-sm font-semibold text-white">{scene.title}</div>
          {scene.summary ? (
            <div className="mt-1 line-clamp-2 text-xs text-white/65">{scene.summary}</div>
          ) : (
            <div className="mt-1 text-xs text-white/40">No summary</div>
          )}
        </button>

        <div className="pt-1 text-[11px] text-white/35">Drag</div>
      </div>
    </div>
  );
}
