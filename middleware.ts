import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // ✅ Always allow auth callbacks & webhooks
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/stripe/webhook")
  ) {
    return response;
  }

  // ✅ Public routes
  if (
    pathname === "/" ||
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/pricing"
  ) {
    return response;
  }

  // 🔒 Auth gate
  if (!session) {
    const loginUrl = new URL("/sign-in", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🧱 Subscription gate (ONLY where needed)
  if (pathname.startsWith("/keywords")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.subscription_status !== "active") {
      return NextResponse.redirect(new URL("/upgrade", req.url));
    }
  }

  return response;
}
