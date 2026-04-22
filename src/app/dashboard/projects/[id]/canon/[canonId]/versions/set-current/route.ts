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
    const body = await req.json().catch(() => ({}));
    const versionId = body?.versionId as string | undefined;

    if (!canonId || !versionId) {
      return NextResponse.json(
        { error: "canonId and versionId are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error: clearErr } = await supabase
      .from("canon_versions")
      .update({ is_current: false })
      .eq("canon_entity_id", canonId);

    if (clearErr) {
      return NextResponse.json({ error: clearErr.message }, { status: 500 });
    }

    const { error: setErr } = await supabase
      .from("canon_versions")
      .update({ is_current: true })
      .eq("id", versionId)
      .eq("canon_entity_id", canonId);

    if (setErr) {
      return NextResponse.json({ error: setErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("set-current route error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown set-current route error",
      },
      { status: 500 }
    );
  }
}