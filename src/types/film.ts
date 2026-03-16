// src/app/types/film.ts

export interface Film {
  id: string;
  title: string;
  description: string;
  tagline?: string;

  // media / source
  provider: "youtube" | "vimeo" | "external";
  videoId: string;          // e.g. YouTube/Vimeo id or URL slug
  thumbnailUrl: string;     // public URL to a poster/thumbnail
  posterUrl?: string;       // optional full poster

  // meta
  genres: string[];
  creatorId: string;        // user/creator reference (string id for now)
  isPremium: boolean;       // gated by fan club / paywall
  likes: number;
  createdAt: string;        // ISO string
}


