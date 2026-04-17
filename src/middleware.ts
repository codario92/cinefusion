import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public files and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/landing/") ||
    pathname.startsWith("/brand/") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/api/waitlist")
  ) {
    return NextResponse.next();
  }

  // Keep everything else open for now unless you want auth protection
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};