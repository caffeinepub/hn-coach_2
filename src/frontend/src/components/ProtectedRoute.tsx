import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function isProfileComplete(
  profile: { name?: string } | null | undefined,
): boolean {
  if (!profile) return false;
  return !!profile.name?.trim();
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Safety timeout: if still initializing after 5s, stop blocking
  const [initTimedOut, setInitTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInitializing && !initTimedOut) {
      timerRef.current = setTimeout(() => setInitTimedOut(true), 5000);
    } else if (!isInitializing && timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isInitializing, initTimedOut]);

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  // Wait for auth init
  if (isInitializing && !initTimedOut) return null;

  // Not logged in → go home (home page handles login prompts)
  if (isAnonymous) {
    return <Navigate to="/" />;
  }

  // Wait for profile to load before deciding
  if (profileLoading && !profileFetched) return null;

  // Profile loaded but name not set → go home (home page shows name modal)
  if (profileFetched && !isProfileComplete(profile)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
