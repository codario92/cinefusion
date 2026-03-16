// src/app/page.tsx
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ padding: 24 }}>
      <h1>CineFusion</h1>
      <p>{user ? `Signed in as ${user.email}` : "Not signed in"}</p>
    </main>
  );
}
