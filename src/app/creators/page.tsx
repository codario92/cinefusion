export default function CreatorsPage() {
  const demoCreators = [
    { name: 'Lena Vega', genre: 'Horror', followers: 1250 },
    { name: 'Marco Ortiz', genre: 'Documentary', followers: 840 },
    { name: 'Rae Hoshi', genre: 'Sci-Fi', followers: 2150 },
    { name: 'Tomás Wells', genre: 'Comedy', followers: 960 },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Featured Creators</h1>
      <p className="text-neutral-400 mb-10">
        Discover filmmakers building the next generation of stories on CineFusion.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCreators.map((creator, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <h2 className="text-lg font-semibold text-white">{creator.name}</h2>
            <p className="text-sm text-neutral-400 mt-1">{creator.genre}</p>
            <p className="text-sm text-neutral-500 mt-2">
              {creator.followers.toLocaleString()} followers
            </p>
            <button className="mt-4 w-full rounded-md bg-white text-black py-1.5 font-medium hover:bg-white/90 transition">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
