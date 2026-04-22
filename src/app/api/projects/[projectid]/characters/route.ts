import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(req: NextRequest, ctx: { params: { projectId: string } }) {
  const { supabase, res } = createSupabaseRouteClient(req);
  const projectId = ctx.params.projectId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("characters")
    .select("id,name,locked_traits,created_at,updated_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ characters: data ?? [] }, { headers: res.headers });
}

export async function POST(req: NextRequest, ctx: { params: { projectId: string } }) {
  const { supabase, res } = createSupabaseRouteClient(req);
  const projectId = ctx.params.projectId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("characters")
    .insert({ project_id: projectId, name })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: data.id }, { headers: res.headers });
}
