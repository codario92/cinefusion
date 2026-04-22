// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import SignOutButton from "@/components/SignOutButton";

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();

  // send them back to sign-in
  const url = new URL("/sign-in", req.url);
  return NextResponse.redirect(url, { status: 303 });
}

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {user.email}</p>
      <div style={{ marginTop: 16 }}>
        <SignOutButton />
      </div>
    </main>
  );
}
