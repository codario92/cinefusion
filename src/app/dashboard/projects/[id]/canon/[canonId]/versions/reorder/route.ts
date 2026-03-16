import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items = body?.items as Array<{ id: string; sort_index: number }> | undefined;

  if (!items?.length) {
    return NextResponse.json({ error: "items[] required" }, { status: 400 });
  }

  // Update each row
  // (Fast + simple. Later we can do RPC for bulk update if you want.)
  for (const it of items) {
    const { error } = await supabase
      .from("canon_versions")
      .update({ sort_index: it.sort_index })
      .eq("id", it.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}