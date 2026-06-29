import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes that don't require authentication
const publicRoutes = ["/", "/login"];

// Routes that require specific roles
const adminRoutes = ["/admin"];
const authorityRoutes = ["/authority"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // API routes and static files are ignored by matcher below, but just in case
  if (path.startsWith("/api") || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);
  const token = request.cookies.get("civora_session")?.value;

  let session = null;
  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const key = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, key);
        session = payload as any;
      }
    } catch (error) {
      // Invalid token
      session = null;
    }
  }

  // 1. Unauthenticated users trying to access protected routes -> /login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated users trying to access /login -> redirect to their dashboard
  if (session && path === "/login") {
    const roleParam = request.nextUrl.searchParams.get("role");
    
    // If they explicitly requested a different role, let them hit the login page to process the role switch
    if (roleParam && ["citizen", "authority"].includes(roleParam) && session.role !== roleParam) {
      return NextResponse.next();
    }

    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session.role === "authority") {
      return NextResponse.redirect(new URL("/authority/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
  }

  // 3. Role-based protection for /admin
  if (adminRoutes.some(route => path.startsWith(route))) {
    if (session?.role !== "admin") {
      return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
    }
  }

  // 4. Role-based protection for /authority
  if (authorityRoutes.some(route => path.startsWith(route))) {
    if (session?.role !== "authority" && session?.role !== "admin") {
      return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
