"use client";

export default function SignOutButton() {
  return (
    <form action="/sign-out" method="post">
      <button
        type="submit"
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
      >
        Sign out
      </button>
    </form>
  );
}
