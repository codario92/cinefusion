"use client";
import { loadFilms } from "@/lib/storage";
import { Film } from "@/types/film";
import { useEffect, useState } from "react";
import FilmCard from "./FilmCard";

export default function FilmGrid() {
  const [films, setFilms] = useState<Film[]>([]);
  useEffect(() => setFilms(loadFilms()), []);
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Latest Films</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {films.map(f => <FilmCard key={f.id} film={f} />)}
        </div>
      </div>
    </section>
  );
}
