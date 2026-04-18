import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request, ctx: any) {
  const supabase = await getSupabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { canonId } = ctx.params as { canonId: string };

  const body = await req.json().catch(() => null);
  const versionId = body?.versionId as string | undefined;

  if (!canonId || !versionId) {
    return NextResponse.json({ error: "canonId + versionId required" }, { status: 400 });
  }

  // 1) Clear all currents for this canon entity
  const { error: clearErr } = await supabase
    .from("canon_versions")
    .update({ is_current: false })
    .eq("canon_entity_id", canonId);

  if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });

  // 2) Set selected version current
  const { error: setErr } = await supabase
    .from("canon_versions")
    .update({ is_current: true })
    .eq("id", versionId)
    .eq("canon_entity_id", canonId);

  if (setErr) return NextResponse.json({ error: setErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}