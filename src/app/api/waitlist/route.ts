import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body?.email || "").trim().toLowerCase();
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

    const { error } = await supabase.from("beta_waitlist").insert({
      email,
      sms_opt_in: smsOptIn,
      phone: smsOptIn ? phone : null,
      source,
    });

    if (error) {
      const msg = String(error.message || "").toLowerCase();

      if (
        msg.includes("duplicate key") ||
        msg.includes("unique constraint") ||
        msg.includes("beta_waitlist_email_key")
      ) {
        return NextResponse.json({
          ok: true,
          message: "You're already on the waitlist.",
        });
      }

      console.error("WAITLIST_API_ERROR", error);

      return NextResponse.json(
        { ok: false, error: "Server error. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "You're on the list.",
    });
  } catch (error) {
    console.error("WAITLIST_API_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}