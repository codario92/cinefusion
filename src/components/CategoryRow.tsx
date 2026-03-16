// src/app/components/CategoryRow.tsx
import FilmCard from "./FilmCard";
import type { Film } from "@/types/film";

type CategoryRowProps = {
  title: string;
  films: Film[]; // required array
};

export default function CategoryRow({ title, films }: CategoryRowProps) {
  const safeFilms = Array.isArray(films) ? films : [];

  return (
    <section className="px-6 py-6">
      <h2 className="font-semibold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {safeFilms.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
        {safeFilms.length === 0 && (
          <div className="text-white/60 text-sm">No films yet.</div>
        )}
      </div>
    </section>
  );
}
