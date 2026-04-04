import { Navigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
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
const LOADING_TIMEOUT_MS = 10000;

export function ProtectedRoute({
  children,
  isProfilePage = false,
}: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // We are still loading if:
  // 1. Identity is initializing
  // 2. Actor is being fetched
  // 3. Profile query hasn't fetched yet (and we have an identity)
  const stillLoading =
    isInitializing ||
    actorFetching ||
    (!!identity && profileLoading && !profileFetched);

  useEffect(() => {
    if (stillLoading) {
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
  }, [stillLoading]);

  const isWaiting = !timedOut && stillLoading;

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

  // Other pages: only redirect to /profile once we've confirmed the profile
  // is actually incomplete (i.e., fetch is complete and profile is null/incomplete)
  if (
    profileFetched &&
    !isProfileComplete(profile) &&
    currentPath !== "/profile"
  ) {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
}
