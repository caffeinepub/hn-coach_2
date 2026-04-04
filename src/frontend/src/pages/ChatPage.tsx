import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Camera,
  ChevronDown,
  Clock,
  FileText,
  Flame,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageType, SenderRole } from "../backend";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { loadConfig } from "../config";
import { useActor } from "../hooks/useActor";
import {
  useGetCallerPoints,
  useGetCallerStreak,
  useGetMessageHistory,
  useMarkMessagesAsRead,
  useRecordActivity,
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
      style={{ border: "1px solid #203B4D" }}
    />
  );
}

function PointsSummaryCard() {
  const { data: totalPoints, isLoading } = useGetCallerPoints();

  const total = Number(totalPoints ?? BigInt(0));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl px-4 py-3 mb-3"
      style={{
        background: "#112A3A",
        border: "1px solid #203B4D",
      }}
      data-ocid="chat.points.card"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: "#FF6A00" }}
          />
          <span className="text-xs" style={{ color: "#A8B6C3" }}>
            Loading points...
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "#FF6A00" }} />
          <span className="text-sm font-semibold text-white">Your Points:</span>
          <span className="text-base font-bold" style={{ color: "#FF6A00" }}>
            {total} pts
          </span>
        </div>
      )}
    </motion.div>
  );
}

const STREAK_MILESTONES = [
  { days: 7, pts: 500 },
  { days: 14, pts: 1000 },
  { days: 21, pts: 1500 },
  { days: 28, pts: 2000 },
];

function getMilestoneBonus(days: number): number {
  for (const m of STREAK_MILESTONES) {
    if (days <= m.days) return m.pts;
  }
  return STREAK_MILESTONES[STREAK_MILESTONES.length - 1].pts;
}

function StreakTrackerCard() {
  const { data: streak, isLoading } = useGetCallerStreak();
  const recordActivity = useRecordActivity();
  const recordActivityRef = useRef(recordActivity.mutate);
  recordActivityRef.current = recordActivity.mutate;

  // Record activity on mount (fire-and-forget)
  useEffect(() => {
    try {
      recordActivityRef.current();
    } catch {
      // silently ignore
    }
  }, []);

  const currentStreak = Number(streak?.currentStreak ?? BigInt(0));
  const nextMilestone = Number(streak?.nextMilestone ?? BigInt(7));
  const daysToNext = Number(streak?.daysToNext ?? BigInt(7));
  const milestoneBonus = getMilestoneBonus(nextMilestone);

  const progressPct = Math.min(
    100,
    nextMilestone > 0 ? (currentStreak / nextMilestone) * 100 : 100,
  );

  const milestoneReached = daysToNext === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-xl px-4 py-3 mb-3"
      style={{
        background: "#112A3A",
        border: "1px solid #203B4D",
      }}
      data-ocid="chat.streak.card"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: "#FF6A00" }}
          />
          <span className="text-xs" style={{ color: "#A8B6C3" }}>
            Loading streak...
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: "#FF6A00" }} />
              <span className="text-sm font-bold text-white">
                🔥{" "}
                {currentStreak === 1
                  ? "1 Day Streak"
                  : `${currentStreak} Day Streak`}
              </span>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,106,0,0.12)",
                border: "1px solid rgba(255,106,0,0.25)",
                color: "#FFA560",
              }}
            >
              Next: {nextMilestone} days → +{milestoneBonus.toLocaleString()}{" "}
              pts
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 rounded-full overflow-hidden w-full"
            style={{ background: "#0D2030" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "#FF6A00" }}
            />
          </div>

          {/* Status text */}
          <p className="text-xs" style={{ color: "#A8B6C3" }}>
            {milestoneReached ? (
              <span style={{ color: "#FF6A00" }}>
                🎉 Milestone reached! Keep it up!
              </span>
            ) : (
              <>
                <span style={{ color: "#FFA560" }}>
                  {daysToNext} days to go
                </span>{" "}
                for a{" "}
                <span style={{ color: "#FF6A00" }} className="font-semibold">
                  +{milestoneBonus.toLocaleString()} pts
                </span>{" "}
                streak bonus
              </>
            )}
          </p>
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
  { label: "Before Image", pts: 250 },
  { label: "After Image", pts: 250 },
];

