import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function AccountPage() {
  const supabase = await getSupabaseServer();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) redirect("/sign-in");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="mt-2 text-sm text-neutral-500">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Profile</h2>

        {profileError ? (
          <p className="mt-3 text-sm text-red-600">
            Profile query error: {profileError.message}
          </p>
        ) : !profile ? (
          <p className="mt-3 text-sm text-neutral-600">
            No profile row found yet. If you just signed up, refresh once.
          </p>
        ) : (
          <div className="mt-4 space-y-2 text-sm">
            <div><span className="text-neutral-500">Display name:</span> {profile.display_name ?? "—"}</div>
            <div><span className="text-neutral-500">Username:</span> {profile.username ?? "—"}</div>
            <div><span className="text-neutral-500">Bio:</span> {profile.bio ?? "—"}</div>
            <div className="pt-3 text-xs text-neutral-500">
              Updated {new Date(profile.updated_at).toLocaleString()}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
