type Props = {
  videoId?: string;
  provider?: "youtube" | "vimeo";
  title?: string;
};

const DEFAULTS = {
  videoId: "Qd0AwgWgKQ0", // fallback promo
  provider: "youtube" as const,
};

export default function PromoEmbed({
  videoId = DEFAULTS.videoId,
  provider = DEFAULTS.provider,
  title = "CineFusion Promo",
}: Props) {
  const src =
    provider === "youtube"
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl shadow">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
