import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Temporarily unavailable." },
    { status: 503 }
  );
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Temporarily unavailable." },
    { status: 503 }
  );
}