"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import PageShell from "@/components/sandbox/PageShell";
import EntityDialog from "@/components/sandbox/EntityDialog";

type LocationRow = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export default function LocationsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const supabase = useMemo(() => getSupabaseBrowser(), []);

  const [rows, setRows] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LocationRow | null>(null);

  async function load() {
    if (!projectId) return;
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("sandbox_locations")
      .select("id, project_id, name, description, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      setErr(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as LocationRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function createOrUpdate(form: { name: string; description?: string }) {
    if (!projectId) return;

    setErr(null);

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() ? form.description.trim() : null,
    };

    if (!payload.name) {
      setErr("Name is required.");
      return;
    }

    if (!editing) {
      const { data, error } = await supabase
        .from("sandbox_locations")
        .insert({ project_id: projectId, ...payload })
        .select("id, project_id, name, description, created_at")
        .single();

      if (error) {
        setErr(error.message);
        return;
      }

      setRows((prev) => [...prev, data as LocationRow]);
      setOpen(false);
      return;
    }

    const { data, error } = await supabase
      .from("sandbox_locations")
      .update(payload)
      .eq("id", editing.id)
      .eq("project_id", projectId)
      .select("id, project_id, name, description, created_at")
      .single();

    if (error) {
      setErr(error.message);
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === editing.id ? (data as LocationRow) : r)));
    setOpen(false);
    setEditing(null);
  }

  async function remove(row: LocationRow) {
    if (!projectId) return;
    const ok = confirm(`Delete location "${row.name}"?`);
    if (!ok) return;

    setErr(null);

    // Safety: block delete if referenced by scenes
    const { count, error: countErr } = await supabase
      .from("sandbox_scenes")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("location_id", row.id);

    if (countErr) {
      setErr(countErr.message);
      return;
    }
    if ((count ?? 0) > 0) {
      setErr("Cannot delete: scenes are using this location.");
      return;
    }

    const { error } = await supabase
      .from("sandbox_locations")
      .delete()
      .eq("id", row.id)
      .eq("project_id", projectId);

    if (error) {
      setErr(error.message);
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== row.id));
  }

  return (
    <PageShell title="Locations" subtitle="Canon locations. Re-used by scenes via location_id.">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Link href={`/dashboard/projects/${projectId}`}>← Back to project</Link>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.10)",
            fontWeight: 600,
          }}
        >
          New Location
        </button>
      </div>

      {err && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,0,0,0.35)",
            background: "rgba(255,0,0,0.12)",
          }}
        >
          {err}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {loading ? (
          <div style={{ opacity: 0.85 }}>Loading locations…</div>
        ) : rows.length === 0 ? (
          <div style={{ opacity: 0.85 }}>No locations yet. Click New Location.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.10)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  {r.description && <div style={{ opacity: 0.8, marginTop: 4 }}>{r.description}</div>}
                  <div style={{ opacity: 0.6, fontSize: 12, marginTop: 6 }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    onClick={() => {
                      setEditing(r);
                      setOpen(true);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => remove(r)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,0,0,0.10)",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EntityDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Location" : "New Location"}
        subtitle={editing ? "Update the location." : "Create a canon location entry."}
        initial={{
          name: editing?.name ?? "",
          description: editing?.description ?? "",
        }}
        fields={[
          {
            key: "name",
            label: "Name",
            type: "text",
            placeholder: "Location name",
            required: true,
          },
          {
            key: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Optional description / continuity notes",
          },
        ]}
        onSubmit={createOrUpdate}
        submitLabel={editing ? "Save" : "Create"}
      />
    </PageShell>
  );
}
