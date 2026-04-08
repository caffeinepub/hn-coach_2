import type { Principal } from "@icp-sdk/core/principal";

// ─── Value Enums ─────────────────────────────────────────────────────────────

export const BookingStatus = {
  booked: { booked: null } as { booked: null },
  cancelled: { cancelled: null } as { cancelled: null },
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const MessageType = {
  text: { text: null } as { text: null },
  image: { image: null } as { image: null },
  file: { file: null } as { file: null },
  system: { system: null } as { system: null },
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const PointReason = {
  weightImage: { weightImage: null } as { weightImage: null },
  footsteps: { footsteps: null } as { footsteps: null },
  mealImage: { mealImage: null } as { mealImage: null },
  weeklyMeasurements: { weeklyMeasurements: null } as {
    weeklyMeasurements: null;
  },
  beforeAfterImage: { beforeAfterImage: null } as { beforeAfterImage: null },
  dailyBonus: { dailyBonus: null } as { dailyBonus: null },
  streakBonus: { streakBonus: null } as { streakBonus: null },
  referralBonus: { referralBonus: null } as { referralBonus: null },
  custom: { custom: null } as { custom: null },
} as const;
export type PointReason = (typeof PointReason)[keyof typeof PointReason];

export const SenderRole = {
  user: { user: null } as { user: null },
  coach: { coach: null } as { coach: null },
  system: { system: null } as { system: null },
} as const;
export type SenderRole = (typeof SenderRole)[keyof typeof SenderRole];

// ─── Data Types ──────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email?: string;
  age?: bigint;
  whatsAppNumber?: string;
  weight?: string;
  height?: string;
  targetGoal?: string;
  avatarBlobId?: string;
}

export interface Message {
  id: bigint;
  message: string;
  messageType: MessageType;
  senderRole: SenderRole;
  timestamp: bigint;
  blobId?: string | null;
}

export interface Booking {
  id: bigint;
  user: Principal;
  date: string;
  timeSlot: string;
  status: BookingStatus;
}

export interface PointRecord {
  points: bigint;
  reason: PointReason;
  remark: string;
  timestamp: bigint;
}

// ─── Backend Interface ───────────────────────────────────────────────────────

export interface backendInterface {
  // User profile
  getCallerUserProfile(): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
  getUserProfile(user: Principal): Promise<UserProfile | null>;

  // Messaging
  getMessageHistory(): Promise<Message[]>;
  sendMessageToCoach(
    message: string,
    messageType: MessageType,
    blobId: string | null,
  ): Promise<void>;
  getUserMessageHistory(user: Principal): Promise<Message[]>;
  sendMessageToUser(
    user: Principal,
    message: string,
    messageType: MessageType,
    blobId: string | null,
  ): Promise<void>;

  // Bookings
  getUserBookings(): Promise<Booking[]>;
  getAvailableTimeSlots(date: string): Promise<Array<[string, boolean]>>;
  bookAppointment(date: string, timeSlot: string): Promise<Booking>;
  cancelBooking(bookingId: bigint): Promise<void>;
  getAllBookings(): Promise<Booking[]>;
  adminCancelBooking(bookingId: bigint): Promise<void>;

  // Users
  getAllUsers(): Promise<Principal[]>;

  // Points
  givePoints(
    user: Principal,
    points: bigint,
    reason: PointReason,
    remark: string,
  ): Promise<bigint>;
  getUserPoints(user: Principal): Promise<bigint>;
  getUserPointHistory(user: Principal): Promise<PointRecord[]>;
}
