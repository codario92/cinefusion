import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; locationId: string } }
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sandbox_locations")
    .select("id, project_id, name, description, created_at")
    .eq("id", params.locationId)
    .eq("project_id", params.projectId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ location: data });
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; locationId: string } }
) {
  const supabase = await getSupabaseServer();
  const body = await req.json().catch(() => null);

  const name = (body?.name ?? "").toString().trim();
  const description = (body?.description ?? "").toString().trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sandbox_locations")
    .update({
      name,
      description: description ? description : null,
    })
    .eq("id", params.locationId)
    .eq("project_id", params.projectId)
    .select("id, project_id, name, description, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ location: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string; locationId: string } }
) {
  const supabase = await getSupabaseServer();

  // Optional safety: prevent delete if scenes reference it
  const { count, error: countErr } = await supabase
    .from("sandbox_scenes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", params.projectId)
    .eq("location_id", params.locationId);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Cannot delete: scenes are using this location." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("sandbox_locations")
    .delete()
    .eq("id", params.locationId)
    .eq("project_id", params.projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
