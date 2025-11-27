"use client";

import { SignInButton as ClerkSignInButton } from "@clerk/nextjs";

interface SignInButtonProps {
  mode?: "modal" | "redirect";
  children?: React.ReactNode;
}

/**
 * Wrapper component for Clerk's SignInButton
 * Provides consistent styling and behavior
 */
export function SignInButton({ mode = "redirect", children }: SignInButtonProps) {
  return (
    <ClerkSignInButton mode={mode}>
      {children || (
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Sign In
        </button>
      )}
    </ClerkSignInButton>
  );
}
