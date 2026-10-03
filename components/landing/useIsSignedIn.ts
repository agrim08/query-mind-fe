"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * True only once Clerk has loaded and confirmed a session.
 *
 * Unlike <SignedOut>/<SignedIn> (which render nothing until Clerk loads), this lets
 * the server-rendered HTML always contain the "Start free" CTA — so crawlers, link
 * previews and slow connections see the primary action — and swaps to
 * "Open dashboard" in the browser for signed-in visitors.
 */
export function useIsSignedIn(): boolean {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && Boolean(isSignedIn);
}
