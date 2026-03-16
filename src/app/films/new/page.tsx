// src/app/films/new/page.tsx
"use client";

import { useState } from "react";
import type { Film } from "@/types/film";
import { loadFilms, saveFilms } from "@/lib/storage";

export default function NewFilmPage() {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const current: Film[] = loadFilms();
    const newFilm: Film = {
      id: `local-${Date.now()}`,
      title,
      description: "",
      tagline: "",
      provider: videoUrl.includes("youtube") ? "youtube" : "external",
      videoId: videoUrl, // for now we store the raw URL; we can parse later
      posterUrl: "",
      thumbnailUrl: thumbnailUrl || "",
      genres: [],
      creatorId: "demo-user",
      createdAt: new Date().toISOString(),
      likes: 0,
      isPremium: false,
    };

    saveFilms([...current, newFilm]);

    setTitle("");
    setVideoUrl("");
    setThumbnailUrl("");

    alert("Film saved locally. (Dev stub)");
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-white text-2xl font-semibold mb-6">Add a New Film</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-white/80 text-sm">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 text-white px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </label>

        <label className="block">
          <span className="text-white/80 text-sm">Video URL (YouTube/Vimeo/MP4)</span>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 text-white px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </label>

        <label className="block">
          <span className="text-white/80 text-sm">Thumbnail URL (optional)</span>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="mt-1 w-full rounded-lg bg-white/5 text-white px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="/placeholder.svg"
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 transition"
        >
          Save (Local Dev)
        </button>
      </form>
    </main>
  );
}
