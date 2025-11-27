import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
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
