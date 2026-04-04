import { Navigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

interface ProtectedRouteProps {
  children: ReactNode;
}

function isProfileComplete(
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

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (isInitializing || (identity && profileLoading)) {
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

  if (!identity) {
    return <Navigate to="/login" />;
  }

  // If profile is not complete and the user is not already on /profile, redirect them
  if (!isProfileComplete(profile) && currentPath !== "/profile") {
    return <Navigate to="/profile" />;
  }

  return <>{children}</>;
}

export { isProfileComplete };
