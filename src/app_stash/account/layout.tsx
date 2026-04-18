// src/app/account/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account — CineFusion',
  description: 'Manage your profile, projects, uploads, and settings.',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep this ultra simple; just render children
  return <>{children}</>;
}
