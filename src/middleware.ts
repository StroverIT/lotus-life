import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = (req as NextRequest).nextUrl.pathname;

      // Require any authenticated user (including guest) for /my-account
      if (pathname.startsWith("/my-account")) {
        return !!token;
      }

      // Require ADMIN role for /admin
      if (pathname.startsWith("/admin")) {
        return !!token && (token as any).role === "ADMIN";
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/my-account/:path*"],
};

