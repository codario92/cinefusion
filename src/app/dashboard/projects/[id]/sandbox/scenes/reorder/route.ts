import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function isUuid(x: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    x
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }
    if (!isUuid(projectId)) {
      return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const orderedIds: unknown = body?.orderedIds;

    if (
      !Array.isArray(orderedIds) ||
      orderedIds.length === 0 ||
      orderedIds.some((x) => typeof x !== "string")
    ) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty string[]" },
        { status: 400 }
      );
    }

    const ordered = orderedIds as string[];

    if (ordered.some((id) => !isUuid(id))) {
      return NextResponse.json(
        { error: "orderedIds must be UUID strings" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    // Require auth (recommended)
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify these scenes belong to this project (prevents cross-project updates)
    const { data: existing, error: fetchErr } = await supabase
      .from("sandbox_scenes")
      .select("id")
      .eq("project_id", projectId)
      .in("id", ordered);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const existingSet = new Set((existing ?? []).map((r) => r.id));
    const missing = ordered.filter((id) => !existingSet.has(id));
    if (missing.length) {
      return NextResponse.json(
        { error: `Some ids are not in this project: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}` },
        { status: 400 }
      );
    }

    // Bulk reorder via RPC (updates sort_order only)
    const { error: rpcErr } = await supabase.rpc("reorder_sandbox_scenes", {
      p_project_id: projectId,
      p_ordered_ids: ordered,
    });

    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
