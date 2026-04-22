// src/app/dashboard/projects/[id]/canon/[canonId]/versions/rollback/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type Params = { id: string; canonId: string };

export async function POST(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { canonId } = await params;

  const supabase = await getSupabaseServer();

  // Find current
  const { data: current, error: curErr } = await supabase
    .from("canon_versions")
    .select("id, version")
    .eq("canon_entity_id", canonId)
    .eq("is_current", true)
    .maybeSingle();

  if (curErr) return NextResponse.json({ error: curErr.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "No current version set" }, { status: 400 });

  // Find previous (highest version < current.version)
  const { data: prev, error: prevErr } = await supabase
    .from("canon_versions")
    .select("id, version")
    .eq("canon_entity_id", canonId)
    .lt("version", current.version)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prevErr) return NextResponse.json({ error: prevErr.message }, { status: 500 });
  if (!prev) return NextResponse.json({ error: "No previous version found" }, { status: 400 });

  // Switch current using the same RPC (no constraint issues)
  const { error: rpcErr } = await supabase.rpc("set_current_canon_version", {
    p_canon_entity_id: canonId,
    p_version_id: prev.id,
  });

  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 200 });
}