"use client";

import { useState } from "react";

export default function NewCanonVersionForm({
  canonId,
}: {
  canonId: string;
}) {
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    formData.append("canon_entity_id", canonId);

    try {
      const res = await fetch("/api/canon/versions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to save version");
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save version");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="space-y-6 rounded-2xl border border-white/10 bg-white p-6 shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold text-black">New Canon Version</h3>
        <p className="mt-1 text-sm text-gray-600">
          Upload a character portrait and describe this version.
        </p>
      </div>

      {/* IMAGE UPLOAD */}
      <div>
        <label className="mb-2 block text-sm font-medium text-black">
          Character Image
        </label>

        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-black">
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full cursor-pointer text-sm text-black file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
          />

          <p className="mt-3 text-sm text-gray-600">
            Upload or drag character portrait
          </p>
        </div>

        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="preview"
              className="w-40 rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* NOTES */}
      <div>
        <label className="mb-2 block text-sm font-medium text-black">
          Notes
        </label>

        <textarea
          name="notes"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-black focus:outline-none"
          rows={4}
          placeholder="Describe this version..."
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Version"}
      </button>
    </form>
  );
}
