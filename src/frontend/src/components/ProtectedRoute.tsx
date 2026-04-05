import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();

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

  return <>{children}</>;
}
