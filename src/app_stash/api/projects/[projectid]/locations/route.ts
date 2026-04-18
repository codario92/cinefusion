import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sandbox_locations")
    .select("id, project_id, name, description, created_at")
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ locations: data });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
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
    .insert({
      project_id: params.projectId,
      name,
      description: description ? description : null,
    })
    .select("id, project_id, name, description, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ location: data });
}
