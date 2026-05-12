import { NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const pathname = request.nextUrl.pathname;

  if (
    sessionCookie &&
    (pathname.startsWith("/signin") || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
