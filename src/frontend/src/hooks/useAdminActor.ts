import { useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

/**
 * Creates an anonymous actor for the admin panel.
 * Does NOT depend on useInternetIdentity, so it works regardless of login state.
 * All admin backend functions are public and work with anonymous actors.
 */
export function useAdminActor() {
  const [actor, setActor] = useState<backendInterface | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    createActorWithConfig()
      .then((a) => setActor(a))
      .catch((err) => console.error("Failed to create admin actor:", err));
  }, []);

  return { actor, isReady: !!actor };
}
