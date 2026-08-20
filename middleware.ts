import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// const PUBLIC_PREFIXES = ["/login", "/api/auth/", "/api/cron/"];

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//  if (
//   pathname === "/" ||
//   pathname.startsWith("/_next") ||
//   pathname.startsWith("/favicon") ||
//   pathname.startsWith("/logo") ||
//   pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i) ||
//   PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))
// ) {
//     return NextResponse.next();
//   }
const PUBLIC_PREFIXES = ["/login", "/api/auth/", "/api/cron/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStaticAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|map|woff|woff2|ttf)$/i.test(
      pathname
    );

  if (
    pathname === "/" ||
    isStaticAsset ||
    PUBLIC_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p)
    )
  ) {
    return NextResponse.next();
  }



  const session = request.cookies.get("lq_session")?.value;
  if (!session) {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
