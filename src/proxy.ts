//Files: src/proxy.ts
import {type NextRequest, NextResponse} from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/violations/record"];

export default async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;

    // 1. Bypass aset statis, favicon, dan rute publik
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico") ||
        PUBLIC_PATHS.some((path) => pathname.startsWith(path))
    ) {
        return NextResponse.next();
    }

    // 2. Ekstraksi token dari Cookies (prioritas) atau Header Authorization
    const cookieToken = request.cookies.get("proctor_access_token")?.value;
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

    const resolvedToken =
        cookieToken ||
        (bearerToken && bearerToken !== "null" && bearerToken !== "undefined"
            ? bearerToken
            : null);

    // 3. Tangani jika token tidak tersedia (Unauthorized Boundary)
    if (!resolvedToken) {
        // Jika request menuju endpoint API, balas dengan format JSON standar
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized: Sesi pengawas tidak ditemukan atau telah kedaluwarsa.",
                },
                { status: 401 }
            );
        }

        // Jika navigasi halaman protected, redirect langsung ke /login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Meneruskan token valid ke downstream request headers
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("x-proctor-token", resolvedToken);

    return NextResponse.next({
        request: {
            headers: forwardHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Intersepsi seluruh rute kecuali static files internal Next.js
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};