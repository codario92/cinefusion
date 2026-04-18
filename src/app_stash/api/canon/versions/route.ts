import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();

    const formData = await req.formData();

    const canon_entity_id = formData.get("canon_entity_id") as string | null;
    const notes = formData.get("notes") as string | null;
    const image = formData.get("image") as File | null;

    if (!canon_entity_id) {
      return NextResponse.json(
        { error: "canon_entity_id required" },
        { status: 400 }
      );
    }

    let image_url: string | null = null;
    let image_meta: Record<string, unknown> | null = null;

    if (image && image.size > 0) {
      const fileExt = image.name.split(".").pop() || "png";
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("canon-images")
        .upload(fileName, image, {
          contentType: image.type,
        });

      if (uploadError) {
        console.log("UPLOAD ERROR:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("canon-images")
        .getPublicUrl(fileName);

      image_url = data.publicUrl;
      image_meta = {
        fileName,
        originalName: image.name,
        contentType: image.type,
        size: image.size,
      };
    }

    const { data: latestRows, error: latestError } = await supabase
      .from("canon_versions")
      .select("version")
      .eq("canon_entity_id", canon_entity_id)
      .order("version", { ascending: false })
      .limit(1);

    if (latestError) {
      console.log("LATEST VERSION ERROR:", latestError);
      throw latestError;
    }

    const nextVersion =
      latestRows && latestRows.length > 0 ? Number(latestRows[0].version) + 1 : 1;

    const payload = image_url
      ? {
          image: {
            url: image_url,
          },
        }
      : {};

    const { error: insertError } = await supabase
      .from("canon_versions")
      .insert({
        canon_entity_id,
        version: nextVersion,
        notes: notes || null,
        payload,
        image_url,
        image_meta,
      });

    if (insertError) {
      console.log("INSERT ERROR:", insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("ROUTE CRASH:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error." },
      { status: 500 }
    );
  }
}
