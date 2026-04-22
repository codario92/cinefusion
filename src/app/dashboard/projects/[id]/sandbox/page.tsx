import Link from "next/link";

export default function SandboxHome({ params }: { params: { id: string } }) {
  const base = `/dashboard/projects/${params.id}/sandbox`;

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Sandbox</h1>
      <p style={{ opacity: 0.75 }}>Core continuity objects live here.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link href={`${base}/characters`}>Characters</Link>
        <Link href={`${base}/locations`}>Locations</Link>
        <Link href={`${base}/scenes`}>Scenes</Link>
      </div>

      <div style={{ marginTop: 18, opacity: 0.8 }}>
        Pick a tab to start building the project’s continuity.
      </div>
    </main>
  );
}
