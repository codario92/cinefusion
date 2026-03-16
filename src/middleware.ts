import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // ✅ Set your real "post-login home" here
  // If you don't have /dashboard, use /account
  const APP_HOME = "/account";

  // ✅ Public routes (not requiring auth)
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  // ✅ Auth pages (for redirecting logged-in users away from them)
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  // ✅ Protected routes (everything else)
  const isProtected = !isPublic;

  // If NOT signed in and trying to access protected pages -> send to /sign-in
  if (!user && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If signed in and visiting sign-in/sign-up -> send to redirect or APP_HOME
  if (user && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = req.nextUrl.searchParams.get("redirect") ?? APP_HOME;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
