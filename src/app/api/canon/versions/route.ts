import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await req.formData();

    const canonEntityId = String(formData.get("canon_entity_id") || "").trim();
    const projectId = String(formData.get("project_id") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const image = formData.get("image") as File | null;

    if (!canonEntityId) {
      return NextResponse.json(
        { error: "canon_entity_id is required" },
        { status: 400 }
      );
    }

    const { data: existing, error: existingErr } = await supabase
      .from("canon_versions")
      .select("version")
      .eq("canon_entity_id", canonEntityId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }

    const nextVersion = (existing?.version ?? 0) + 1;

    let imageUrl: string | null = null;
    let imageMeta: Record<string, any> | null = null;

    if (image && image.size > 0) {
      const safeName = image.name.replace(/\s+/g, "-");
      const path = `canon/${projectId || "no-project"}/${canonEntityId}/${Date.now()}-${safeName}`;

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadErr } = await supabase.storage
        .from("canon-images")
        .upload(path, buffer, {
          contentType: image.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadErr) {
        return NextResponse.json({ error: uploadErr.message }, { status: 500 });
      }

      const { data: publicData } = supabase.storage
        .from("canon-images")
        .getPublicUrl(path);

      imageUrl = publicData.publicUrl;
      imageMeta = {
        path,
        name: image.name,
        type: image.type,
        size: image.size,
      };
    }

    const payload: any = {};

    if (imageUrl) {
      payload.image = {
        url: imageUrl,
        path: imageMeta?.path ?? null,
      };
    }

    const insertRow = {
      canon_entity_id: canonEntityId,
      version: nextVersion,
      notes: notes || null,
      payload,
      image_url: imageUrl,
      image_meta: imageMeta,
      is_current: false,
      sort_order: nextVersion,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("canon_versions")
      .insert(insertRow)
      .select("*")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, version: inserted });
  } catch (err) {
    console.error("versions route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}