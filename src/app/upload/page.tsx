// src/app/upload/page.tsx
import UploadCard from '../components/UploadCard';

export default function UploadPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Upload a Film</h1>
      <p className="text-neutral-400 mb-10">
        Share your film, trailer, or short project with the CineFusion community.
      </p>

      {/* IMPORTANT: Capital "C" in UploadCard */}
      <UploadCard />
    </main>
  );
}
