import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, Message, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetMessageHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ["messageHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessageHistory();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useSendMessageToCoach() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendMessageToCoach(message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messageHistory"] });
    },
  });
}

export function useGetUserBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ["userBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBookings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAvailableTimeSlots(date: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, boolean]>>({
    queryKey: ["availableTimeSlots", date],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getAvailableTimeSlots(date);
    },
    enabled: !!actor && !actorFetching && !!date,
  });
}

export function useBookAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      timeSlot,
    }: { date: string; timeSlot: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.bookAppointment(date, timeSlot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      queryClient.invalidateQueries({ queryKey: ["availableTimeSlots"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      queryClient.invalidateQueries({ queryKey: ["availableTimeSlots"] });
    },
  });
}
