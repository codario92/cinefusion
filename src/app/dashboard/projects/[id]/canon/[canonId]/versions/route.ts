import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type Params = { id: string; canonId: string };

export async function POST(
  req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { canonId } = await context.params;

    const supabase = await getSupabaseServer();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const notes = (body?.notes ?? "").toString();
    const payload = body?.payload ?? {};
    const image_url = body?.image_url ?? null;
    const image_meta = body?.image_meta ?? null;

    // Compute next version + next sort order
    const { data: latest } = await supabase
      .from("canon_versions")
      .select("version, sort_order")
      .eq("canon_entity_id", canonId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (latest?.version ?? 0) + 1;
    const nextSort = (latest?.sort_order ?? nextVersion - 1) + 1;

    // IMPORTANT: insert with is_current=false (avoids unique constraint)
    const { data: inserted, error: insErr } = await supabase
      .from("canon_versions")
      .insert({
        canon_entity_id: canonId,
        version: nextVersion,
        sort_order: nextSort,
        payload,
        notes: notes.length ? notes : null,
        image_url,
        image_meta,
        is_current: false,
      })
      .select("id, canon_entity_id, version, sort_order, is_current, created_at, image_url, image_meta, payload, notes")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // OPTIONAL behavior: auto-set newly created version as current
    // This avoids the constraint because we clear old current first.
    const { error: clearErr } = await supabase
      .from("canon_versions")
      .update({ is_current: false })
      .eq("canon_entity_id", canonId)
      .eq("is_current", true);

    if (clearErr) {
      return NextResponse.json({ error: clearErr.message }, { status: 500 });
    }

    const { error: setErr } = await supabase
      .from("canon_versions")
      .update({ is_current: true })
      .eq("id", inserted.id)
      .eq("canon_entity_id", canonId);

    if (setErr) {
      return NextResponse.json({ error: setErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, version: inserted }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}