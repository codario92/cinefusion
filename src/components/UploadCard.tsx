// src/app/components/UploadCard.tsx
import React from 'react';

export type UploadCardProps = {
  title?: string;
  createdAt?: string;
  createdBy?: string;
  // add more optional props as you flesh out the form
};

const UploadCard: React.FC<UploadCardProps> = ({
  title = 'Untitled Film',
  createdAt = new Date().toISOString(),
  createdBy = 'Anonymous',
}) => {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-white shadow">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-neutral-400">
        Uploaded by {createdBy} on {new Date(createdAt).toLocaleDateString()}
      </p>

      {/* Replace this placeholder with your real upload form */}
      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            placeholder="Project title"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Brief description"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/70"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video file</label>
          <input type="file" className="block w-full text-sm" />
        </div>

        <button
          type="button"
          className="rounded-lg bg-white text-black px-4 py-2 font-medium hover:bg-white/90"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadCard;
