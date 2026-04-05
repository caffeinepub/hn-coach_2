import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { format } from "date-fns";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  Dumbbell,
  FileText,
  History,
  Loader2,
  Lock,
  MessageSquare,
  Paperclip,
  Send,
  Star,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookingStatus,
  MessageType,
  PointReason,
  SenderRole,
} from "../backend";
import type { Booking, Message } from "../backend";
import type { PointRecord } from "../backend";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import {
  useAdminCancelBooking,
  useGetAllBookings,
  useGetAllUsers,
  useGetCoachUnreadCount,
  useGetLastReadTimestamp,
  useGetUserMessageHistoryAdmin,
  useGetUserPointHistory,
  useGetUserPoints,
  useGetUserProfile,
  useGivePoints,
  useMarkCoachReadForUser,
  useSendMessageToUser,
} from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";
import { showPushNotification } from "../utils/notifications";

const ADMIN_PASSWORD = "hncoach2024";
const ADMIN_AUTH_KEY = "hncoach_admin_auth";

function AdminFileMessage({
  blobId,
  storageClient,
  filename,
}: { blobId: string; storageClient: StorageClient | null; filename?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storageClient || !blobId) return;
    storageClient
      .getDirectURL(blobId)
      .then((u) => setUrl(u))
      .catch(() => {});
  }, [blobId, storageClient]);

  if (!url)
    return (
      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#FF6A00" }} />
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
      style={{ background: "rgba(255,106,0,0.15)", color: "#FF6A00" }}
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm truncate max-w-[200px]">
        {filename || "Download file"}
      </span>
    </a>
  );
}

function AdminImageMessage({
  blobId,
  storageClient,
}: { blobId: string; storageClient: StorageClient | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storageClient || !blobId) return;
    storageClient
      .getDirectURL(blobId)
      .then((u) => setUrl(u))
      .catch(() => {});
  }, [blobId, storageClient]);

  if (!url)
    return (
      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#FF6A00" }} />
    );

  return (
    <img
      src={url}
      alt="Shared file"
      className="rounded-lg max-w-full max-h-48 object-cover"
      style={{ border: "1px solid #203B4D" }}
    />
  );
}

function MessageTicks({
  msgTimestamp,
  lastReadTimestamp,
}: {
  msgTimestamp: bigint;
  lastReadTimestamp: bigint | null | undefined;
}) {
  if (lastReadTimestamp === null || lastReadTimestamp === undefined) {
    return (
      <Check
        className="w-3.5 h-3.5 inline-block"
        style={{ color: "#A8B6C3" }}
        aria-label="Sent"
      />
    );
  }
  if (msgTimestamp <= lastReadTimestamp) {
    return (
      <CheckCheck
        className="w-3.5 h-3.5 inline-block"
        style={{ color: "#4ade80" }}
        aria-label="Seen"
      />
    );
  }
  return (
    <CheckCheck
      className="w-3.5 h-3.5 inline-block"
      style={{ color: "#A8B6C3" }}
      aria-label="Delivered"
    />
  );
}

