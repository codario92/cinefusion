import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="t5RQlgmckYO_OhHx39WGzfkd-19067qrxy7eLbLcQro" />
        /
      </head>
      <body>{children}</body>
    </html>
  );
}