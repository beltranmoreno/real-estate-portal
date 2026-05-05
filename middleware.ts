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
  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