function UserListItem({
  principal,
  isSelected,
  onClick,
}: {
  principal: Principal;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { data: profile } = useGetUserProfile(principal);
  const { data: unreadCount } = useGetCoachUnreadCount(principal);
  const shortId = `${principal.toString().slice(0, 12)}...`;
  const displayName = profile?.name || `User: ${shortId}`;
  const hasUnread = unreadCount !== undefined && unreadCount > BigInt(0);
  const unreadNum = hasUnread ? Number(unreadCount) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group"
      style={{
        background: isSelected ? "rgba(255,106,0,0.15)" : "transparent",
        border: isSelected
          ? "1px solid rgba(255,106,0,0.4)"
          : "1px solid transparent",
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white"
        style={{ background: isSelected ? "#FF6A00" : "#1A3A4F" }}
      >
        {(profile?.name?.[0] || "U").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{displayName}</p>
        {profile?.name && (
          <p className="text-xs truncate" style={{ color: "#A8B6C3" }}>
            {shortId}
          </p>
        )}
      </div>
      {/* Unread badge */}
      {hasUnread && (
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: "#ef4444" }}
          data-ocid="admin.user.unread_badge"
        >
          {unreadNum > 99 ? "99+" : unreadNum}
        </span>
      )}
    </button>
  );
}

function getAdminCategoryLabel(reason: PointReason): string {
  switch (reason) {
    case PointReason.weightImage:
      return "Weight Image";
    case PointReason.footsteps:
      return "Footsteps";
    case PointReason.dailyBonus:
      return "Daily Bonus";
    case PointReason.custom:
      return "Custom";
    default:
      return "Points";
  }
}

function PointsBar({ selectedUser }: { selectedUser: Principal }) {
  const { data: totalPoints, isLoading: pointsLoading } =
    useGetUserPoints(selectedUser);
  const { data: pointHistory, isLoading: historyLoading } =
    useGetUserPointHistory(selectedUser);
  const givePoints = useGivePoints();
  const sendToUser = useSendMessageToUser();
  const [customPoints, setCustomPoints] = useState("");
  const [remark, setRemark] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const total = Number(totalPoints ?? BigInt(0));

  const handleCustomGive = async () => {
    const pts = Number.parseInt(customPoints, 10);
    if (!pts || pts < 1) return;
    const remarkText = remark.trim() || "Points awarded";
    try {
      const newTotal = await givePoints.mutateAsync({
        user: selectedUser,
        points: BigInt(pts),
        reason: PointReason.custom,
        remark: remarkText,
      });
      // Send notification bubble in chat
      const notificationMsg = `🏆 You earned ${pts} pts — Custom: ${remarkText}`;
      await sendToUser.mutateAsync({
        user: selectedUser,
        message: notificationMsg,
        messageType: MessageType.text,
        blobId: null,
      });
      toast.success(`Points awarded! New total: ${Number(newTotal)} pts`);
      setCustomPoints("");
      setRemark("");
    } catch {
      toast.error("Failed to give points");
    }
  };

  const isGiving = givePoints.isPending || sendToUser.isPending;

  const sortedHistory = pointHistory
    ? [...pointHistory].sort(
        (a, b) => Number(b.timestamp) - Number(a.timestamp),
      )
    : [];

  return (
    <div
      className="border-b"
      style={{
        background: "rgba(255,106,0,0.04)",
        borderColor: "rgba(255,106,0,0.2)",
      }}
      data-ocid="admin.points.panel"
    >
      {/* Top row: total + give points form */}
      <div className="px-3 py-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
        {/* Total display */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
          style={{
            background: "rgba(255,106,0,0.12)",
            border: "1px solid rgba(255,106,0,0.3)",
          }}
        >
          <Star className="w-3.5 h-3.5" style={{ color: "#FF6A00" }} />
          {pointsLoading ? (
            <Loader2
              className="w-3 h-3 animate-spin"
              style={{ color: "#FF6A00" }}
            />
          ) : (
            <span className="text-xs font-bold" style={{ color: "#FF6A00" }}>
              {total} pts
            </span>
          )}
        </div>

        {/* History toggle */}
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:opacity-80"
          style={{
            background: showHistory
              ? "rgba(255,106,0,0.12)"
              : "rgba(255,255,255,0.05)",
            border: showHistory
              ? "1px solid rgba(255,106,0,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
            color: showHistory ? "#FF6A00" : "#A8B6C3",
          }}
          data-ocid="admin.points.toggle"
        >
          <History className="w-3 h-3" />
          History
        </button>

        {/* Custom points input + remark */}
        <div className="flex flex-col gap-1.5 w-full sm:flex-row sm:flex-wrap sm:items-center sm:w-auto sm:ml-auto">
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Remark / Activity"
            className="w-full sm:flex-1 sm:min-w-0 h-9 sm:h-7 px-2 rounded-lg text-xs text-white outline-none border"
            style={{
              background: "#1A3A4F",
              borderColor: "rgba(255,106,0,0.25)",
              color: "white",
            }}
            data-ocid="admin.points.remark_input"
          />
          <input
            type="number"
            min={1}
            value={customPoints}
            onChange={(e) => setCustomPoints(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomGive()}
            placeholder="pts"
            className="w-full sm:w-14 h-9 sm:h-7 px-2 rounded-lg text-xs text-white outline-none border text-center"
            style={{
              background: "#1A3A4F",
              borderColor: "rgba(255,106,0,0.3)",
              color: "white",
            }}
            data-ocid="admin.points.input"
          />
          <button
            type="button"
            onClick={handleCustomGive}
            disabled={isGiving || !customPoints || Number(customPoints) < 1}
            className="w-full sm:w-auto h-9 sm:h-7 px-3 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40 min-h-[44px] sm:min-h-0"
            style={{ background: "#FF6A00" }}
            data-ocid="admin.points.submit_button"
          >
            {isGiving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Give"}
          </button>
        </div>
      </div>

      {/* Points History collapsible */}
      {showHistory && (
        <div
          className="px-3 pb-2"
          style={{ borderTop: "1px solid rgba(255,106,0,0.1)" }}
        >
          <div className="flex items-center gap-1.5 py-1.5">
            <History className="w-3 h-3" style={{ color: "#A8B6C3" }} />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#A8B6C3" }}
            >
              Points History
            </span>
          </div>
          {historyLoading ? (
            <div
              className="flex justify-center py-3"
              data-ocid="admin.points_history.loading_state"
            >
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "#FF6A00" }}
              />
            </div>
          ) : sortedHistory.length === 0 ? (
            <p
              className="text-xs py-2"
              style={{ color: "#A8B6C3" }}
              data-ocid="admin.points_history.empty_state"
            >
              No points awarded yet
            </p>
          ) : (
            <div
              className="overflow-hidden rounded-lg"
              style={{ maxHeight: "10rem" }}
            >
              <ScrollArea
                className="h-40 [&>[data-radix-scroll-area-scrollbar]]:opacity-100"
                data-ocid="admin.points_history.panel"
              >
                <div className="space-y-1.5 pr-3">
                  {sortedHistory.map((record: PointRecord, i: number) => {
                    const ms = Number(record.timestamp) / 1_000_000;
                    const dateStr = format(new Date(ms), "MMM d, yyyy");
                    const category = getAdminCategoryLabel(record.reason);
                    return (
                      <div
                        key={`${record.timestamp}-${i}`}
                        className="flex items-start justify-between gap-2 px-2.5 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(255,106,0,0.06)",
                          border: "1px solid rgba(255,106,0,0.12)",
                        }}
                        data-ocid={`admin.points_history.item.${i + 1}`}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: "rgba(255,106,0,0.15)",
                                color: "#FFA560",
                              }}
                            >
                              {category}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: "#A8B6C3" }}
                            >
                              {dateStr}
                            </span>
                          </div>
                          {record.remark && (
                            <p
                              className="text-xs truncate"
                              style={{ color: "#8BA3B5" }}
                            >
                              {record.remark}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-sm font-bold flex-shrink-0 tabular-nums"
                          style={{ color: "#FF6A00" }}
                        >
                          +{Number(record.points)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Admin notification permission banner
function AdminNotificationBanner() {
  const [permState, setPermState] = useState<NotificationPermission | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermState(Notification.permission);
    }
  }, []);

  if (
    dismissed ||
    permState !== "default" ||
    typeof Notification === "undefined"
  ) {
    return null;
  }

  const handleEnable = async () => {
    const result = await Notification.requestPermission();
    setPermState(result);
    if (result === "granted") {
      toast.success(
        "Notifications enabled! You'll be alerted when clients message you.",
      );
    }
    setDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
      style={{
        background: "rgba(7,24,36,0.9)",
        border: "1px solid rgba(255,106,0,0.4)",
      }}
      data-ocid="admin.notification_banner"
    >
      <Bell className="w-4 h-4 flex-shrink-0" style={{ color: "#FF6A00" }} />
      <p className="text-sm text-white flex-1">
        Enable notifications to be alerted when clients send new messages
      </p>
      <Button
        size="sm"
        onClick={handleEnable}
        className="text-xs font-semibold flex-shrink-0 h-8 px-3"
        style={{ background: "#FF6A00", color: "white" }}
        data-ocid="admin.notification_enable.button"
      >
        Enable
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Dismiss"
        data-ocid="admin.notification_banner.close_button"
      >
        <X className="w-4 h-4" style={{ color: "#A8B6C3" }} />
      </button>
    </motion.div>
  );
}

function ConversationPanel({
  selectedUser,
  storageClient,
  onBack,
}: {
  selectedUser: Principal | null;
  storageClient: StorageClient | null;
  onBack?: () => void;
}) {
  const { data: profile } = useGetUserProfile(selectedUser);
  const { data: messages, isLoading } =
    useGetUserMessageHistoryAdmin(selectedUser);
  const { data: lastReadTimestamp } = useGetLastReadTimestamp(selectedUser);
  const sendToUser = useSendMessageToUser();
  const [replyText, setReplyText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track previous message count for push notifications
  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser push notifications when new user messages arrive
  useEffect(() => {
    if (!messages) return;

    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (currentCount > prevCount && prevCount > 0) {
      const newMessages = messages.slice(prevCount);
      const hasNewUserMsg = newMessages.some(
        (m) => m.senderRole === SenderRole.user,
      );

      if (hasNewUserMsg && document.hidden) {
        const displayName = profile?.name || "A client";
        showPushNotification(
          "HN Coach",
          `New message from ${displayName}`,
          "hn-coach-admin-msg",
        );
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages, profile?.name]);

  const handleSendReply = async (
    text?: string,
    msgType?: MessageType,
    blobId?: string | null,
  ) => {
    if (!selectedUser) return;
    const messageText = text ?? replyText.trim();
    if (!messageText && !blobId) return;

    if (!text) setReplyText("");
    try {
      await sendToUser.mutateAsync({
        user: selectedUser,
        message: messageText,
        messageType: msgType ?? MessageType.text,
        blobId: blobId ?? null,
      });
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send reply");
      if (!text) setReplyText(messageText);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!storageClient) {
      toast.error("Storage not ready");
      return;
    }
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      toast.error("Only images and PDFs are supported");
      return;
    }
    setIsUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes);
      const msgType = isImage ? MessageType.image : MessageType.file;
      await handleSendReply(file.name, msgType, hash);
      toast.success("File sent!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatTime = (ts: bigint) => {
    try {
      return format(new Date(Number(ts / BigInt(1_000_000))), "h:mm a");
    } catch {
      return "";
    }
  };

  const formatDateLabel = (ts: bigint) => {
    try {
      return format(new Date(Number(ts / BigInt(1_000_000))), "MMMM d, yyyy");
    } catch {
      return "";
    }
  };

  const groupedMessages: Array<{ date: string; messages: Message[] }> = [];
  if (messages) {
    for (const msg of messages) {
      const date = formatDateLabel(msg.timestamp);
      const last = groupedMessages[groupedMessages.length - 1];
      if (!last || last.date !== date) {
        groupedMessages.push({ date, messages: [msg] });
      } else {
        last.messages.push(msg);
      }
    }
  }

  if (!selectedUser) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ background: "#112A3A" }}
      >
        <MessageSquare
          className="w-12 h-12 mb-3 opacity-20"
          style={{ color: "#FF6A00" }}
        />
        <p className="text-white font-medium">
          Select a user to view conversation
        </p>
        <p className="text-sm mt-1" style={{ color: "#A8B6C3" }}>
          Choose from the user list on the left
        </p>
      </div>
    );
  }

  const displayName =
    profile?.name || `User: ${selectedUser.toString().slice(0, 12)}...`;

  return (
    <div
      className="flex-1 flex flex-col h-full"
      style={{ background: "#112A3A" }}
    >
      {/* Conversation header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3"
        style={{ borderColor: "#203B4D", background: "#0D2030" }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
            style={{ background: "rgba(255,106,0,0.12)", color: "#FF6A00" }}
            aria-label="Back to user list"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
          style={{ background: "#FF6A00" }}
        >
          {(profile?.name?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{displayName}</p>
          {profile?.email && (
            <p className="text-xs" style={{ color: "#A8B6C3" }}>
              {profile.email}
            </p>
          )}
        </div>
      </div>

      {/* Points bar */}
      <PointsBar selectedUser={selectedUser} />

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: 0 }}
        data-ocid="admin.messages.panel"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "#FF6A00" }}
              data-ocid="admin.messages.loading_state"
            />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 text-center"
            data-ocid="admin.messages.empty_state"
          >
            <MessageSquare
              className="w-10 h-10 mb-2 opacity-20"
              style={{ color: "#FF6A00" }}
            />
            <p className="text-sm" style={{ color: "#A8B6C3" }}>
              No messages yet
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 my-3">
                  <div
                    className="flex-1 border-t"
                    style={{ borderColor: "#203B4D" }}
                  />
                  <span className="text-xs px-2" style={{ color: "#A8B6C3" }}>
                    {group.date}
                  </span>
                  <div
                    className="flex-1 border-t"
                    style={{ borderColor: "#203B4D" }}
                  />
                </div>
                {group.messages.map((msg, i) => {
                  const isCoach = msg.senderRole === SenderRole.coach;
                  return (
                    <motion.div
                      key={`${msg.timestamp}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex mb-2 ${
                        isCoach ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] flex flex-col ${
                          isCoach ? "items-end" : "items-start"
                        }`}
                      >
                        {!isCoach && (
                          <span
                            className="text-xs mb-1 font-medium"
                            style={{ color: "#A8B6C3" }}
                          >
                            {displayName}
                          </span>
                        )}
                        {isCoach && (
                          <span
                            className="text-xs mb-1 font-medium"
                            style={{ color: "#FF6A00" }}
                          >
                            You (Coach)
                          </span>
                        )}
                        <div
                          className="px-3 py-2.5 rounded-2xl text-sm text-white"
                          style={{
                            background: isCoach ? "#FF6A00" : "#1A3A4F",
                            borderBottomRightRadius: isCoach
                              ? "4px"
                              : undefined,
                            borderBottomLeftRadius: !isCoach
                              ? "4px"
                              : undefined,
                          }}
                        >
                          {msg.messageType === MessageType.image &&
                          msg.blobId ? (
                            <AdminImageMessage
                              blobId={msg.blobId}
                              storageClient={storageClient}
                            />
                          ) : msg.messageType === MessageType.file &&
                            msg.blobId ? (
                            <AdminFileMessage
                              blobId={msg.blobId}
                              storageClient={storageClient}
                              filename={msg.message}
                            />
                          ) : (
                            msg.message
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span
                            className="text-xs"
                            style={{ color: "#A8B6C3" }}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                          {isCoach && (
                            <MessageTicks
                              msgTimestamp={msg.timestamp}
                              lastReadTimestamp={lastReadTimestamp}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div
        className="border-t p-3"
        style={{ borderColor: "#203B4D", background: "#0D2030" }}
      >
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !storageClient}
            className="w-10 h-10 p-0 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "#1A3A4F",
              border: "1px solid #203B4D",
              color: isUploading ? "#FF6A00" : "#A8B6C3",
            }}
            title="Attach image or PDF"
            data-ocid="admin.messages.upload_button"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply as coach..."
            rows={1}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white resize-none outline-none border transition-colors min-h-[40px] max-h-28 overflow-y-auto"
            style={{
              background: "#1A3A4F",
              borderColor: "#203B4D",
              color: "white",
            }}
            data-ocid="admin.messages.textarea"
          />
          <Button
            onClick={() => handleSendReply()}
            disabled={!replyText.trim() || sendToUser.isPending}
            className="w-10 h-10 p-0 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: "#FF6A00" }}
            data-ocid="admin.messages.submit_button"
          >
            {sendToUser.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BookingsTab() {
  const { data: bookings, isLoading } = useGetAllBookings();
  const cancelBooking = useAdminCancelBooking();

  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timeSlot}`).getTime();
      const dateB = new Date(`${b.date} ${b.timeSlot}`).getTime();
      return dateB - dateA;
    });
  }, [bookings]);

  const handleCancel = async (bookingId: bigint) => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.bookings.loading_state"
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "#FF6A00" }}
        />
      </div>
    );
  }

  if (!sortedBookings.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="admin.bookings.empty_state"
      >
        <Users
          className="w-12 h-12 mb-3 opacity-20"
          style={{ color: "#FF6A00" }}
        />
        <p className="text-white font-medium">No bookings yet</p>
        <p className="text-sm mt-1" style={{ color: "#A8B6C3" }}>
          Bookings will appear here once users schedule appointments
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div
        className="hidden md:block overflow-x-auto rounded-xl border"
        style={{ borderColor: "#203B4D" }}
        data-ocid="admin.bookings.table"
      >
        <div className="min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow
                style={{ background: "#0D2030", borderColor: "#203B4D" }}
              >
                <TableHead className="text-white font-semibold">User</TableHead>
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Time</TableHead>
                <TableHead className="text-white font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.map((booking: Booking, idx: number) => (
                <TableRow
                  key={booking.id.toString()}
                  style={{
                    borderColor: "#203B4D",
                    background: idx % 2 === 0 ? "#112A3A" : "#0F2535",
                  }}
                  data-ocid={`admin.bookings.row.${idx + 1}`}
                >
                  <TableCell>
                    <BookingUserCell user={booking.user} />
                  </TableCell>
                  <TableCell className="text-white">{booking.date}</TableCell>
                  <TableCell className="text-white">
                    {booking.timeSlot}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="font-semibold text-xs"
                      style={{
                        background:
                          booking.status === BookingStatus.booked
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(239,68,68,0.15)",
                        color:
                          booking.status === BookingStatus.booked
                            ? "#4ade80"
                            : "#f87171",
                        border: `1px solid ${
                          booking.status === BookingStatus.booked
                            ? "rgba(74,222,128,0.3)"
                            : "rgba(248,113,113,0.3)"
                        }`,
                      }}
                    >
                      {booking.status === BookingStatus.booked
                        ? "Booked"
                        : "Cancelled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.status === BookingStatus.booked && (
                      <Button
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelBooking.isPending}
                        className="text-xs font-semibold h-7 px-3"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(248,113,113,0.3)",
                          color: "#f87171",
                        }}
                        data-ocid={`admin.bookings.delete_button.${idx + 1}`}
                      >
                        {cancelBooking.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile card list view */}
      <div className="md:hidden space-y-3" data-ocid="admin.bookings.list">
        {sortedBookings.map((booking: Booking, idx: number) => (
          <div
            key={booking.id.toString()}
            className="rounded-xl p-4 border"
            style={{ background: "#112A3A", borderColor: "#203B4D" }}
            data-ocid={`admin.bookings.item.${idx + 1}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <BookingUserCell user={booking.user} />
              <Badge
                className="font-semibold text-xs flex-shrink-0"
                style={{
                  background:
                    booking.status === BookingStatus.booked
                      ? "rgba(34,197,94,0.15)"
                      : "rgba(239,68,68,0.15)",
                  color:
                    booking.status === BookingStatus.booked
                      ? "#4ade80"
                      : "#f87171",
                  border: `1px solid ${
                    booking.status === BookingStatus.booked
                      ? "rgba(74,222,128,0.3)"
                      : "rgba(248,113,113,0.3)"
                  }`,
                }}
              >
                {booking.status === BookingStatus.booked
                  ? "Booked"
                  : "Cancelled"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-xs mb-0.5" style={{ color: "#A8B6C3" }}>
                  Date
                </p>
                <p className="text-sm font-medium text-white">{booking.date}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: "#A8B6C3" }}>
                  Time
                </p>
                <p className="text-sm font-medium text-white">
                  {booking.timeSlot}
                </p>
              </div>
            </div>
            {booking.status === BookingStatus.booked && (
              <Button
                size="sm"
                onClick={() => handleCancel(booking.id)}
                disabled={cancelBooking.isPending}
                className="w-full h-10 text-sm font-semibold"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  color: "#f87171",
                }}
                data-ocid={`admin.bookings.delete_button.${idx + 1}`}
              >
                {cancelBooking.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Cancel Booking
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function BookingUserCell({ user }: { user: Principal }) {
  const { data: profile } = useGetUserProfile(user);
  return (
    <div>
      <p className="text-white text-sm font-medium">
        {profile?.name || "Unknown"}
      </p>
      <p className="text-xs" style={{ color: "#A8B6C3" }}>
        {user.toString().slice(0, 14)}...
      </p>
    </div>
  );
}

// Polls unread counts for ALL users and fires browser notifications for new messages
// This runs regardless of which conversation is open
function useAdminNotificationWatcher(users: Principal[] | undefined) {
  const { actor } = useActor();
  const prevUnreadRef = useRef<Record<string, number>>({});

  const checkUnreads = useCallback(async () => {
    if (!actor || !users || users.length === 0) return;

    for (const user of users) {
      const key = user.toString();
      try {
        const count = Number(
          await (actor as any).getCoachUnreadCountForUser(user),
        );
        const prev = prevUnreadRef.current[key] ?? 0;
        if (
          count > prev &&
          prev >= 0 &&
          prevUnreadRef.current[key] !== undefined
        ) {
          // New unread messages arrived for this user
          if (document.hidden) {
            showPushNotification(
              "HN Coach",
              "New message from a client",
              "hn-coach-admin-unread",
            );
          }
        }
        prevUnreadRef.current[key] = count;
      } catch {
        // ignore per-user errors
      }
    }
  }, [actor, users]);

  useEffect(() => {
    // Do an initial pass to populate prevUnreadRef without triggering notifications
    if (!actor || !users || users.length === 0) return;
    (async () => {
      for (const user of users) {
        const key = user.toString();
        if (prevUnreadRef.current[key] === undefined) {
          try {
            const count = Number(
              await (actor as any).getCoachUnreadCountForUser(user),
            );
            prevUnreadRef.current[key] = count;
          } catch {
            prevUnreadRef.current[key] = 0;
          }
        }
      }
    })();
  }, [actor, users]);

  useEffect(() => {
    const interval = setInterval(checkUnreads, 5000);
    return () => clearInterval(interval);
  }, [checkUnreads]);
}

function MessagesTab({
  storageClient,
}: { storageClient: StorageClient | null }) {
  const { data: users, isLoading: usersLoading } = useGetAllUsers();
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const markCoachRead = useMarkCoachReadForUser();
  // Global notification watcher - fires for any user, even when not in their conversation
  useAdminNotificationWatcher(users);

  // Continuously mark messages as read while a conversation is open
  // This ensures new messages that arrive while coach is viewing also get cleared
  const markCoachReadRef = useRef(markCoachRead.mutate);
  markCoachReadRef.current = markCoachRead.mutate;

  useEffect(() => {
    if (!selectedUser) return;
    // Mark immediately when user is selected
    markCoachReadRef.current(selectedUser);
    // Keep marking every 4 seconds while conversation is open
    const interval = setInterval(() => {
      markCoachReadRef.current(selectedUser);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleSelectUser = (u: Principal) => {
    setSelectedUser(u);
  };

  return (
    <div>
      {/* Notification permission banner for coach */}
      <AnimatePresence>
        <AdminNotificationBanner />
      </AnimatePresence>

      <div
        className="flex flex-col md:flex-row h-[calc(100vh-200px)] min-h-[400px] rounded-xl overflow-hidden border"
        style={{ borderColor: "#203B4D" }}
        data-ocid="admin.messages.panel"
      >
        <div
          className={`${selectedUser ? "hidden md:flex" : "flex"} md:w-64 w-full flex-shrink-0 border-r flex-col`}
          style={{ borderColor: "#203B4D", background: "#0D2030" }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "#203B4D" }}
          >
            <p className="text-sm font-semibold text-white">Users</p>
            <p className="text-xs mt-0.5" style={{ color: "#A8B6C3" }}>
              {users?.length ?? 0} total
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {usersLoading ? (
                <div
                  className="flex justify-center py-8"
                  data-ocid="admin.users.loading_state"
                >
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
              ) : !users || users.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="admin.users.empty_state"
                >
                  <p className="text-sm" style={{ color: "#A8B6C3" }}>
                    No users yet
                  </p>
                </div>
              ) : (
                users.map((u: Principal) => (
                  <UserListItem
                    key={u.toString()}
                    principal={u}
                    isSelected={selectedUser?.toString() === u.toString()}
                    onClick={() => handleSelectUser(u)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div
          className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 flex-col`}
        >
          <ConversationPanel
            selectedUser={selectedUser}
            storageClient={storageClient}
            onBack={() => setSelectedUser(null)}
          />
        </div>
      </div>
    </div>
  );
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_AUTH_KEY, "true");
        onAuth();
      } else {
        setError("Incorrect password. Try again.");
        setPassword("");
      }
      setIsChecking(false);
    }, 400);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0B2232" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#FF6A00" }}
          >
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-display font-bold text-2xl">
            HN<span style={{ color: "#FF6A00" }}> Coach</span>
          </span>
        </div>

        <div
          className="rounded-2xl p-8 border shadow-card"
          style={{ background: "#112A3A", borderColor: "#203B4D" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,106,0,0.15)" }}
            >
              <Lock className="w-5 h-5" style={{ color: "#FF6A00" }} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">
                Coach Admin Access
              </h1>
              <p className="text-sm" style={{ color: "#A8B6C3" }}>
                Enter your admin password to continue
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-ocid="admin.login.dialog"
          >
            <div>
              <Label
                htmlFor="admin-password"
                className="block text-sm font-medium text-white mb-2"
              >
                Admin Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                className="w-full text-white border"
                style={{
                  background: "#1A3A4F",
                  borderColor: error ? "#f87171" : "#203B4D",
                  color: "white",
                }}
                autoFocus
                data-ocid="admin.login.input"
              />
              {error && (
                <div
                  className="flex items-center gap-1.5 mt-2"
                  data-ocid="admin.login.error_state"
                >
                  <AlertCircle
                    className="w-4 h-4"
                    style={{ color: "#f87171" }}
                  />
                  <p className="text-sm" style={{ color: "#f87171" }}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!password || isChecking}
              className="w-full h-11 font-semibold text-white"
              style={{ background: "#FF6A00" }}
              data-ocid="admin.login.submit_button"
            >
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Access Admin Panel
            </Button>
          </form>

          <div
            className="mt-6 pt-5 border-t"
            style={{ borderColor: "#203B4D" }}
          >
            <p className="text-sm text-center" style={{ color: "#A8B6C3" }}>
              Please log in with your Internet Identity first, then access the
              admin panel.
            </p>
            <div className="mt-3 text-center">
              <a
                href="/login"
                className="text-sm font-medium hover:underline"
                style={{ color: "#FF6A00" }}
                data-ocid="admin.login.link"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AdminPanel() {
  const { isFetching } = useActor();
  const [storageClient, setStorageClient] = useState<StorageClient | null>(
    null,
  );

  useEffect(() => {
    if (isFetching) return;
    loadConfig().then((config) => {
      import("@icp-sdk/core/agent").then(({ HttpAgent }) => {
        const agent = new HttpAgent({ host: config.backend_host });
        if (config.backend_host?.includes("localhost")) {
          agent.fetchRootKey().catch(() => {});
        }
        const sc = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );
        setStorageClient(sc);
      });
    });
  }, [isFetching]);

  if (isFetching) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0B2232" }}
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,106,0,0.15)" }}
          >
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "#FF6A00" }}
            />
          </div>
          <p className="text-sm font-medium" style={{ color: "#A8B6C3" }}>
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0B2232" }}
    >
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{ background: "#071824", borderColor: "#203B4D" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#FF6A00" }}
              >
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-display font-bold text-xl tracking-tight">
                HN<span style={{ color: "#FF6A00" }}> Coach</span>
              </span>
              <span
                className="hidden sm:inline-block ml-2 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
                style={{
                  background: "rgba(255,106,0,0.15)",
                  color: "#FF6A00",
                  border: "1px solid rgba(255,106,0,0.3)",
                }}
              >
                Admin
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(ADMIN_AUTH_KEY);
                window.location.reload();
              }}
              className="text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors hover:opacity-80 min-h-[40px] flex items-center gap-1.5"
              style={{ color: "#A8B6C3", border: "1px solid #203B4D" }}
              data-ocid="admin.logout.button"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "#A8B6C3" }}>
              Manage messages and bookings for all users
            </p>
          </div>

          <Tabs
            defaultValue="messages"
            className="w-full"
            data-ocid="admin.tab"
          >
            <TabsList
              className="mb-6 border"
              style={{ background: "#112A3A", borderColor: "#203B4D" }}
            >
              <TabsTrigger
                value="messages"
                className="flex items-center gap-2 data-[state=active]:text-white font-medium"
                style={{ color: "#A8B6C3" }}
                data-ocid="admin.messages.tab"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex items-center gap-2 data-[state=active]:text-white font-medium"
                style={{ color: "#A8B6C3" }}
                data-ocid="admin.bookings.tab"
              >
                <Users className="w-4 h-4" />
                Bookings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages">
              <MessagesTab storageClient={storageClient} />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <footer
        className="mt-auto border-t py-6 text-center text-sm"
        style={{
          background: "#071824",
          borderColor: "#203B4D",
          color: "#A8B6C3",
        }}
      >
        HN Coach Admin Panel &bull; Coach access only
      </footer>
    </div>
  );
}

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });

  if (!isAuthenticated) {
    return <PasswordGate onAuth={() => setIsAuthenticated(true)} />;
  }

  return <AdminPanel />;
}
