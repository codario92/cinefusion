import Link from "next/link";

async function fetchCanon(projectId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/projects/${projectId}/canon`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function CanonPage({ params }: { params: { id: string } }) {
  const projectId = params.id;
  const data = await fetchCanon(projectId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Canon Library</h1>
          <p className="text-sm text-muted-foreground">
            Characters, locations, and props that stay consistent across scenes.
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${projectId}/sandbox/canon/new`}
          className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
        >
          + New Canon Entity
        </Link>
      </div>

      <div className="grid gap-3">
        {(data.items ?? []).map((item: any) => (
          <Link
            key={item.id}
            href={`/dashboard/projects/${projectId}/sandbox/canon/${item.id}`}
            className="block rounded-lg border border-white/10 bg-black/30 hover:bg-black/40 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-300 uppercase tracking-wide">{item.type}</div>
                <div className="text-base font-medium">{item.name}</div>
                {item.description ? (
                  <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">Open →</div>
            </div>
          </Link>
        ))}

        {(!data.items || data.items.length === 0) && (
          <div className="rounded-lg border border-white/10 bg-black/30 p-6 text-sm text-muted-foreground">
            No canon entities yet. Create your first character, location, or prop.
          </div>
        )}
      </div>
    </div>
  );
}