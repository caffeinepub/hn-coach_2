import { Navigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Set to true on the profile page so it doesn't redirect back to itself */
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

// Safety timeout: if loading takes longer than this, stop waiting
const LOADING_TIMEOUT_MS = 6000;

export function ProtectedRoute({
  children,
  isProfilePage = false,
}: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isLoading =
      isInitializing ||
      (identity && profileLoading && !profileFetched && !profileError);

    if (isLoading) {
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          setTimedOut(true);
        }, LOADING_TIMEOUT_MS);
      }
    } else {
      setTimedOut(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isInitializing, identity, profileLoading, profileFetched, profileError]);

  const isWaiting =
    !timedOut &&
    (isInitializing ||
      (!!identity && profileLoading && !profileFetched && !profileError));

  if (isWaiting) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#071824" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "#FF6A00" }}
          />
          <p style={{ color: "#A8B6C3" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!identity) {
    return <Navigate to="/login" />;
  }

  // Profile page itself: don't redirect back to /profile — just render
  if (isProfilePage) {
    return <>{children}</>;
  }

  // Other pages: if profile incomplete, send to /profile
  if (
    (profileError || !isProfileComplete(profile)) &&
    currentPath !== "/profile"
  ) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
}
