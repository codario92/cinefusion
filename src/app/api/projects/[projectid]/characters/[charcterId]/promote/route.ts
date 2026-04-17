import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function buildCanonPayloadFromSandboxCharacter(source: Record<string, any>) {
  const {
    id,
    project_id,
    created_at,
    updated_at,
    name,
    description,
    ...rest
  } = source;

  return {
    name: name ?? null,
    description: description ?? null,
    ...rest,
  };
}

export async function POST(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; characterId: string }>;
  }
) {
  try {
    const { projectId, characterId } = await params;
    const supabase = await getSupabaseServer();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sandboxCharacter, error: sandboxError } = await supabase
      .from("sandbox_characters")
      .select("*")
      .eq("id", characterId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (sandboxError || !sandboxCharacter) {
      return NextResponse.json(
        { error: "Sandbox character not found." },
        { status: 404 }
      );
    }

    const canonName =
      sandboxCharacter.name?.trim() || `Character ${characterId.slice(0, 8)}`;

    const { data: canonEntity, error: canonEntityError } = await supabase
      .from("canon_entities")
      .insert({
        project_id: projectId,
        name: canonName,
      })
      .select("*")
      .single();

    if (canonEntityError || !canonEntity) {
      return NextResponse.json(
        {
          error: canonEntityError?.message || "Failed to create canon entity.",
        },
        { status: 500 }
      );
    }

    const payload = buildCanonPayloadFromSandboxCharacter(sandboxCharacter);

    const { data: canonVersion, error: canonVersionError } = await supabase
      .from("canon_versions")
      .insert({
        canon_entity_id: canonEntity.id,
        version: 1,
        payload,
        notes: `Promoted from sandbox character ${characterId}`,
        is_current: true,
      })
      .select("*")
      .single();

    if (canonVersionError || !canonVersion) {
      return NextResponse.json(
        {
          error:
            canonVersionError?.message || "Failed to create initial canon version.",
        },
        { status: 500 }
      );
    }

    const { error: updateCanonEntityError } = await supabase
      .from("canon_entities")
      .update({
        current_version_id: canonVersion.id,
      })
      .eq("id", canonEntity.id);

    if (updateCanonEntityError) {
      return NextResponse.json(
        {
          error:
            updateCanonEntityError.message ||
            "Failed to finalize canon entity.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      canon_entity_id: canonEntity.id,
      canon_version_id: canonVersion.id,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}