// Files: src/proxy.ts
import {type NextRequest, NextResponse} from "next/server";

// 1. Rute publik yang boleh diakses siswa & sistem tanpa token pengawas
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/violations/record",
  "/api/exam/session",
  "/exam",
];

const isProduction = process.env.NODE_ENV === "production";

export default async function proxy(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 1. Bypass aset internal dan statis
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Generate Nonce Kriptografis Unik untuk setiap request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 3. Susun script-src:
  // - Development: Memerlukan 'unsafe-eval' demi Fast Refresh, React DevTools, dan Source Maps
  // - Production: Tetap Strict CSP tanpa 'unsafe-eval'
  const scriptDirectives = isProduction
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`;

  // Susun CSP: Menambahkan frame-src untuk Moodle dan camera untuk anti-menyontek
  const cspHeader = `
        default-src 'self';
        script-src ${scriptDirectives};
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob: https:;
        font-src 'self' data:;
        connect-src 'self' https: wss:;
        frame-src 'self' https:;
        frame-ancestors 'self';
        base-uri 'self';
        form-action 'self';
    `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Helper untuk menyematkan seluruh security header Next.js
  const applySecurityHeaders = (res: NextResponse): NextResponse => {
    res.headers.set("Content-Security-Policy", cspHeader);
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    // Mengizinkan fitur kamera untuk deteksi wajah & anti-menyontek siswa
    res.headers.set(
      "Permissions-Policy",
      "camera=(self), microphone=(), geolocation=(), display-capture=(self)",
    );
    return res;
  };

  // 4. Siapkan request headers turunan
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set("x-nonce", nonce);
  forwardHeaders.set("Content-Security-Policy", cspHeader);

  // 5. Izinkan rute publik (tetap menyertakan CSP, Nonce, COOP, dan Permissions-Policy)
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    const res = NextResponse.next({
      request: { headers: forwardHeaders },
    });
    return applySecurityHeaders(res);
  }

  // 6. Ekstraksi token dari Cookies (prioritas) atau Header Authorization
  const cookieToken = request.cookies.get("proctor_access_token")?.value;
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : null;

  const resolvedToken =
    cookieToken ||
    (bearerToken && bearerToken !== "null" && bearerToken !== "undefined"
      ? bearerToken
      : null);

  // 7. Tangani jika token tidak tersedia (Unauthorized Boundary)
  if (!resolvedToken) {
    if (pathname.startsWith("/api/")) {
      const res = NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized: Sesi pengawas tidak ditemukan atau telah kedaluwarsa.",
        },
        { status: 401 },
      );
      return applySecurityHeaders(res);
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(res);
  }

  // 8. Meneruskan token valid ke downstream request headers
  forwardHeaders.set("x-proctor-token", resolvedToken);

  const response = NextResponse.next({
    request: {
      headers: forwardHeaders,
    },
  });

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Intersepsi seluruh rute kecuali static files internal Next.js
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
