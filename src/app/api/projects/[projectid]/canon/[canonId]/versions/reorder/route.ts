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
    if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const order = body?.order as Array<{ id: string; sort_order: number }>;
    if (!Array.isArray(order)) return NextResponse.json({ error: "Missing order" }, { status: 400 });

    // Update each row
    const updates = order.map((x) => ({
      id: x.id,
      canon_entity_id: canonId,
      sort_order: x.sort_order,
    }));

    const { error } = await supabase.from("canon_versions").upsert(updates, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}