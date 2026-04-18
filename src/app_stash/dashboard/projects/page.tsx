// src/app/dashboard/projects/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function ProjectsPage() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?redirect=/dashboard/projects");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,title,updated_at,created_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="mt-4 text-red-600 text-sm">Error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link
          href="/dashboard/projects/new"
          className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium"
        >
          New Project
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {projects?.length ? (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/projects/${p.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50"
            >
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-neutral-500 mt-1">
                Updated {new Date(p.updated_at ?? p.created_at).toLocaleString()}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-600">
            No projects yet. Click <b>New Project</b> to create your first sandbox project.
          </div>
        )}
      </div>
    </main>
  );
}
