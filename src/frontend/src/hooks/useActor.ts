import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  // Track the previous actor data reference to avoid triggering invalidation on every render
  const prevActorRef = useRef<backendInterface | null>(null);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      try {
        await actor._initializeAccessControlWithSecret(adminToken);
      } catch {
        // Non-fatal: ignore access control errors
      }
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
    retry: false,
  });

  // Only invalidate dependent queries when the actor instance actually changes
  useEffect(() => {
    const currentActor = actorQuery.data ?? null;
    if (currentActor && currentActor !== prevActorRef.current) {
      prevActorRef.current = currentActor;
      // Use invalidateQueries only (no refetchQueries) to avoid double-fetching
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
