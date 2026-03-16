import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

type RouteCtx = {
  params: Promise<{
    projectId: string;
    canonId: string;
  }>;
};

export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const { canonId } = await ctx.params;
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("canon_versions")
      .select(
        "id, canon_entity_id, version, payload, notes, created_at, image_url, image_meta, is_current, sort_order, sort_index"
      )
      .eq("canon_entity_id", canonId)
      .order("version", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ versions: data ?? [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unknown error." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const { projectId, canonId } = await ctx.params;
    const supabase = await getSupabaseServer();

    const form = await req.formData();

    const notes = String(form.get("notes") ?? "");
    const payloadRaw = String(form.get("payload") ?? "{}");
    const file = form.get("file") as File | null;

    console.log("UPLOAD FILE:", file);
    console.log("UPLOAD FILE NAME:", file?.name ?? null);
    console.log("UPLOAD FILE SIZE:", file?.size ?? null);
    console.log("UPLOAD FILE TYPE:", file?.type ?? null);

    let payload: any = {};
    try {
      payload = payloadRaw.trim() ? JSON.parse(payloadRaw) : {};
    } catch {
      return NextResponse.json(
        { error: "Payload must be valid JSON." },
        { status: 400 }
      );
    }

    const { data: latest, error: latestErr } = await supabase
      .from("canon_versions")
      .select("version")
      .eq("canon_entity_id", canonId)
      .order("version", { ascending: false })
      .limit(1);

    if (latestErr) {
      return NextResponse.json({ error: latestErr.message }, { status: 500 });
    }

    const nextVersion =
      Array.isArray(latest) && latest.length > 0
        ? Number(latest[0]?.version ?? 0) + 1
        : 1;

    let imageUrl: string | null = null;
    let imageMeta: Record<string, any> | null = null;

    if (file && file.size > 0) {
      const safeName = file.name.replace(/\s+/g, "-");
      const storagePath = `canon/${projectId}/${canonId}/${Date.now()}-${safeName}`;

      console.log("STORAGE PATH:", storagePath);

      const { error: uploadErr } = await supabase.storage
        .from("canon-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        console.log("UPLOAD ERROR:", uploadErr.message);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadErr.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("canon-images")
        .getPublicUrl(storagePath);

      imageUrl = publicUrlData?.publicUrl ?? null;
      imageMeta = {
        path: storagePath,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      console.log("PUBLIC IMAGE URL:", imageUrl);

      payload = {
        ...payload,
        image: {
          ...(payload?.image ?? {}),
          url: imageUrl,
          path: storagePath,
        },
      };
    } else {
      console.log("NO FILE RECEIVED IN ROUTE");
    }

    const insertRow = {
      canon_entity_id: canonId,
      version: nextVersion,
      notes: notes.trim() || null,
      payload,
      image_url: imageUrl,
      image_meta: imageMeta,
    };

    console.log("INSERT ROW IMAGE URL:", insertRow.image_url);

    const { data: inserted, error: insertErr } = await supabase
      .from("canon_versions")
      .insert(insertRow)
      .select("id, version, image_url")
      .single();

    if (insertErr) {
      console.log("INSERT ERROR:", insertErr.message);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      id: inserted.id,
      version: inserted.version,
      image_url: inserted.image_url ?? null,
      versionLabel: `v${inserted.version}`,
    });
  } catch (error: any) {
    console.log("ROUTE CRASH:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error." },
      { status: 500 }
    );
  }
}