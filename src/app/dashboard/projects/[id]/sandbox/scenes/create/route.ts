import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // Auth check (recommended)
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const title = (body?.title ?? "").toString().trim();
    const synopsis = body?.synopsis == null ? null : String(body.synopsis);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get current max sort_order
    const { data: last, error: lastErr } = await supabase
      .from("sandbox_scenes")
      .select("sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) {
      return NextResponse.json({ error: lastErr.message }, { status: 500 });
    }

    const nextOrder = (last?.sort_order ?? -1) + 1;

    const { data: created, error: insErr } = await supabase
      .from("sandbox_scenes")
      .insert({
        project_id: projectId,
        title,
        synopsis,
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: created.id }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
