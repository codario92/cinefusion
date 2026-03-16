// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "CineFusion",
  description: "Create without permission.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070712] text-white">
        {/* Global background wrapper */}
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
