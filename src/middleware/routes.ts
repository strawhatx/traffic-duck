import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/sign-in(.*)/,
  /^\/sign-up(.*)/,
  /^\/auth\/callback(.*)/,
  // Public assets
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  // Webhooks (no auth)
  /^\/api\/stripe\/webhook$/,
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTE_PATTERNS.some((re) => re.test(pathname));
}

function shouldNoIndex(pathname: string): boolean {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, search } = req.nextUrl;
  const isPublic = isPublicRoute(pathname);

  if (!isPublic && !session) {
    const redirectUrl = new URL("/sign-in", req.url);
    if (pathname) {
      redirectUrl.searchParams.set(
        "redirect_to",
        `${pathname}${search ?? ""}`
      );
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (shouldNoIndex(pathname)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};


