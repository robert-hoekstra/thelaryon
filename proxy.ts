import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth/server"

const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
})

function withNoIndex(response: Response) {
  const nextResponse =
    response instanceof NextResponse
      ? response
      : new NextResponse(response.body, response)

  nextResponse.headers.set("X-Robots-Tag", "noindex, nofollow")
  return nextResponse
}

export default async function proxy(request: NextRequest) {
  // Server Actions POST to the current page URL. Let them through so
  // collection mutations are not redirected by the auth middleware.
  if (request.headers.has("next-action")) {
    return NextResponse.next()
  }

  // API routes handle auth themselves and should return JSON 401s,
  // not HTML redirects to the sign-in page.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return withNoIndex(NextResponse.next())
  }

  return withNoIndex(await authMiddleware(request))
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
    "/api/cards/:path*",
    "/api/collection",
    "/api/collection/:path*",
    "/api/decks/:path*",
  ],
}
