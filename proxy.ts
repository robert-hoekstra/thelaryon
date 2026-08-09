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

  return authMiddleware(request)
}

export const config = {
  matcher: [
    "/collection",
    "/collection/:path*",
    "/friends",
    "/friends/:path*",
    "/profile",
    "/profile/:path*",
  ],
}
