import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function GET(
  _req: Request,
  { params }: { params: { projectid: string } }
) {
  const projectId = params.projectid;

  if (!projectId || !isUuid(projectId)) {
    return NextResponse.json(
      { error: `Bad project id: ${String(projectId)}` },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sandbox_scenes")
    .select("id, project_id, title, synopsis, location_id, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] }, { status: 200 });
}

export async function POST(
  req: Request,
  { params }: { params: { projectid: string } }
) {
  const projectId = params.projectid;

  if (!projectId || !isUuid(projectId)) {
    return NextResponse.json(
      { error: `Bad project id: ${String(projectId)}` },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  const synopsis =
    body?.synopsis === "" || body?.synopsis === undefined
      ? null
      : String(body.synopsis);

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sandbox_scenes")
    .insert({
      project_id: projectId,
      title,
      synopsis,
      location_id: null,
    })
    .select("id, project_id, title, synopsis, location_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data }, { status: 201 });
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectid: string } }
) {
  const projectId = params.projectid;

  if (!projectId || !isUuid(projectId)) {
    return NextResponse.json(
      { error: `Bad project id: ${String(projectId)}` },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  const title = String(body?.title ?? "").trim();
  const synopsis =
    body?.synopsis === "" || body?.synopsis === undefined
      ? null
      : String(body.synopsis);

  if (!id || !isUuid(id)) {
    return NextResponse.json({ error: "Valid scene id is required." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sandbox_scenes")
    .update({ title, synopsis })
    .eq("id", id)
    .eq("project_id", projectId)
    .select("id, project_id, title, synopsis, location_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data }, { status: 200 });
}
