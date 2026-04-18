"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function listProjects() {
  const supabase = await getSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { projects: [], error: "Not signed in" };

  const { data, error } = await supabase
    .from("projects")
    .select("id,title,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) return { projects: [], error: error.message };
  return { projects: data ?? [], error: null };
}

// IMPORTANT: returns Promise<void> (no objects), so <form action={createProject}> is happy
export async function createProject(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    redirect("/dashboard/projects/new?error=Title%20is%20required");
  }

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/dashboard/projects/new");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ title, owner_id: user.id })
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect(`/dashboard/projects/new?error=${encodeURIComponent(error?.message ?? "Failed to create project")}`);
  }

  redirect(`/dashboard/projects/${data.id}`);
}
