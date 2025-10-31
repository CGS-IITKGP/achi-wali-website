import { NextRequest, NextResponse } from "next/server";
import { validateJWToken } from "./lib/services/core/jwt.core.service";
import { EUserRole } from "./lib/types/domain.types";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("session")?.value || "";

    let isAuthenticated = false;
    let isMember = false;
    let isAdmin = false;

    try {
        const verifyToken = await validateJWToken(token);

        if (verifyToken !== null) {
            isAuthenticated = true;

            if (verifyToken.roles.includes(EUserRole.MEMBER)) {
                isMember = true;
            }

            if (verifyToken.roles.includes(EUserRole.ADMIN)) {
                isAdmin = true;
            }
        }
    } catch (_error) {
        isAuthenticated = false;
    }

    const isAuthPage = pathname.startsWith("/auth");
    const isDashboardPage = pathname.startsWith("/dashboard");
    const isAdminPage = pathname.startsWith("/admin");

    if (!isAuthenticated && (isDashboardPage || isAdminPage)) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    if (isAuthenticated && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if ((!isMember && (isDashboardPage || isAdminPage)) ||
        (!isAdmin && isAdminPage)
    ) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/auth/:path*",
        "/admin/:path*"
    ],
};
