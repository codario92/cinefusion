import { NextRequest, NextResponse } from "next/server";

// NOTE: This is a stub so the UI works now.
// Replace with your real auth + DB updates when ready.

export async function POST(req: NextRequest) {
  const targetId = req.nextUrl.searchParams.get("targetId");
  if (!targetId) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  // TODO:
  // 1) get currentUserId from your auth
  // 2) insert follow relation (currentUserId -> targetId)
  // 3) increment follower count for targetId
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const targetId = req.nextUrl.searchParams.get("targetId");
  if (!targetId) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  // TODO:
  // 1) get currentUserId from auth
  // 2) delete follow relation (currentUserId -> targetId)
  // 3) decrement follower count
  return NextResponse.json({ ok: true });
}
