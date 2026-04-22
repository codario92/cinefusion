import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json(
        { user: null, error: error.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { user: null, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
