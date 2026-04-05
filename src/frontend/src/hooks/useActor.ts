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
  const principalStr = identity?.getPrincipal().toString() ?? "anonymous";
  const prevPrincipalRef = useRef<string>("anonymous");

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, principalStr],
    queryFn: async () => {
      if (!identity || identity.getPrincipal().isAnonymous()) {
        // Anonymous actor
        return await createActorWithConfig();
      }

      const actor = await createActorWithConfig({
        agentOptions: { identity },
      });

      try {
        const adminToken = getSecretParameter("caffeineAdminToken") || "";
        await actor._initializeAccessControlWithSecret(adminToken);
      } catch {
        // Non-fatal: access control init failure doesn't break the actor
      }

      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
    throwOnError: false,
  });

  // Only invalidate dependent queries when the principal actually changes
  useEffect(() => {
    if (actorQuery.data && principalStr !== prevPrincipalRef.current) {
      prevPrincipalRef.current = principalStr;
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, principalStr, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
