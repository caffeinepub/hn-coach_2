import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, Message, PointRecord, UserProfile } from "../backend";
import { PointReason } from "../backend";
import type { MessageType } from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    throwOnError: false,
  });

  return {
    ...query,
    isLoading: actorFetching || (query.isLoading && !query.isFetched),
    isFetched: !!actor && query.isFetched,
    isError: false,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: (_data, profile) => {
      queryClient.setQueryData(["currentUserProfile"], profile);
    },
    onError: (err) => {
      console.error("Save profile error:", err);
    },
  });
}

export function useGetMessageHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ["messageHistory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMessageHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useSendMessageToCoach() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      message,
      messageType,
      blobId,
    }: {
      message: string;
      messageType: MessageType;
      blobId: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendMessageToCoach(message, messageType, blobId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messageHistory"] });
    },
    onError: (err) => {
      console.error("sendMessageToCoach error:", err);
    },
  });
}

export function useGetUserBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ["userBookings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
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
    retry: false,
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

// Admin Hooks

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

export function useGetUserMessageHistoryAdmin(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ["userMessageHistory", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.getUserMessageHistory(user);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useSendMessageToUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      message,
      messageType,
      blobId,
    }: {
      user: Principal;
      message: string;
      messageType: MessageType;
      blobId: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.sendMessageToUser(user, message, messageType, blobId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userMessageHistory", variables.user.toString()],
      });
    },
    onError: (err) => {
      console.error("sendMessageToUser error:", err);
    },
  });
}

export function useGetAllBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
    retry: false,
  });
}

export function useAdminCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.adminCancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
    },
  });
}

// Read Receipt Hooks

export function useMarkMessagesAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      try {
        await (actor as any).markMessagesAsRead();
      } catch {
        // silently ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUnreadCount"] });
    },
  });
}

export function useGetLastReadTimestamp(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint | null>({
    queryKey: ["lastReadTimestamp", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      try {
        const result = await (actor as any).getLastReadTimestamp(user);
        return result.length > 0 ? result[0] : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    refetchInterval: 5000,
    retry: false,
  });
}

// Unread Count Hooks

export function useGetCallerUnreadCount() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["callerUnreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await (actor as any).getCallerUnreadCount();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useGetCoachUnreadCount(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["coachUnreadCount", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      try {
        return await (actor as any).getCoachUnreadCountForUser(user);
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useMarkCoachReadForUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) return;
      try {
        await (actor as any).markCoachReadForUser(user);
      } catch {
        // silently ignore
      }
    },
    onSuccess: (_data, user) => {
      queryClient.refetchQueries({
        queryKey: ["coachUnreadCount", user.toString()],
      });
    },
  });
}

// Points Hooks

export function useGivePoints() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      points,
      reason,
      remark,
    }: {
      user: Principal;
      points: bigint;
      reason: PointReason;
      remark: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.givePoints(user, points, reason, remark);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({
        queryKey: ["userPoints", variables.user.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["userPointHistory", variables.user.toString()],
      });
    },
  });
}

export function useGetUserPoints(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["userPoints", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      try {
        return await (actor as any).getUserPoints(user);
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

export function useGetUserPointHistory(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<PointRecord[]>({
    queryKey: ["userPointHistory", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.getUserPointHistory(user);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    refetchInterval: 10000,
    retry: false,
  });
}

export function useGetCallerPoints() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["callerPoints"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      try {
        return await (actor as any).getCallerPoints();
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
    retry: false,
  });
}

export function useGetCallerPointHistory() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<PointRecord[]>({
    queryKey: ["callerPointHistory"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getCallerPointHistory();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
    retry: false,
  });
}

// Streak Hooks

export function useGetCallerStreak() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<{
    currentStreak: bigint;
    nextMilestone: bigint;
    daysToNext: bigint;
  }>({
    queryKey: ["callerStreak"],
    queryFn: async () => {
      if (!actor)
        return {
          currentStreak: BigInt(0),
          nextMilestone: BigInt(7),
          daysToNext: BigInt(7),
        };
      try {
        return await (actor as any).getCallerStreak();
      } catch {
        return {
          currentStreak: BigInt(0),
          nextMilestone: BigInt(7),
          daysToNext: BigInt(7),
        };
      }
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
    retry: false,
  });
}

export function useRecordActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).recordActivity();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerStreak"] });
    },
  });
}

export { PointReason };