function BonusPointsGuide() {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      className="rounded-xl mb-5 overflow-hidden"
      style={{ background: "#112A3A", border: "1px solid #203B4D" }}
      data-ocid="chat.bonus_guide.card"
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
        data-ocid="chat.bonus_guide.toggle"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "#FF6A00" }} />
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: "#A8B6C3" }}
          >
            🎯 How to Earn Bonus Points
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: "#A8B6C3" }} />
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
                  <Flame className="w-3.5 h-3.5" style={{ color: "#FF6A00" }} />
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
                          background: `rgba(255,106,0,${intensity * 0.12})`,
                          border: `1px solid rgba(255,106,0,${intensity * 0.3})`,
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
                          <span className="text-xs font-medium text-white">
                            {tier.days} days
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{
                            color: `rgba(255,${130 + i * 20},${0 + i * 10},1)`,
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
                        background: "rgba(255,106,0,0.07)",
                        border: "1px solid rgba(255,106,0,0.18)",
                      }}
                      data-ocid={`chat.image_bonus.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{i === 0 ? "📸" : "🖼️"}</span>
                        <span className="text-xs font-medium text-white">
                          {bonus.label}
                        </span>
                      </div>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{ color: "#FFA560" }}
                      >
                        +{bonus.pts} pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* Motivational note */}
                <p
                  className="text-xs mt-2 leading-relaxed"
                  style={{ color: "#A8B6C3" }}
                >
                  Share your before &amp; after progress photos with your coach
                  to earn bonus points and track your transformation! 💪
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        style={{ background: "#0B2232" }}
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
                style={{ background: "rgba(255,106,0,0.15)" }}
              >
                <MessageCircle
                  className="w-5 h-5"
                  style={{ color: "#FF6A00" }}
                />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">
                  Chat with your Coach
                </h1>
                <p className="text-sm" style={{ color: "#A8B6C3" }}>
                  Your messages are private and secure
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs" style={{ color: "#A8B6C3" }}>
                  Coach online
                </span>
              </div>
            </div>

            {/* Points summary card */}
            <PointsSummaryCard />

            {/* Streak tracker card */}
            <StreakTrackerCard />

            {/* Bonus points guide */}
            <BonusPointsGuide />

            {/* Chat container */}
            <div
              className="flex-1 flex flex-col rounded-2xl border border-hnc-border shadow-card overflow-hidden"
              style={{ background: "#112A3A", minHeight: "500px" }}
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
                      className="w-12 h-12 mb-3 opacity-30"
                      style={{ color: "#FF6A00" }}
                    />
                    <p className="font-medium text-white">No messages yet</p>
                    <p className="text-sm mt-1" style={{ color: "#A8B6C3" }}>
                      Say hello to your coach!
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {groupedMessages.map((group) => (
                      <div key={group.date}>
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 border-t border-hnc-border" />
                          <span
                            className="text-xs px-2"
                            style={{ color: "#A8B6C3" }}
                          >
                            {group.date}
                          </span>
                          <div className="flex-1 border-t border-hnc-border" />
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
                                  className="px-4 py-3 rounded-2xl text-sm text-white leading-relaxed"
                                  style={{
                                    background: isUser ? "#FF6A00" : "#1A3A4F",
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
                                  style={{ color: "#A8B6C3" }}
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
                  background: "rgba(255, 106, 0, 0.08)",
                  border: "1px solid rgba(255, 106, 0, 0.22)",
                }}
              >
                <Clock
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#FF8C38" }}
                />
                <p className="text-xs font-medium" style={{ color: "#FF8C38" }}>
                  We will respond shortly{" "}
                  <span style={{ color: "#FFA560" }}>
                    (Morning 8am to 11:59pm)
                  </span>
                </p>
              </div>

              {/* Input area */}
              <div
                className="border-t border-hnc-border p-4"
                style={{ background: "#0B2232" }}
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
                      background: "#1A3A4F",
                      border: "1px solid #203B4D",
                      color: isUploading ? "#FF6A00" : "#A8B6C3",
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
                    className="flex-1 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none border border-hnc-border focus:border-orange-400 transition-colors min-h-[44px] max-h-32 overflow-y-auto"
                    style={{ background: "#1A3A4F", color: "white" }}
                    data-ocid="chat.input"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || sendMessage.isPending}
                    className="w-11 h-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: "#FF6A00" }}
                    data-ocid="chat.submit_button"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs mt-2" style={{ color: "#A8B6C3" }}>
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
