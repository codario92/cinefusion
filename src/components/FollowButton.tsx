"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { toggleFollow, getFollowed } from "../../lib/followRepo";

type FollowButtonProps = {
  /** The creator/user id you want to follow */
  targetId: string;
  /** Show a tiny count next to the button (local/demo only for now) */
  showCounts?: boolean;
  /** Optional className to position/size the button */
  className?: string;
};

export default function FollowButton({
  targetId,
  showCounts = false,
  className,
}: FollowButtonProps) {
  const [hydrated, setHydrated] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  // Demo-only local count (we’ll replace with real counts later)
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Avoid SSR/localStorage mismatch
    setHydrated(true);
    const followed = getFollowed();
    setIsFollowing(followed.includes(targetId));
  }, [targetId]);

  const onToggle = () => {
    const next = toggleFollow(targetId);
    setIsFollowing(next);
    setCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
  };

  if (!hydrated) {
    // Render a neutral placeholder to avoid flicker
    return (
      <button
        type="button"
        className={clsx(
          "inline-flex items-center rounded-full border px-3 py-1 text-xs opacity-50",
          className
        )}
        aria-disabled
      >
        Follow
      </button>
    );
  }

  return (
    <div className={clsx("inline-flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition",
          isFollowing
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
        aria-pressed={isFollowing}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
      {showCounts && (
        <span className="text-[10px] text-white/70 select-none tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}
