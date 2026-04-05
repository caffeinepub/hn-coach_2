/**
 * Admin-specific query hooks that accept an actor directly.
 * These bypass useInternetIdentity so the admin panel works without login.
 */
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, Message, PointRecord, UserProfile } from "../backend";
import { MessageType, PointReason } from "../backend";
import type { backendInterface } from "../backend";

export function useAdminGetAllUsers(actor: backendInterface | null) {
  return useQuery<Principal[]>({
    queryKey: ["admin_allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor,
    retry: false,
  });
}

export function useAdminGetUserProfile(
  actor: backendInterface | null,
  principal: Principal | null,
) {
  return useQuery<UserProfile | null>({
    queryKey: ["admin_userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !!principal,
    retry: false,
  });
}

export function useAdminGetUserMessageHistory(
  actor: backendInterface | null,
  user: Principal | null,
) {
  return useQuery<Message[]>({
    queryKey: ["admin_userMessageHistory", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.getUserMessageHistory(user);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !!user,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useAdminSendMessageToUser(actor: backendInterface | null) {
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
        queryKey: ["admin_userMessageHistory", variables.user.toString()],
      });
    },
  });
}

export function useAdminGetAllBookings(actor: backendInterface | null) {
  return useQuery<Booking[]>({
    queryKey: ["admin_allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBookings();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    refetchInterval: 30000,
    retry: false,
  });
}

export function useAdminCancelBookingMutation(actor: backendInterface | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.adminCancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_allBookings"] });
    },
  });
}

export function useAdminGetLastReadTimestamp(
  actor: backendInterface | null,
  user: Principal | null,
) {
  return useQuery<bigint | null>({
    queryKey: ["admin_lastReadTimestamp", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      try {
        const result = await (actor as any).getLastReadTimestamp(user);
        return result.length > 0 ? result[0] : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !!user,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useAdminGetCoachUnreadCount(
  actor: backendInterface | null,
  user: Principal | null,
) {
  return useQuery<bigint>({
    queryKey: ["admin_coachUnreadCount", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      try {
        return await (actor as any).getCoachUnreadCountForUser(user);
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !!user,
    refetchInterval: 5000,
    retry: false,
  });
}

export function useAdminMarkCoachReadForUser(actor: backendInterface | null) {
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
        queryKey: ["admin_coachUnreadCount", user.toString()],
      });
    },
  });
}

export function useAdminGetUserPoints(
  actor: backendInterface | null,
  user: Principal | null,
) {
  return useQuery<bigint>({
    queryKey: ["admin_userPoints", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      try {
        return await (actor as any).getUserPoints(user);
      } catch {
        return BigInt(0);
      }
    },
    enabled: !!actor && !!user,
    retry: false,
  });
}

export function useAdminGetUserPointHistory(
  actor: backendInterface | null,
  user: Principal | null,
) {
  return useQuery<PointRecord[]>({
    queryKey: ["admin_userPointHistory", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        return await actor.getUserPointHistory(user);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !!user,
    refetchInterval: 10000,
    retry: false,
  });
}

export function useAdminGivePoints(actor: backendInterface | null) {
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
        queryKey: ["admin_userPoints", variables.user.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin_userPointHistory", variables.user.toString()],
      });
    },
  });
}

export { MessageType, PointReason };
