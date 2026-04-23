import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreationResult } from "@/lib/cif";
import { buildStrictImagePrompt, promptToCIF } from "@/lib/prompt-to-cif";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const prompt = String(body?.prompt ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const role = String(body?.role ?? "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const cif = promptToCIF({ prompt, name, role });
    const fullPrompt = buildStrictImagePrompt({ prompt, cif });

    const imageResult = await openai.images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      size: "1024x1024",
    });

    const b64 = imageResult.data?.[0]?.b64_json;

    if (!b64) {
      return NextResponse.json(
        { error: "No image returned from generation API" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(b64, "base64");

    const supabase = getSupabaseAdmin();

    const filename = `${Date.now()}-${(name || "character")
      .replace(/\s+/g, "-")
      .toLowerCase()}.png`;

    const path = `creation/generated/${filename}`;

    const { error: uploadErr } = await supabase.storage
      .from("canon-images")
      .upload(path, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("canon-images")
      .getPublicUrl(path);

    const result: CreationResult = {
      image_url: publicData.publicUrl,
      image_path: path,
      cif,
      generation_meta: {
        provider: "openai",
        model: "gpt-image-1",
        prompt: fullPrompt,
        seed: null,
        raw: {
          user_prompt: prompt,
          extracted_cif: cif,
          size: "1024x1024",
        },
      },
      notes: "Initial generated concept from continuity-first creation flow",
    };

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("creation generate route error:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown generation route error",
      },
      { status: 500 }
    );
  }
}