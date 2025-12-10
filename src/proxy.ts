import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/'])

/**
 * Next.js 16 Proxy Configuration
 *
 * @description
 * Handles authentication and routing protection using Clerk.
 * In Next.js 16, middleware is configured via proxy.ts instead of middleware.ts
 *
 * Public routes: /sign-in, /sign-up, /
 * Protected routes: All other routes require authentication
 */
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}







