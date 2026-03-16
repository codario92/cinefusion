export default function Features() {
  const items = [
    { title: "Creator-first", text: "Premieres, fan clubs, contests, and fair revenue splits." },
    { title: "Collaboration Tools", text: "Project hubs, file sharing, roles, and permissions (coming)." },
    { title: "Audience Built-in", text: "Spotlights, SEO pages, and embedded social clips." },
  ];

  return (
    <section id="learn-more" className="bg-zinc-950 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Why CineFusion</h2>
        <p className="mt-2 text-white/60 max-w-2xl">
          A modern home for indie films—built for both filmmakers and fans.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-xl border border-white/10 p-5 bg-black/40 hover:bg-white/5 transition"
            >
              <h3 className="text-lg font-medium">{it.title}</h3>
              <p className="mt-2 text-white/70">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
 