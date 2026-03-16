 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const linkCls = (active: boolean) =>
  `px-2 py-1 rounded-md transition-colors ${
    active ? 'text-white' : 'text-white/80 hover:text-white'
  }`;

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed right-6 top-4 z-50 flex items-center gap-4 bg-black/20 backdrop-blur rounded-full px-4 py-2">
      <Link href="/" className={linkCls(pathname === '/')}>Home</Link>
      <Link href="/creators" className={linkCls(pathname.startsWith('/creators'))}>Creators</Link>
      <Link href="/films" className={linkCls(pathname.startsWith('/films'))}>Films</Link>
      <Link href="/submit" className={linkCls(pathname.startsWith('/submit'))}>Submit</Link>
      <div className="h-5 w-px bg-white/30 mx-1" />
      <Link href="/sign-in" className={linkCls(pathname.startsWith('/sign-in'))}>Sign In</Link>
      <Link href="/sign-up" className="px-2 py-1 rounded-md bg-white text-black font-medium hover:bg-white/90">
        Sign Up
      </Link>
    </nav>
  );
}
