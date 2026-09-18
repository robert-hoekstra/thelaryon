import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth/server"

const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
})

export default function proxy(request: NextRequest) {
  // Server Actions POST to the current page URL. Let them through so
  // collection mutations are not redirected by the auth middleware.
  if (request.headers.has("next-action")) {
    return NextResponse.next()
  }

  // API routes handle auth themselves and should return JSON 401s,
  // not HTML redirects to the sign-in page.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  return authMiddleware(request)
}

export const config = {
  matcher: [
    "/collection",
    "/collection/:path*",
    "/binders",
    "/binders/:path*",
    "/friends",
    "/friends/:path*",
    "/profile",
    "/profile/:path*",
    "/cards",
    "/cards/:path*",
    "/sets",
    "/sets/:path*",
    "/search",
    "/search/:path*",
  ],
}
