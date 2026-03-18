import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type Params = {
  params: Promise<{
    id: string;
    canonId: string;
    versionId: string;
  }>;
};

export async function POST(_req: Request, { params }: Params) {
  try {
    const { canonId, versionId } = await params;
    const supabase = await getSupabaseServer();

    const { data: sourceVersion, error: sourceError } = await supabase
      .from("canon_versions")
      .select("*")
      .eq("id", versionId)
      .eq("canon_entity_id", canonId)
      .single();

    if (sourceError || !sourceVersion) {
      console.error("SOURCE VERSION LOOKUP ERROR:", sourceError);
      return NextResponse.json(
        { error: "Source version not found." },
        { status: 404 }
      );
    }

    const { data: latestVersionRow, error: latestVersionError } = await supabase
      .from("canon_versions")
      .select("version")
      .eq("canon_entity_id", canonId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestVersionError) {
      console.error("LATEST VERSION LOOKUP ERROR:", latestVersionError);
      return NextResponse.json(
        { error: latestVersionError.message || "Failed to determine next version number." },
        { status: 500 }
      );
    }

    const nextVersionNumber =
      typeof latestVersionRow?.version === "number"
        ? latestVersionRow.version + 1
        : 1;

    const clonedPayload =
      sourceVersion.payload && typeof sourceVersion.payload === "object"
        ? JSON.parse(JSON.stringify(sourceVersion.payload))
        : {};

    const duplicatedNotes = sourceVersion.notes
      ? `${sourceVersion.notes}\n\nDuplicated from version ${sourceVersion.id}`
      : `Duplicated from version ${sourceVersion.id}`;

    const insertPayload = {
      canon_entity_id: sourceVersion.canon_entity_id,
      version: nextVersionNumber,
      payload: clonedPayload,
      notes: duplicatedNotes,
      image_url: sourceVersion.image_url ?? null,
      image_meta: sourceVersion.image_meta ?? null,
      is_current: false,
      sort_order: sourceVersion.sort_order ?? null,
      sort_index: sourceVersion.sort_index ?? null,
    };

    console.log("DUPLICATE INSERT PAYLOAD:", insertPayload);

    const { data: newVersion, error: insertError } = await supabase
      .from("canon_versions")
      .insert(insertPayload)
      .select("*")
      .single();

    if (insertError) {
      console.error("INSERT ERROR FULL:", insertError);
      return NextResponse.json(
        { error: insertError.message || JSON.stringify(insertError) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      version: newVersion,
    });
  } catch (error) {
    console.error("Duplicate route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}