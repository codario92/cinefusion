import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  id: string;
  canonId: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { canonId } = await params;
    const body = await req.json();

    const notes = (body?.notes ?? "").toString();
    const payload = body?.payload ?? {};
    const image_url = body?.image_url ?? null;
    const image_meta = body?.image_meta ?? null;

    const supabase = getSupabaseAdmin();

    const { data: latest, error: latestErr } = await supabase
      .from("canon_versions")
      .select("version, sort_order")
      .eq("canon_entity_id", canonId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestErr) {
      return NextResponse.json({ error: latestErr.message }, { status: 500 });
    }

    const nextVersion = (latest?.version ?? 0) + 1;
    const nextSort = (latest?.sort_order ?? nextVersion - 1) + 1;

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
      .select(
        "id, canon_entity_id, version, sort_order, is_current, created_at, image_url, image_meta, payload, notes"
      )
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, version: inserted }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}