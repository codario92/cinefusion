import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body?.email || "").trim();
    const smsOptIn = Boolean(body?.smsOptIn);
    const phone =
      body?.phone === null || body?.phone === undefined
        ? ""
        : String(body.phone).trim();
    const source = String(body?.source || "unknown").trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (smsOptIn && !phone) {
      return NextResponse.json(
        { ok: false, error: "Phone number is required for text alerts." },
        { status: 400 }
      );
    }

    console.log("WAITLIST SIGNUP", {
      email,
      smsOptIn,
      phone: smsOptIn ? phone : null,
      source,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: "You’re on the list.",
    });
  } catch (error) {
    console.error("WAITLIST_API_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}