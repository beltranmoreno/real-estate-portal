import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Routes that require authentication. Everything else (the public marketing
 * site, /api/inquire, etc.) stays public — no auth check, no Clerk lookup.
 */
const isProtectedRoute = createRouteMatcher([
  '/portal(.*)',
  '/admin(.*)',
  '/api/admin/(.*)',
  '/api/portal/(.*)',
])

/**
 * Public auth-related routes that should bypass the protection check
 * even though they live under /portal.
 */
const isPublicAuthRoute = createRouteMatcher([
  '/portal/sign-in(.*)',
  '/portal/sign-up(.*)',
  '/portal/accept-invite(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req) || isPublicAuthRoute(req)) return
  // Send signed-out visitors to the portal's own sign-in page rather than
  // Clerk's default /sign-in (no NEXT_PUBLIC_CLERK_SIGN_IN_URL is configured).
  await auth.protect({
    unauthenticatedUrl: new URL('/portal/sign-in', req.url).toString(),
  })
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
