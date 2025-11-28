import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { initializeApp } from "@/lib/init";

// Initialize application on first middleware execution
try {
  initializeApp();
} catch (error) {
  console.error('Failed to initialize application:', error);
}

const isProtectedRoute = createRouteMatcher(["/upload(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  
  // Redirect to sign-in if not authenticated
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Check subscription status for upload page
  if (isProtectedRoute(req) && userId) {
    try {
      // Make internal API call to check subscription status
      const baseUrl = req.nextUrl.origin;
      const statusResponse = await fetch(`${baseUrl}/api/subscription/status`, {
        headers: {
          'Cookie': req.headers.get('cookie') || '',
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        // If user doesn't have access, redirect to pricing
        if (statusData.success && !statusData.data.hasAccess) {
          const pricingUrl = new URL('/pricing', req.url);
          pricingUrl.searchParams.set('reason', 'subscription_required');
          return NextResponse.redirect(pricingUrl);
        }
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      // Allow access on error to prevent blocking users
    }
  }
});

export const config = {
  matcher: [
    // Keep a broad matcher for app routes, and include an explicit
    // `/upload` matcher to make the protection intent obvious.
    "/upload(.*)",
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/"
  ],
};
