import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type ReorderUpdate = {
  id: string;
  sort_order: number;
};

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const updates = body?.updates as ReorderUpdate[] | undefined;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "updates[] required" },
        { status: 400 }
      );
    }

    for (const u of updates) {
      if (!u?.id || typeof u.sort_order !== "number") {
        return NextResponse.json(
          { error: "Each update must include id and numeric sort_order" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("canon_versions")
        .update({ sort_order: u.sort_order })
        .eq("id", u.id);

      if (error) {
        console.error("Reorder update failed:", error);
        return NextResponse.json(
          { error: error.message || "Failed to update sort order" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Reorder crash:", err);
    return NextResponse.json(
      { error: err?.message || "Reorder failed" },
      { status: 500 }
    );
  }
}