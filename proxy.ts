import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  hasValidInternalAccessCookieValue,
  INTERNAL_ACCESS_COOKIE_NAME,
} from "@/lib/auth/internal-access";
import { isInternalAccessConfigured } from "@/lib/env";

function getSupabaseEdgeEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export async function proxy(request: NextRequest) {
  const isInternalRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/preview") ||
    request.nextUrl.pathname === "/auth/login" ||
    request.nextUrl.pathname === "/auth/setup-required" ||
    request.nextUrl.pathname.startsWith("/app");

  if (isInternalRoute && isInternalAccessConfigured()) {
    const accessCookie = request.cookies.get(INTERNAL_ACCESS_COOKIE_NAME)?.value;

    if (!(await hasValidInternalAccessCookieValue(accessCookie))) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/access";
      redirectUrl.search = "";
      redirectUrl.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  const env = getSupabaseEdgeEnv();

  if (!env) {
    return NextResponse.next({
      request,
    });
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedAppRoute = request.nextUrl.pathname.startsWith("/app");
  const isLoginRoute = request.nextUrl.pathname === "/auth/login";

  if (isProtectedAppRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/", "/preview/:path*", "/app/:path*", "/auth/login", "/auth/setup-required"],
};
