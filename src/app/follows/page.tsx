"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFollowed } from "../../lib/followRepo";

export default function FollowedCreatorsPage() {
  const [followed, setFollowed] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setFollowed(getFollowed());
  }, []);

  if (!hydrated) {
    return (
      <main className="p-8 text-white">
        <p>Loading followed creators...</p>
      </main>
    );
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Followed Creators</h1>

      {followed.length === 0 ? (
        <p className="text-white/70">
          You’re not following anyone yet. Go explore projects and follow creators you like!
        </p>
      ) : (
        <ul className="space-y-3">
          {followed.map((id) => (
            <li
              key={id}
              className="rounded-md border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
            >
              <Link href={`/creator/${id}`} className="text-blue-400 hover:underline">
                {id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
