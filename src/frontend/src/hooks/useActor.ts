// Local wrapper around the library's useActor, pre-baked with the backend's createActor
import { useActor as useActorLib } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../types";

export function useActor() {
  return useActorLib<backendInterface>(
    createActor as unknown as Parameters<
      typeof useActorLib<backendInterface>
    >[0],
  );
}
