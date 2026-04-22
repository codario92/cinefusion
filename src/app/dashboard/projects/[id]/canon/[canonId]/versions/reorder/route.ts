import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReorderItem = {
  id: string;
  sort_order: number;
};

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const items = (body?.items ?? []) as ReorderItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    for (const item of items) {
      const { error } = await supabase
        .from("canon_versions")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reorder route error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown reorder route error",
      },
      { status: 500 }
    );
  }
}