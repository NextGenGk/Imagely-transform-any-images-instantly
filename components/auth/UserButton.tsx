"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";

/**
 * Wrapper component for Clerk's UserButton
 * Provides consistent styling and behavior across the app
 */
export function UserButton() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/sign-in"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
        },
      }}
    />
  );
}
