"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CanonEntityRow = {
  id: string;
  name?: string | null;
  title?: string | null;
  current_version_id?: string | null;
  [key: string]: any;
};

type CanonEntityVersionRow = {
  id: string;
  canon_entity_id: string;
  version?: number | null;
  notes?: string | null;
  payload?: any;
  image_url?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

type SceneCharacterLinkRow = {
  id: string;
  scene_id: string;
  canon_entity_id: string;
  canon_version_id: string | null;
  created_at: string | null;
};

type Props = {
  projectId: string;
  sceneId: string;
  canonEntities: CanonEntityRow[];
  versions: CanonEntityVersionRow[];
  links: SceneCharacterLinkRow[];
};

function getEntityLabel(entity: CanonEntityRow) {
  return entity.name || entity.title || `Entity ${entity.id.slice(0, 8)}`;
}

function getVersionLabel(version: CanonEntityVersionRow) {
  if (typeof version.version === "number") return `v${version.version}`;
  return `Version ${version.id.slice(0, 8)}`;
}

function getVersionImage(version: CanonEntityVersionRow) {
  return version.image_url || version?.payload?.image?.url || null;
}

export default function SceneCharactersPanel({
  projectId,
  sceneId,
  canonEntities,
  versions,
  links,
}: Props) {
  const router = useRouter();

  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    canonEntities[0]?.id ?? ""
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [attaching, setAttaching] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const versionsByEntity = useMemo(() => {
    const map = new Map<string, CanonEntityVersionRow[]>();

    for (const version of versions) {
      const current = map.get(version.canon_entity_id) ?? [];
      current.push(version);
      map.set(version.canon_entity_id, current);
    }

    for (const [entityId, items] of map.entries()) {
      items.sort((a, b) => {
        const av = typeof a.version === "number" ? a.version : -1;
        const bv = typeof b.version === "number" ? b.version : -1;
        return bv - av;
      });
      map.set(entityId, items);
    }

    return map;
  }, [versions]);

  const selectedEntityVersions = selectedEntityId
    ? versionsByEntity.get(selectedEntityId) ?? []
    : [];

  useEffect(() => {
    if (!selectedEntityId) return;

    const entity = canonEntities.find((e) => e.id === selectedEntityId);
    const list = versionsByEntity.get(selectedEntityId) ?? [];

    const preferred =
      (entity?.current_version_id &&
        list.find((v) => v.id === entity.current_version_id)?.id) ||
      list[0]?.id ||
      "";

    setSelectedVersionId(preferred);
  }, [selectedEntityId, canonEntities, versionsByEntity]);

  async function handleAttach() {
    if (!selectedEntityId) {
      alert("Select a character first.");
      return;
    }

    setAttaching(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/scenes/${sceneId}/characters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canon_entity_id: selectedEntityId,
            canon_version_id: selectedVersionId || null,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to attach character.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Failed to attach character."
      );
    } finally {
      setAttaching(false);
    }
  }

  async function handleRemove(linkId: string) {
    setRemovingId(linkId);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/scenes/${sceneId}/characters/${linkId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to remove character.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Failed to remove character."
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 20,
        background: "rgba(255,255,255,0.03)",
        display: "grid",
        gap: 20,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700 }}>Characters in Scene</div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 12, opacity: 0.75 }}>Character</label>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              background: "#111",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {canonEntities.length === 0 ? (
              <option value="">No canon entities found</option>
            ) : null}

            {canonEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {getEntityLabel(entity)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontSize: 12, opacity: 0.75 }}>Version</label>
          <select
            value={selectedVersionId}
            onChange={(e) => setSelectedVersionId(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              background: "#111",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {selectedEntityVersions.length === 0 ? (
              <option value="">No versions found</option>
            ) : null}

            {selectedEntityVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {getVersionLabel(version)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleAttach}
          disabled={
            attaching || !selectedEntityId || selectedEntityVersions.length === 0
          }
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: attaching ? "#333" : "white",
            color: attaching ? "#aaa" : "black",
            border: "none",
            fontWeight: 700,
            cursor: attaching ? "not-allowed" : "pointer",
            justifySelf: "start",
          }}
        >
          {attaching ? "Attaching..." : "Attach Character"}
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Attached Characters</div>

        {links.length === 0 ? (
          <div style={{ opacity: 0.65, fontSize: 14 }}>
            No characters linked to this scene yet.
          </div>
        ) : (
          links.map((link) => {
            const entity = canonEntities.find((e) => e.id === link.canon_entity_id);
            const version = versions.find((v) => v.id === link.canon_version_id);
            const imageUrl = version ? getVersionImage(version) : null;

            return (
              <div
                key={link.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 10,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {entity ? getEntityLabel(entity) : "Unknown character"}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                      {version ? getVersionLabel(version) : "No specific version"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(link.id)}
                    disabled={removingId === link.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.12)",
                      cursor: removingId === link.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {removingId === link.id ? "Removing..." : "Remove"}
                  </button>
                </div>

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={entity ? getEntityLabel(entity) : "Character"}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}