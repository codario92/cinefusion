"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function CreateSceneButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [synopsis, setSynopsis] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function createScene() {
    setSaving(true);
    setError(null);

    const res = await fetch(
      `/dashboard/projects/${projectId}/sandbox/scenes/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          synopsis: synopsis.trim() ? synopsis.trim() : null,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error ?? "Failed to create scene");
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    setTitle("");
    setSynopsis("");

    // Refresh the server page so the new scene shows up in order
    router.refresh();

    // Optional: jump directly into the new scene editor
    if (data?.id) {
      router.push(`/dashboard/projects/${projectId}/sandbox/scenes/${data.id}`);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(130,90,255,0.18)", // purple tint
          color: "white",
          borderRadius: 12,
          padding: "10px 12px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        + New Scene
      </button>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "min(640px, 100%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(15,15,25,0.98)",
              padding: 16,
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Create Scene</div>
              <div style={{ marginLeft: "auto" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    borderRadius: 12,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Title (required)</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sad Goodbye"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "white",
                    padding: "10px 12px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Synopsis (optional)</div>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="One or two lines. We’ll expand this later."
                  rows={4}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "white",
                    padding: "10px 12px",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </label>

              {error ? (
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,0,0,0.35)",
                    background: "rgba(255,0,0,0.10)",
                    padding: 10,
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={createScene}
                disabled={saving}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: saving ? "rgba(255,255,255,0.08)" : "rgba(130,90,255,0.28)",
                  color: "white",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Creating…" : "Create Scene"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
