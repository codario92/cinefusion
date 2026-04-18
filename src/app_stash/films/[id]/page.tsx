"use client";

import { useState } from "react";

export default function NewFilmPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <main className="min-h-screen bg-[#0b0b14] text-white p-8">
      <h1 className="text-4xl font-bold mb-6">Submit a New Film</h1>
      <form className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Film Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 rounded bg-[#181826] text-white border border-gray-700"
        />
        <textarea
          placeholder="Film Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-3 rounded bg-[#181826] text-white border border-gray-700 h-32"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded font-semibold"
        >
          Submit Film
        </button>
      </form>
    </main>
  );
}
