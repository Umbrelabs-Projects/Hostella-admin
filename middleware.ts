import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
// const PUBLIC_ROUTES = ["/", "/(auth)"];

// Protected routes
const PROTECTED_ROUTES = ["/dashboard", "/chat"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    typeof request.cookies?.get === "function"
      ? request.cookies.get("auth-token")?.value ?? null
      : null;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const base = request.url ?? request.nextUrl.origin ?? "http://localhost";
    return NextResponse.redirect(new URL("/", base));
  }

  // If user is authenticated and tries to access login, redirect to dashboard
  if (pathname === "/" && token) {
    const base = request.url ?? request.nextUrl.origin ?? "http://localhost";
    return NextResponse.redirect(new URL("/dashboard", base));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
