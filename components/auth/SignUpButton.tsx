"use client";

import { SignUpButton as ClerkSignUpButton } from "@clerk/nextjs";

interface SignUpButtonProps {
  mode?: "modal" | "redirect";
  children?: React.ReactNode;
}

/**
 * Wrapper component for Clerk's SignUpButton
 * Provides consistent styling and behavior
 */
export function SignUpButton({ mode = "redirect", children }: SignUpButtonProps) {
  return (
    <ClerkSignUpButton mode={mode}>
      {children || (
        <button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Sign Up
        </button>
      )}
    </ClerkSignUpButton>
  );
}
