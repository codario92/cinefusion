import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const orderedIds = body?.orderedIds;

    if (
      !Array.isArray(orderedIds) ||
      orderedIds.length === 0 ||
      orderedIds.some((x: unknown) => typeof x !== "string")
    ) {
      return NextResponse.json(
        { error: "orderedIds must be string[]" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    // Update each scene's sort_order (safe + simple)
    // If you have 1000+ scenes we can optimize later, but this is correct.
    const updates = orderedIds.map((sceneId: string, index: number) =>
      supabase
        .from("sandbox_scenes")
        .update({ sort_order: index })
        .eq("id", sceneId)
        .eq("project_id", projectId)
    );

    const results = await Promise.all(updates);

    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      return NextResponse.json(
        { error: firstError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
