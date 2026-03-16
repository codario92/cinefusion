import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function CanonLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const supabase = await getSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return (
      <div className="p-6 text-sm text-white/80">
        You must be logged in to view canon.
      </div>
    );
  }

  const { data: items, error } = await supabase
    .from("canon_entities")
    .select("id, project_id, type, name, description, is_archived, created_at, updated_at")
    .eq("project_id", projectId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-sm text-red-300">
        Error loading canon entities: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Canon Library</h1>
          <p className="text-sm text-white/60">
            Characters, locations, and props that stay consistent across scenes.
          </p>
        </div>

        {/* We'll wire create UI next session; for now this is a placeholder */}
        <div className="text-xs text-white/50">
          Theme: <span className="text-purple-300">purple</span> / <span className="text-white/70">black</span>
        </div>
      </div>

      <div className="grid gap-3">
        {(items ?? []).map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/projects/${projectId}/canon/${item.id}`}
            className="block rounded-xl border border-white/10 bg-black/40 hover:bg-black/55 transition p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-purple-300">
                  {item.type}
                </div>
                <div className="text-base font-medium text-white">{item.name}</div>
                {item.description ? (
                  <div className="text-sm text-white/60 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                ) : null}
              </div>
              <div className="text-xs text-white/50">Open →</div>
            </div>
          </Link>
        ))}

        {(!items || items.length === 0) && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-sm text-white/60">
            No canon entities yet. Create your first Character, Location, or Prop.
          </div>
        )}
      </div>
    </div>
  );
}