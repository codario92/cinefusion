import { cookies } from "next/headers";

export default async function SessionDebugPage() {
  const cookieStore = await cookies(); // <-- await fixes your error
  const all = cookieStore.getAll();

  const supa = all.filter((c) => c.name.toLowerCase().includes("supabase"));

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Session Debug</h1>
      <p>Cookies containing “supabase”:</p>
      <pre>{JSON.stringify(supa, null, 2)}</pre>
    </main>
  );
}
