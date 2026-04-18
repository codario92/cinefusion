import "./globals.css";

export const metadata = {
  title: "CineFusion",
  description: "Create without permission.",
  verification: {
    google: "t5RQlgmckYO_0hHx39WGzFkd-19067qrxy7eL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070712] text-white">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}