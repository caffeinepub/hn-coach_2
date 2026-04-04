import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    status: BookingStatus;
    date: string;
    user: Principal;
    timestamp: bigint;
    timeSlot: string;
}
export interface Message {
    messageType: MessageType;
    message: string;
    timestamp: bigint;
    blobId?: string;
    senderRole: SenderRole;
}
export interface PointRecord {
    timestamp: bigint;
    points: bigint;
    reason: PointReason;
}
export interface UserProfile {
    age: bigint;
    weight: string;
    height: string;
    whatsAppNumber: string;
    name: string;
    email: string;
    targetGoal: string;
    avatarBlobId?: string;
}
export interface StreakInfo {
    currentStreak: bigint;
    nextMilestone: bigint;
    daysToNext: bigint;
}
export enum BookingStatus {
    cancelled = "cancelled",
    booked = "booked"
}
export enum MessageType {
    file = "file",
    text = "text",
    image = "image"
}
export enum PointReason {
    custom = "custom",
    dailyBonus = "dailyBonus",
    footsteps = "footsteps",
    weightImage = "weightImage"
}
export enum SenderRole {
    coach = "coach",
    user = "user"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminCancelBooking(bookingId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointment(date: string, timeSlot: string): Promise<bigint>;
    cancelAllBookingsForUser(user: Principal): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllBookingsByUser(user: Principal): Promise<Array<Booking>>;
    getAllBookingsForDate(date: string): Promise<Array<Booking>>;
    getAllProfiles(): Promise<Array<UserProfile>>;
    getAllUsers(): Promise<Array<Principal>>;
    getAvailableTimeSlots(date: string): Promise<Array<[string, boolean]>>;
    getBookingsByDate(date: string): Promise<Array<Booking>>;
    getCallerPointHistory(): Promise<Array<PointRecord>>;
    getCallerPoints(): Promise<bigint>;
    getCallerStreak(): Promise<StreakInfo>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLastReadTimestamp(user: Principal): Promise<bigint | null>;
    getMessageHistory(): Promise<Array<Message>>;
    getUserBookings(): Promise<Array<Booking>>;
    getUserMessageHistory(user: Principal): Promise<Array<Message>>;
    getUserPoints(user: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    givePoints(user: Principal, points: bigint, reason: PointReason): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markMessagesAsRead(): Promise<void>;
    recordActivity(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessageToCoach(message: string, messageType: MessageType, blobId: string | null): Promise<void>;
    sendMessageToUser(user: Principal, message: string, messageType: MessageType, blobId: string | null): Promise<void>;
}
