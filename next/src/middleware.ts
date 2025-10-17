import { NextRequest, NextResponse } from "next/server";
import { validateJWToken } from "./lib/services/core/jwt.core.service";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value || "";
  let isAuthenticated = false;

  try {
    const verifyToken = await validateJWToken(token);

    if (verifyToken !== null) {
      isAuthenticated = true;
    } else {
      isAuthenticated = false;
    }
  } catch (_error) {
    isAuthenticated = false;
  }

  const isAuthPage = pathname.startsWith("/auth");

  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
