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
          content="t5RQlgmckYO_0hHx39WGzFkd-19067qrxy7eL"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}