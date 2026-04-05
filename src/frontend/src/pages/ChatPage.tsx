import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Bell,
  BellOff,
  Camera,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  History,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageType, SenderRole } from "../backend";
import { PointReason } from "../backend";
import type { PointRecord } from "../backend";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import {
  useGetCallerPointHistory,
  useGetCallerPoints,
  useGetMessageHistory,
  useMarkMessagesAsRead,
  useSendMessageToCoach,
} from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";
import { showPushNotification } from "../utils/notifications";

function FileMessage({
  blobId,
  storageClient,
  filename,
}: {
  blobId: string;
  storageClient: StorageClient | null;
  filename?: string;
}) {
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
      style={{ background: "rgba(255,106,0,0.12)", color: "#FF6A00" }}
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm truncate max-w-[200px]">
        {filename || "Download file"}
      </span>
    </a>
  );
}

function ImageMessage({
  blobId,
  storageClient,
}: {
  blobId: string;
  storageClient: StorageClient | null;
}) {
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
      className="rounded-lg max-w-full max-h-64 object-cover"
      style={{ border: "1px solid #F0E8DE" }}
    />
  );
}

function getCategoryLabel(reason: PointReason): string {
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

function getTodayPoints(history: PointRecord[]): number {
  const todayStr = new Date().toDateString();
  return history.reduce((sum, record) => {
    const ms = Number(record.timestamp) / 1_000_000;
    if (new Date(ms).toDateString() === todayStr) {
      return sum + Number(record.points);
    }
    return sum;
  }, 0);
}

function TodaysPointsBadge({ history }: { history: PointRecord[] }) {
  const todayPts = getTodayPoints(history);
  if (todayPts === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0"
      style={{
        background: "rgba(255,106,0,0.12)",
        border: "1.5px solid rgba(255,106,0,0.35)",
      }}
      data-ocid="chat.today_points.card"
    >
      <Star className="w-3.5 h-3.5" style={{ color: "#FF6A00" }} />
      <span className="text-xs font-bold" style={{ color: "#FF6A00" }}>
        Today: +{todayPts} pts
      </span>
    </motion.div>
  );
}

function PointsSummaryCard() {
  const { data: totalPoints, isLoading: pointsLoading } = useGetCallerPoints();
  const { data: history, isLoading: historyLoading } =
    useGetCallerPointHistory();
  const [showHistory, setShowHistory] = useState(false);

  const isLoading = pointsLoading || historyLoading;
  const total = Number(totalPoints ?? BigInt(0));
  const sortedHistory = history
    ? [...history].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl px-4 py-3 mb-3"
      style={{
        background: "#FFFFFF",
        border: "1px solid #F0E8DE",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      data-ocid="chat.points.card"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: "#FF6A00" }}
          />
          <span className="text-xs" style={{ color: "#8B7355" }}>
            Loading points...
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Total + today badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Trophy
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "#FF6A00" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "#1A1A2E" }}
            >
              Total Points:
            </span>
            <span className="text-base font-bold" style={{ color: "#FF6A00" }}>
              {total} pts
            </span>
            {history && history.length > 0 && (
              <TodaysPointsBadge history={history} />
            )}
          </div>

          {/* Points History */}
          {sortedHistory.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1.5 mb-2 w-full text-left hover:opacity-80 transition-opacity"
                data-ocid="chat.points_history.toggle"
              >
                <History className="w-3.5 h-3.5" style={{ color: "#8B7355" }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wider flex-1"
                  style={{ color: "#8B7355" }}
                >
                  Points History
                </span>
                {showHistory ? (
                  <ChevronUp
                    className="w-3.5 h-3.5"
                    style={{ color: "#8B7355" }}
                  />
                ) : (
                  <ChevronDown
                    className="w-3.5 h-3.5"
                    style={{ color: "#8B7355" }}
                  />
                )}
              </button>
              {showHistory && (
                <div
                  className="overflow-hidden rounded-lg"
                  style={{ maxHeight: "12rem" }}
                >
                  <ScrollArea
                    className="h-48 [&>[data-radix-scroll-area-scrollbar]]:opacity-100"
                    data-ocid="chat.points_history.panel"
                  >
                    <div className="space-y-1.5 pr-3">
                      {sortedHistory.map((record, i) => {
                        const ms = Number(record.timestamp) / 1_000_000;
                        const dateStr = format(new Date(ms), "MMM d, yyyy");
                        const category = getCategoryLabel(record.reason);
                        return (
                          <div
                            key={`${record.timestamp}-${i}`}
                            className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg"
                            style={{
                              background: "rgba(255,106,0,0.06)",
                              border: "1px solid rgba(255,106,0,0.14)",
                            }}
                            data-ocid={`chat.points_history.item.${i + 1}`}
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: "rgba(255,106,0,0.12)",
                                    color: "#FF6A00",
                                  }}
                                >
                                  {category}
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: "#8B7355" }}
                                >
                                  {dateStr}
                                </span>
                              </div>
                              {record.remark && (
                                <p
                                  className="text-xs truncate"
                                  style={{ color: "#A89078" }}
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

          {sortedHistory.length === 0 && !isLoading && (
            <p className="text-xs" style={{ color: "#8B7355" }}>
              No points yet — keep up your streak and share progress images!
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

const STREAK_TIERS = [
  { days: 7, pts: 500 },
  { days: 14, pts: 1000 },
  { days: 21, pts: 1500 },
  { days: 28, pts: 2000 },
];

const IMAGE_BONUSES = [
  { label: "Weight Image", pts: 20 },
  { label: "Footsteps", pts: 30 },
  { label: "Meal Image", pts: 60 },
  { label: "Weekly Measurements", pts: 100 },
];

const IMAGE_BONUS_EMOJIS = ["⚖️", "💟", "🍽️", "📏"];

function BonusPointsGuide() {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="rounded-xl mb-5 overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #F0E8DE",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      data-ocid="chat.bonus_guide.card"
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 transition-colors"
        data-ocid="chat.bonus_guide.toggle"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "#FF6A00" }} />
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "#1A1A2E" }}
          >
            🎯 How to Earn Bonus Points
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: "#8B7355" }} />
        </motion.div>
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="bonus-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Streak bonuses */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🔥</span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Streak Bonuses
                  </span>
                </div>
                <div className="space-y-1.5">
                  {STREAK_TIERS.map((tier, i) => {
                    const intensity = 0.3 + i * 0.175;
                    return (
                      <div
                        key={tier.days}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                        style={{
                          background: `rgba(255,106,0,${intensity * 0.1})`,
                          border: `1px solid rgba(255,106,0,${intensity * 0.25})`,
                        }}
                        data-ocid={`chat.streak_tier.item.${i + 1}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">
                            {i === 0
                              ? "🔥"
                              : i === 1
                                ? "🔥🔥"
                                : i === 2
                                  ? "🔥🔥🔥"
                                  : "🔥🔥🔥🔥"}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: "#1A1A2E" }}
                          >
                            {tier.days} days
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{
                            color: `rgba(255,${90 + i * 25},0,1)`,
                          }}
                        >
                          +{tier.pts.toLocaleString()} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress image bonuses */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Camera
                    className="w-3.5 h-3.5"
                    style={{ color: "#FF6A00" }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Progress Images
                  </span>
                </div>
                <div className="space-y-1.5">
                  {IMAGE_BONUSES.map((bonus, i) => (
                    <div
                      key={bonus.label}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                      style={{
                        background: "rgba(255,106,0,0.06)",
                        border: "1px solid rgba(255,106,0,0.15)",
                      }}
                      data-ocid={`chat.image_bonus.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{IMAGE_BONUS_EMOJIS[i]}</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#1A1A2E" }}
                        >
                          {bonus.label}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{ color: "#FF6A00" }}
                      >
                        +{bonus.pts} pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Motivational note */}
                <p
                  className="text-xs mt-2 leading-relaxed"
                  style={{ color: "#8B7355" }}
                >
                  Share your progress images with your coach to earn bonus
                  points and track your transformation! 💪
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Notification permission banner for users
function NotificationPermissionBanner() {
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
        "Notifications enabled! You'll be alerted when your coach replies.",
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
        background: "rgba(255,106,0,0.07)",
        border: "1px solid rgba(255,106,0,0.3)",
      }}
      data-ocid="chat.notification_banner"
    >
      <Bell className="w-4 h-4 flex-shrink-0" style={{ color: "#FF6A00" }} />
      <p className="text-sm flex-1" style={{ color: "#1A1A2E" }}>
        Enable notifications to be alerted when your coach replies
      </p>
      <Button
        size="sm"
        onClick={handleEnable}
        className="text-xs font-semibold flex-shrink-0 h-8 px-3"
        style={{ background: "#FF6A00", color: "white" }}
        data-ocid="chat.notification_enable.button"
      >
        Enable
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Dismiss"
        data-ocid="chat.notification_banner.close_button"
      >
        <X className="w-4 h-4" style={{ color: "#8B7355" }} />
      </button>
    </motion.div>
  );
}

export function ChatPage() {
  const { data: messages, isLoading } = useGetMessageHistory();
  const sendMessage = useSendMessageToCoach();
  const markAsRead = useMarkMessagesAsRead();
  const { actor, isFetching } = useActor();
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storageClient, setStorageClient] = useState<StorageClient | null>(
    null,
  );
  const hasMarkedRef = useRef(false);
  const markAsReadRef = useRef(markAsRead.mutate);
  markAsReadRef.current = markAsRead.mutate;

  // Track previous message count for push notifications
  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    if (!actor || isFetching) return;
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
  }, [actor, isFetching]);

  // Mark messages as read once when messages first load
  useEffect(() => {
    if (messages && messages.length > 0 && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      markAsReadRef.current();
    }
  }, [messages]);

  // Browser push notifications when new coach messages arrive while tab is hidden
  useEffect(() => {
    if (!messages) return;

    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (currentCount > prevCount && prevCount > 0) {
      // Check if new messages were sent by coach
      const newMessages = messages.slice(prevCount);
      const hasNewCoachMsg = newMessages.some(
        (m) => m.senderRole === SenderRole.coach,
      );

      if (hasNewCoachMsg && document.hidden) {
        showPushNotification(
          "HN Coach",
          "You have a new message from your coach!",
          "hn-coach-user-msg",
        );
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const handleSend = async (
    messageText?: string,
    msgType?: MessageType,
    blobId?: string | null,
  ) => {
    const text = messageText ?? input.trim();
    if (!text && !blobId) return;

    if (!messageText) setInput("");
    try {
      await sendMessage.mutateAsync({
        message: text,
        messageType: msgType ?? MessageType.text,
        blobId: blobId ?? null,
      });
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Failed to send message");
      if (!messageText) setInput(text);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!storageClient) {
      toast.error("Storage not ready, please try again");
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
      await handleSend(file.name, msgType, hash);
      toast.success("File sent!");
    } catch (err) {
      console.error("File upload failed:", err);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: bigint) => {
    try {
      const ms = Number(timestamp / BigInt(1_000_000));
      return format(new Date(ms), "h:mm a");
    } catch {
      return "";
    }
  };

  const formatDate = (timestamp: bigint) => {
    try {
      const ms = Number(timestamp / BigInt(1_000_000));
      return format(new Date(ms), "MMMM d, yyyy");
    } catch {
      return "";
    }
  };

  // Group messages by date
  const groupedMessages: Array<{ date: string; messages: typeof messages }> =
    [];
  if (messages) {
    for (const msg of messages) {
      const date = formatDate(msg.timestamp);
      const last = groupedMessages[groupedMessages.length - 1];
      if (!last || last.date !== date) {
        groupedMessages.push({ date, messages: [msg] });
      } else {
        last.messages!.push(msg);
      }
    }
  }

  const hasMessages = messages && messages.length > 0;

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#FFFBF5" }}
      >
        <NavBar />

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,106,0,0.1)" }}
              >
                <MessageCircle
                  className="w-5 h-5"
                  style={{ color: "#FF6A00" }}
                />
              </div>
              <div>
                <h1
                  className="text-xl font-display font-bold"
                  style={{ color: "#1A1A2E" }}
                >
                  Chat with your Coach
                </h1>
                <p className="text-sm" style={{ color: "#8B7355" }}>
                  Your messages are private and secure
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs" style={{ color: "#8B7355" }}>
                  Coach online
                </span>
              </div>
            </div>

            {/* Notification permission banner */}
            <AnimatePresence>
              <NotificationPermissionBanner />
            </AnimatePresence>

            {/* Points summary card */}
            <PointsSummaryCard />

            {/* Bonus points guide */}
            <BonusPointsGuide />

            {/* Chat container */}
            <div
              className="flex-1 flex flex-col rounded-2xl border overflow-hidden"
              style={{
                background: "#FFFFFF",
                borderColor: "#F0E8DE",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                minHeight: "500px",
              }}
            >
              {/* Messages area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                style={{ maxHeight: "calc(100vh - 380px)" }}
                data-ocid="chat.panel"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2
                      className="w-6 h-6 animate-spin"
                      style={{ color: "#FF6A00" }}
                      data-ocid="chat.loading_state"
                    />
                  </div>
                ) : !hasMessages ? (
                  <div
                    className="flex flex-col items-center justify-center h-48 text-center"
                    data-ocid="chat.empty_state"
                  >
                    <MessageCircle
                      className="w-12 h-12 mb-3 opacity-20"
                      style={{ color: "#FF6A00" }}
                    />
                    <p className="font-medium" style={{ color: "#1A1A2E" }}>
                      No messages yet
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#8B7355" }}>
                      Say hello to your coach!
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {groupedMessages.map((group) => (
                      <div key={group.date}>
                        <div className="flex items-center gap-3 my-4">
                          <div
                            className="flex-1 border-t"
                            style={{ borderColor: "#F0E8DE" }}
                          />
                          <span
                            className="text-xs px-2"
                            style={{ color: "#A89078" }}
                          >
                            {group.date}
                          </span>
                          <div
                            className="flex-1 border-t"
                            style={{ borderColor: "#F0E8DE" }}
                          />
                        </div>
                        {group.messages?.map((msg, i) => {
                          const isUser = msg.senderRole === SenderRole.user;
                          return (
                            <motion.div
                              key={`${msg.timestamp}-${i}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                              className={`flex mb-3 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] sm:max-w-[65%] ${
                                  isUser ? "items-end" : "items-start"
                                } flex flex-col`}
                              >
                                {!isUser && (
                                  <span
                                    className="text-xs mb-1 font-medium"
                                    style={{ color: "#FF6A00" }}
                                  >
                                    HN Coach
                                  </span>
                                )}
                                <div
                                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                                  style={{
                                    background: isUser ? "#FF6A00" : "#F8F3EE",
                                    color: isUser ? "#FFFFFF" : "#1A1A2E",
                                    border: isUser
                                      ? "none"
                                      : "1px solid #F0E8DE",
                                    borderBottomRightRadius: isUser
                                      ? "4px"
                                      : undefined,
                                    borderBottomLeftRadius: !isUser
                                      ? "4px"
                                      : undefined,
                                  }}
                                >
                                  {msg.messageType === MessageType.image &&
                                  msg.blobId ? (
                                    <ImageMessage
                                      blobId={msg.blobId}
                                      storageClient={storageClient}
                                    />
                                  ) : msg.messageType === MessageType.file &&
                                    msg.blobId ? (
                                    <FileMessage
                                      blobId={msg.blobId}
                                      storageClient={storageClient}
                                      filename={msg.message}
                                    />
                                  ) : (
                                    msg.message
                                  )}
                                </div>
                                <span
                                  className="text-xs mt-1 px-1"
                                  style={{ color: "#A89078" }}
                                >
                                  {formatTime(msg.timestamp)}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Response time notice banner */}
              <div
                className="mx-3 mb-2 mt-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255, 106, 0, 0.07)",
                  border: "1px solid rgba(255, 106, 0, 0.2)",
                }}
              >
                <Clock
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#FF8C38" }}
                />
                <p className="text-xs font-medium" style={{ color: "#FF6A00" }}>
                  We will respond shortly{" "}
                  <span style={{ color: "#c45200" }}>
                    (Morning 8am to 11:59pm)
                  </span>
                </p>
              </div>

              {/* Input area */}
              <div
                className="border-t p-4"
                style={{ background: "#FFFBF5", borderColor: "#F0E8DE" }}
              >
                <div className="flex items-end gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                    data-ocid="chat.upload_button"
                  />
                  {/* Attach button */}
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !storageClient}
                    className="w-11 h-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "#F0E8DE",
                      border: "1px solid #EDE4D9",
                      color: isUploading ? "#FF6A00" : "#8B7355",
                    }}
                    title="Attach image or PDF"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </Button>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message... (Enter to send)"
                    rows={1}
                    className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none border focus:border-orange-400 transition-colors min-h-[44px] max-h-32 overflow-y-auto"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "#EDE4D9",
                      color: "#1A1A2E",
                    }}
                    data-ocid="chat.input"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || sendMessage.isPending}
                    className="w-11 h-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{
                      background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                      boxShadow: "0 4px 12px rgba(255,106,0,0.3)",
                    }}
                    data-ocid="chat.submit_button"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs mt-2" style={{ color: "#A89078" }}>
                  Press Enter to send &bull; Shift+Enter for new line &bull;
                  Attach images or PDFs with the paperclip
                </p>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
