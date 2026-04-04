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
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  // Stable identity key so actor is only recreated when the principal changes
  const principalKey = identity?.getPrincipal().toString() ?? "anonymous";

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, principalKey],
    queryFn: async () => {
      if (!identity) {
        return await createActorWithConfig();
      }
      const actor = await createActorWithConfig({
        agentOptions: { identity },
      });
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  // When the actor changes, invalidate all non-actor queries once
  const prevActorRef = useRef<backendInterface | undefined>(undefined);
  useEffect(() => {
    const actor = actorQuery.data;
    if (actor && actor !== prevActorRef.current) {
      prevActorRef.current = actor;
      queryClientRef.current.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data]);

  return {
    actor: actorQuery.data ?? null,
    isFetching: actorQuery.isFetching,
  };
}
