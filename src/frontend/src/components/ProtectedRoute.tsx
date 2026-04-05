import { Navigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface ProtectedRouteProps {
  children: ReactNode;
  isProfilePage?: boolean;
}

export function isProfileComplete(
  profile:
    | {
        name?: string;
        age?: bigint | number;
        whatsAppNumber?: string;
        email?: string;
        weight?: string;
        height?: string;
        targetGoal?: string;
        avatarBlobId?: string;
      }
    | null
    | undefined,
): boolean {
  if (!profile) return false;
  return (
    !!profile.name?.trim() &&
    !!profile.age &&
    Number(profile.age) > 0 &&
    !!profile.whatsAppNumber?.trim() &&
    !!profile.email?.trim() &&
    !!profile.weight?.trim() &&
    !!profile.height?.trim() &&
    !!profile.targetGoal?.trim() &&
    !!profile.avatarBlobId?.trim()
  );
}

export function ProtectedRoute({
  children,
  isProfilePage = false,
}: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Safety timeout: if we're still initializing after 6s, stop blocking
  const [initTimedOut, setInitTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInitializing && !initTimedOut) {
      timerRef.current = setTimeout(() => setInitTimedOut(true), 6000);
    } else if (!isInitializing && timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isInitializing, initTimedOut]);

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  // Block render while auth is initializing (with timeout fallback)
  if (isInitializing && !initTimedOut) {
    return null;
  }

  // Not logged in → go to login
  if (isAnonymous) {
    return <Navigate to="/login" />;
  }

  // Profile page: never redirect back to itself
  if (isProfilePage) {
    return <>{children}</>;
  }

  // While profile is still loading for the first time, block rendering chat/book
  if (profileLoading && !profileFetched) {
    return null;
  }

  // Profile fetch done and incomplete → send to profile
  if (
    profileFetched &&
    !isProfileComplete(profile) &&
    currentPath !== "/profile"
  ) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
}
