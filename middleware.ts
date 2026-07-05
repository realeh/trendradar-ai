import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/ai-discovery", "/trending", "/new-store", "/hidden-gems", "/simulator", "/account"];

export function middleware(request: NextRequest) {
  const authRequired = process.env.REQUIRE_AUTH === "true";
  if (!authRequired) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!isProtected) return NextResponse.next();

  const hasSupabaseSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

  if (hasSupabaseSession) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)"]
};
