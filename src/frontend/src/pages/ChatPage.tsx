import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  History,
  Loader2,
  MessageCircle,
  Palette,
  Paperclip,
  Send,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageType, SenderRole } from "../backend";
import { PointReason } from "../backend";
import type { PointRecord } from "../backend";
import { Footer } from "../components/Footer";
import { LoginModal } from "../components/LoginModal";
import { NameModal } from "../components/NameModal";
import { NavBar } from "../components/NavBar";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerPointHistory,
  useGetCallerPoints,
  useGetCallerUserProfile,
  useGetMessageHistory,
  useMarkMessagesAsRead,
  useSendMessageToCoach,
} from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";

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

  if (!url) return <Loader2 className="w-4 h-4 animate-spin text-orange-400" />;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
      style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
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

  if (!url) return <Loader2 className="w-4 h-4 animate-spin text-orange-400" />;

  return (
    <img
      src={url}
      alt="Shared file"
      className="rounded-xl max-w-full max-h-64 object-cover shadow-md"
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

const STREAK_TIERS = [
  { days: 7, pts: 500, emoji: "🔥" },
  { days: 14, pts: 1000, emoji: "🔥🔥" },
  { days: 21, pts: 1500, emoji: "🔥🔥🔥" },
  { days: 28, pts: 2000, emoji: "🔥🔥🔥🔥" },
];

const IMAGE_BONUSES = [
  { label: "Weight Image", pts: 20, emoji: "⚖️" },
  { label: "Footsteps", pts: 30, emoji: "👣" },
  { label: "Meal Image", pts: 60, emoji: "🍽️" },
  { label: "Weekly Measurements", pts: 100, emoji: "📏" },
  { label: "Before Image", pts: 250, emoji: "📸" },
  { label: "After Image", pts: 250, emoji: "🏆" },
  { label: "Daily Bonus", pts: 50, emoji: "⭐" },
];

const REFERRAL_TIERS = [
  { rank: "1st Referral", pts: 5000, emoji: "🤝" },
  { rank: "2nd Referral", pts: 6000, emoji: "🤝🤝" },
  { rank: "3rd Referral", pts: 7000, emoji: "🤝🤝🤝" },
];

const CHAT_BACKGROUNDS = [
  {
    id: "default",
    label: "Default",
    bg: "linear-gradient(180deg, #FFFBF5 0%, #FFFFFF 100%)",
  },
  {
    id: "ocean",
    label: "Ocean",
    bg: "linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    bg: "linear-gradient(180deg, #FFF7ED 0%, #FED7AA 100%)",
  },
  {
    id: "midnight",
    label: "Midnight",
    bg: "linear-gradient(180deg, #1E1B4B 0%, #312E81 100%)",
  },
];

function PointsSummaryCard() {
  const { data: totalPoints, isLoading: pointsLoading } = useGetCallerPoints();
  const { data: history, isLoading: historyLoading } =
    useGetCallerPointHistory();
  const [showHistory, setShowHistory] = useState(false);

  const isLoading = pointsLoading || historyLoading;
  const total = Number(totalPoints ?? BigInt(0));
  const todayPts = history ? getTodayPoints(history) : 0;
  const sortedHistory = history
    ? [...history].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        background:
          "linear-gradient(135deg, #FF6A00 0%, #FF8C3A 50%, #FFB347 100%)",
        boxShadow: "0 8px 32px rgba(255,106,0,0.35)",
      }}
      data-ocid="chat.points.card"
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 translate-x-8 -translate-y-8 pointer-events-none"
        style={{ background: "white" }}
      />
      <div
        className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 -translate-x-6 translate-y-6 pointer-events-none"
        style={{ background: "white" }}
      />

      <div className="relative px-5 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="text-sm text-white/80">Loading points...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Points row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium">
                    Total Points
                  </p>
                  <p className="text-white text-2xl font-bold leading-none">
                    {total.toLocaleString()}
                  </p>
                </div>
              </div>
              {todayPts > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  <Star className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-bold">
                    +{todayPts} today
                  </span>
                </motion.div>
              )}
            </div>

            {/* Points History Toggle */}
            {sortedHistory.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHistory((v) => !v)}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors w-full text-left"
                  data-ocid="chat.points_history.toggle"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider flex-1">
                    Points History
                  </span>
                  {showHistory ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showHistory && (
                  <div
                    className="mt-2 overflow-hidden rounded-xl"
                    style={{ maxHeight: "12rem" }}
                  >
                    <ScrollArea
                      className="h-48 [&>[data-radix-scroll-area-scrollbar]]:opacity-100"
                      data-ocid="chat.points_history.panel"
                    >
                      <div className="space-y-1.5 pr-2">
                        {sortedHistory.map((record, i) => {
                          const ms = Number(record.timestamp) / 1_000_000;
                          const dateStr = format(new Date(ms), "MMM d, yyyy");
                          const category = getCategoryLabel(record.reason);
                          return (
                            <div
                              key={`${record.timestamp}-${i}`}
                              className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg"
                              style={{ background: "rgba(255,255,255,0.15)" }}
                              data-ocid={`chat.points_history.item.${i + 1}`}
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-semibold text-white">
                                    {category}
                                  </span>
                                  <span className="text-xs text-white/60">
                                    {dateStr}
                                  </span>
                                </div>
                                {record.remark && (
                                  <p className="text-xs truncate text-white/70">
                                    {record.remark}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-bold flex-shrink-0 text-white tabular-nums">
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
              <p className="text-xs text-white/70">
                No points yet — start sharing progress to earn! 💪
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BonusPointsGuide() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="rounded-2xl mb-4 overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #F0E8DE",
        boxShadow: "0 2px 12px rgba(255,106,0,0.08)",
      }}
      data-ocid="chat.bonus_guide.card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors"
        data-ocid="chat.bonus_guide.toggle"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6A00, #FF8C3A)" }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: "#1A1A2E" }}>
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
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Streak bonuses */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">🔥</span>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Streak Bonuses
                  </span>
                </div>
                <div className="space-y-1.5">
                  {STREAK_TIERS.map((tier, i) => (
                    <div
                      key={tier.days}
                      className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{
                        background: `rgba(255,106,0,${0.04 + i * 0.03})`,
                        border: `1.5px solid rgba(255,106,0,${0.15 + i * 0.05})`,
                      }}
                      data-ocid={`chat.streak_tier.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tier.emoji}</span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#1A1A2E" }}
                        >
                          {tier.days} days
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#FF6A00" }}
                      >
                        +{tier.pts.toLocaleString()} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image bonuses */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Camera
                    className="w-3.5 h-3.5"
                    style={{ color: "#FF6A00" }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Progress Images
                  </span>
                </div>
                <div className="space-y-1.5">
                  {IMAGE_BONUSES.map((bonus) => (
                    <div
                      key={bonus.label}
                      className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(255,106,0,0.05)",
                        border: "1px solid rgba(255,106,0,0.15)",
                      }}
                      data-ocid={`chat.image_bonus.${bonus.label}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{bonus.emoji}</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#1A1A2E" }}
                        >
                          {bonus.label}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#FF6A00" }}
                      >
                        +{bonus.pts} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referral Bonus */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm" style={{ color: "#FF6A00" }}>
                    👥
                  </span>
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Referral Bonus
                  </span>
                </div>
                <div className="space-y-1.5">
                  {REFERRAL_TIERS.map((tier, i) => (
                    <div
                      key={tier.rank}
                      className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{
                        background: `rgba(255,106,0,${0.04 + i * 0.03})`,
                        border: `1.5px solid rgba(255,106,0,${0.15 + i * 0.05})`,
                      }}
                      data-ocid={`chat.referral_tier.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{tier.emoji}</span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#1A1A2E" }}
                        >
                          {tier.rank}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#FF6A00" }}
                      >
                        +{tier.pts.toLocaleString()} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ChatPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isFetched: profileFetched } =
    useGetCallerUserProfile();
  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();
  const hasName = !!profile?.name?.trim();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [chatBg, setChatBg] = useState(CHAT_BACKGROUNDS[0].bg);
  const [showBgPicker, setShowBgPicker] = useState(false);

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

  useEffect(() => {
    if (messages && messages.length > 0 && !hasMarkedRef.current) {
      hasMarkedRef.current = true;
      markAsReadRef.current();
    }
  }, [messages]);

  // Show login modal if anonymous
  useEffect(() => {
    if (isAnonymous) setShowLoginModal(true);
  }, [isAnonymous]);

  // Show name modal after login if name not set
  useEffect(() => {
    if (!isAnonymous && profileFetched && !hasName) setShowNameModal(true);
  }, [isAnonymous, profileFetched, hasName]);

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
    <>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#FFFBF5" }}
      >
        <NavBar />

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                  boxShadow: "0 4px 16px rgba(255,106,0,0.3)",
                }}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "#1A1A2E" }}>
                  Chat with your Coach
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs" style={{ color: "#8B7355" }}>
                    Coach online · Responds 8am–11:59pm
                  </p>
                </div>
              </div>
              <div className="ml-auto">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(255,106,0,0.1)",
                    border: "1px solid rgba(255,106,0,0.2)",
                  }}
                >
                  <Sparkles
                    className="w-3.5 h-3.5"
                    style={{ color: "#FF6A00" }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#FF6A00" }}
                  >
                    Private &amp; Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Points summary card */}
            <div className="relative">
              <PointsSummaryCard />
            </div>

            {/* Bonus points guide */}
            <BonusPointsGuide />

            {/* Chat container */}
            <div
              className="flex-1 flex flex-col rounded-3xl overflow-hidden"
              style={{
                background: "#FFFFFF",
                border: "1px solid #F0E8DE",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                minHeight: "460px",
              }}
            >
              {/* Chat header bar */}
              <div
                className="relative flex items-center gap-3 px-5 py-3.5"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6A00 0%, #FF8C3A 100%)",
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">HN Coach</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <p className="text-white/80 text-xs">Online</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-white/80 text-xs">8am – 11:59pm</span>
                  </div>
                  {/* Background theme picker button */}
                  <button
                    type="button"
                    onClick={() => setShowBgPicker((v) => !v)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                    title="Change chat background"
                    data-ocid="chat.bg_picker.button"
                  >
                    <Palette className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                {/* Background theme picker panel */}
                {showBgPicker && (
                  <div
                    className="absolute top-full right-2 mt-1 z-20 rounded-2xl p-3 shadow-xl"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #F0E8DE",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    }}
                    data-ocid="chat.bg_picker.panel"
                  >
                    <p
                      className="text-xs font-semibold mb-2 px-1"
                      style={{ color: "#8B7355" }}
                    >
                      Chat Background
                    </p>
                    <div className="flex gap-2">
                      {CHAT_BACKGROUNDS.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setChatBg(theme.bg);
                            setShowBgPicker(false);
                          }}
                          className="flex flex-col items-center gap-1 group"
                          title={theme.label}
                          data-ocid={`chat.bg_theme.${theme.id}`}
                        >
                          <div
                            className="w-9 h-9 rounded-xl transition-all group-hover:scale-110"
                            style={{
                              background: theme.bg,
                              border:
                                chatBg === theme.bg
                                  ? "2.5px solid #FF6A00"
                                  : "2px solid #E5E7EB",
                              boxShadow:
                                chatBg === theme.bg
                                  ? "0 0 0 2px rgba(255,106,0,0.2)"
                                  : "none",
                            }}
                          />
                          <span
                            className="text-xs"
                            style={{
                              color:
                                chatBg === theme.bg ? "#FF6A00" : "#9CA3AF",
                              fontWeight: chatBg === theme.bg ? 600 : 400,
                            }}
                          >
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1"
                style={{
                  maxHeight: "calc(100vh - 420px)",
                  background: chatBg,
                }}
                data-ocid="chat.panel"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,106,0,0.1)" }}
                      >
                        <Loader2
                          className="w-5 h-5 animate-spin"
                          style={{ color: "#FF6A00" }}
                        />
                      </div>
                      <p className="text-sm" style={{ color: "#8B7355" }}>
                        Loading messages...
                      </p>
                    </div>
                  </div>
                ) : !hasMessages ? (
                  <div
                    className="flex flex-col items-center justify-center h-48 text-center"
                    data-ocid="chat.empty_state"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,106,0,0.12), rgba(255,140,58,0.12))",
                      }}
                    >
                      <MessageCircle
                        className="w-8 h-8"
                        style={{ color: "#FF6A00" }}
                      />
                    </motion.div>
                    <p
                      className="font-bold text-base"
                      style={{ color: "#1A1A2E" }}
                    >
                      Start the conversation!
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#8B7355" }}>
                      Your coach is ready for you 💪
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {groupedMessages.map((group) => (
                      <div key={group.date}>
                        <div className="flex items-center gap-3 my-5">
                          <div
                            className="flex-1 border-t"
                            style={{ borderColor: "#F0E8DE" }}
                          />
                          <span
                            className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{
                              background: "rgba(255,106,0,0.08)",
                              color: "#FF6A00",
                            }}
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
                          const isSystem =
                            msg.senderRole === SenderRole.coach &&
                            msg.message.startsWith("You earned");

                          if (isSystem) {
                            return (
                              <motion.div
                                key={`${msg.timestamp}-${i}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex justify-center mb-3"
                              >
                                <div
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, rgba(255,106,0,0.12), rgba(255,179,71,0.15))",
                                    border: "1.5px solid rgba(255,106,0,0.3)",
                                    color: "#FF6A00",
                                  }}
                                >
                                  <Star className="w-4 h-4" />
                                  <span>{msg.message}</span>
                                </div>
                              </motion.div>
                            );
                          }

                          return (
                            <motion.div
                              key={`${msg.timestamp}-${i}`}
                              initial={{ opacity: 0, y: 10, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.25 }}
                              className={`flex mb-3 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              {/* Coach avatar */}
                              {!isUser && (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end mb-5"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                                  }}
                                >
                                  <span className="text-white text-xs font-bold">
                                    HN
                                  </span>
                                </div>
                              )}

                              <div
                                className={`max-w-[78%] sm:max-w-[62%] ${
                                  isUser ? "items-end" : "items-start"
                                } flex flex-col`}
                              >
                                <div
                                  className="px-4 py-3 text-sm leading-relaxed"
                                  style={{
                                    background: isUser
                                      ? "linear-gradient(135deg, #FF6A00, #FF8C3A)"
                                      : "#F8F3EE",
                                    color: isUser ? "#FFFFFF" : "#1A1A2E",
                                    border: isUser
                                      ? "none"
                                      : "1px solid #EDE4D9",
                                    borderRadius: isUser
                                      ? "20px 20px 6px 20px"
                                      : "20px 20px 20px 6px",
                                    boxShadow: isUser
                                      ? "0 4px 16px rgba(255,106,0,0.25)"
                                      : "0 2px 8px rgba(0,0,0,0.05)",
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

                              {/* User avatar */}
                              {isUser && (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center ml-2 flex-shrink-0 self-end mb-5"
                                  style={{ background: "rgba(255,106,0,0.15)" }}
                                >
                                  <span
                                    className="text-xs font-bold"
                                    style={{ color: "#FF6A00" }}
                                  >
                                    Me
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Input area */}
              <div
                className="border-t p-4"
                style={{ background: "#FFFFFF", borderColor: "#F0E8DE" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                  data-ocid="chat.upload_button"
                />
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !storageClient}
                    className="w-11 h-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isUploading
                        ? "rgba(255,106,0,0.1)"
                        : "#F8F3EE",
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
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 rounded-2xl px-4 py-3 text-sm resize-none outline-none border transition-all min-h-[44px] max-h-32 overflow-y-auto"
                    style={{
                      background: "#F8F3EE",
                      borderColor: input ? "#FF6A00" : "#EDE4D9",
                      color: "#1A1A2E",
                      boxShadow: input
                        ? "0 0 0 3px rgba(255,106,0,0.1)"
                        : "none",
                    }}
                    data-ocid="chat.input"
                  />

                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || sendMessage.isPending}
                      className="w-11 h-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all"
                      style={{
                        background: input.trim()
                          ? "linear-gradient(135deg, #FF6A00, #FF8C3A)"
                          : "#E8E0D8",
                        boxShadow: input.trim()
                          ? "0 4px 16px rgba(255,106,0,0.35)"
                          : "none",
                      }}
                      data-ocid="chat.submit_button"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <p
                  className="text-xs mt-2 text-center"
                  style={{ color: "#C4B8A8" }}
                >
                  Enter to send · Shift+Enter for new line · Attach images or
                  PDFs
                </p>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>

      {/* Login modal — shown when anonymous */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={(open) => {
          setShowLoginModal(open);
          if (!open && isAnonymous) navigate({ to: "/" });
        }}
        reason="Sign in to chat with your coach."
      />

      {/* Name modal — shown after login if name not yet set */}
      <NameModal
        open={showNameModal}
        onComplete={() => setShowNameModal(false)}
      />
    </>
  );
}
