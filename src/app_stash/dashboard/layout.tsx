export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 p-4">
        <h1 className="text-xl font-semibold">CineFusion</h1>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
