import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/admin", "/dashboard", "/email", "/onboarding"];

function matches(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    getSessionCookie(request, {
      cookiePrefix: "TryNotiflyDashboard",
    }),
  );
  const decision = {
    pathname,
    hasSessionCookie,
    matchedProtectedRoute: matches(pathname, protectedRoutes),
    redirectTo: null as string | null,
  };

  if (matches(pathname, protectedRoutes) && !hasSessionCookie) {
    decision.redirectTo = "/signIn";
    console.info("auth.proxy.decision", decision);
    return NextResponse.redirect(new URL("/signIn", request.url));
  }

  console.info("auth.proxy.decision", decision);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/email/:path*",
    "/onboarding",
    "/onboarding/:path*",
  ],
};
