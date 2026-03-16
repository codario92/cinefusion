// src/app/components/FilmCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Film } from "@/types/film";

type FilmCardProps = {
  film: Film;
};

export default function FilmCard({ film }: FilmCardProps) {
  // Fallbacks for optional fields so TS and <Image> are happy
  const thumb = film.thumbnailUrl ?? "/placeholder.svg";
  const title = film.title ?? "Untitled";
  const creator = film.creatorId ?? "unknown";

  return (
    <article className="group relative rounded-xl overflow-hidden bg-black/30 ring-1 ring-white/10 hover:ring-white/20 transition">
      <Link href={`/films/${film.id}`} className="block">
        <div className="aspect-video relative">
          <Image
            src={thumb}
            alt={`${title} thumbnail`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          <p className="text-xs text-white/60 mt-1">by {creator}</p>
        </div>
      </Link>
    </article>
  );
}
