import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Download, MessageCircle, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { LoginModal } from "../components/LoginModal";
import { NavBar } from "../components/NavBar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

const TRANSFORMATION_IMAGES = [
  "/assets/img_20260406_113710_515-019d6167-907b-7652-b337-d3cb7b4bc85c.jpg",
  "/assets/img_20260406_113709_836-019d6167-9128-732d-9d33-2d1abeebff45.jpg",
  "/assets/img_20260406_113714_523-019d6167-9259-7629-8e3a-dde5c4bdcb04.jpg",
  "/assets/img_20260406_113709_945-019d6167-9343-73e8-90c3-8b2c9de01103.jpg",
  "/assets/img_20260406_113714_565-019d6167-939e-7699-9487-4eba4b39b0a9.jpg",
  "/assets/img_20260406_113710_269-019d6167-9429-755b-a2fd-d0b5785c0161.jpg",
  "/assets/img_20260406_113710_240-019d6167-94ef-760a-a84d-fadcbc89edbf.jpg",
  "/assets/img_20260406_113714_505-019d6167-956b-7584-8c7c-d34d24adb0b0.jpg",
  "/assets/img_20260406_113714_671-019d6167-95c6-77d9-9116-ccc9ef8462c7.jpg",
  "/assets/img_20260406_113714_689-019d6167-9602-750d-9336-bde6631d4570.jpg",
  "/assets/img_20260406_113714_095-019d6167-950e-75dc-b59a-be638032ee71.jpg",
  "/assets/img_20260406_113714_282-019d6167-969c-738e-b81a-1dc91812d5f3.jpg",
];

// Duplicate for seamless infinite loop
const MARQUEE_IMAGES = [...TRANSFORMATION_IMAGES, ...TRANSFORMATION_IMAGES];

function TransformationsMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);
  const ITEM_WIDTH = 160; // px per image including gap
  const TOTAL_WIDTH = ITEM_WIDTH * TRANSFORMATION_IMAGES.length;
  const SPEED = 0.5; // px per frame

  useEffect(() => {
    const animate = () => {
      posRef.current += SPEED;
      if (posRef.current >= TOTAL_WIDTH) {
        posRef.current = 0;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [TOTAL_WIDTH]);

  return (
    <div
      className="overflow-hidden w-full"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-4 will-change-transform"
        style={{ width: `${ITEM_WIDTH * MARQUEE_IMAGES.length}px` }}
      >
        {MARQUEE_IMAGES.map((src, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={i}
            className="flex-shrink-0 rounded-2xl overflow-hidden"
            style={{
              width: "144px",
              height: "144px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              border: "2px solid #F0E8DE",
            }}
          >
            <img
              src={src}
              alt={`Transformation ${(i % TRANSFORMATION_IMAGES.length) + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 30%",
                transform: "scale(1.6)",
                transformOrigin: "center 35%",
              }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<"chat" | null>(
    null,
  );

  useEffect(() => {
    if (!isAnonymous && pendingDestination) {
      setPendingDestination(null);
      navigate({ to: "/chat" });
    }
  }, [isAnonymous, pendingDestination, navigate]);

  const handleCardClick = () => {
    if (isAnonymous) {
      setPendingDestination("chat");
      setShowLoginModal(true);
    } else {
      navigate({ to: "/chat" });
    }
  };

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FFFBF5" }}
    >
      <NavBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          {isAnonymous ? (
            <>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "#FF6A00" }}
              >
                Welcome ✨
              </p>
              <h1
                className="text-3xl sm:text-4xl font-display font-bold leading-tight"
                style={{ color: "#1A1A2E" }}
              >
                Your personal wellness
                <br />
                <span style={{ color: "#FF6A00" }}>
                  coaching journey starts here
                </span>
              </h1>
              <p className="mt-3 text-base" style={{ color: "#8B7355" }}>
                Chat with your coach — sign in when you're ready.
              </p>
            </>
          ) : (
            <>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "#FF6A00" }}
              >
                Welcome back ✨
              </p>
              <h1
                className="text-3xl sm:text-4xl font-display font-bold leading-tight"
                style={{ color: "#1A1A2E" }}
              >
                Ready to crush it,
                <br />
                <span style={{ color: "#FF6A00" }}>{firstName}!</span>
              </h1>
              <p className="mt-3 text-base" style={{ color: "#8B7355" }}>
                Your personal coaching dashboard — stay connected, stay on
                track.
              </p>
            </>
          )}
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 max-w-lg gap-6">
          {/* Chat with Coach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              type="button"
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border cursor-pointer group hover:shadow-lg transition-all duration-300 w-full text-left"
              style={{
                background: "#FFFFFF",
                borderColor: "#F0E8DE",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
              onClick={handleCardClick}
              data-ocid="home.chat.card"
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 translate-x-8 -translate-y-8"
                style={{ background: "#FF6A00" }}
              />
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,106,0,0.1)" }}
                >
                  <MessageCircle
                    className="w-7 h-7"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
                <h2
                  className="text-xl font-display font-bold mb-2"
                  style={{ color: "#1A1A2E" }}
                >
                  Chat with your Coach
                </h2>
                <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
                  Send messages to your personal coach anytime. Get guidance,
                  tips, and motivation delivered straight to you.
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                  style={{
                    background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                    boxShadow: "0 4px 12px rgba(255,106,0,0.3)",
                  }}
                >
                  Open Chat <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </motion.div>

          {/* Step 1 — Wellness Assessment Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className="rounded-2xl p-4 border flex items-center justify-between gap-4"
              style={{
                background: "#FFFFFF",
                borderColor: "#F0E8DE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,106,0,0.1)" }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#FF6A00" }}
                  >
                    1
                  </span>
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#8B7355" }}
                  >
                    Step 1
                  </p>
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "#1A1A2E" }}
                  >
                    Wellness Assessment Report
                  </p>
                </div>
              </div>
              <a
                href="https://hn-coach-wellness-report-by1.caffeine.xyz/?ref=9155348866"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                  boxShadow: "0 3px 8px rgba(255,106,0,0.25)",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Download Now
              </a>
            </div>
          </motion.div>

          {/* Step 2 — Personalized Diet Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="rounded-2xl p-4 border flex items-center justify-between gap-4"
              style={{
                background: "#FFFFFF",
                borderColor: "#F0E8DE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,106,0,0.1)" }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#FF6A00" }}
                  >
                    2
                  </span>
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#8B7355" }}
                  >
                    Step 2
                  </p>
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "#1A1A2E" }}
                  >
                    Personalized Diet Plan
                  </p>
                </div>
              </div>
              <a
                href="https://dietplan-hncoach-8m2.caffeine.xyz/admin?ref=9155348866"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                  boxShadow: "0 3px 8px rgba(255,106,0,0.25)",
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Download Now
              </a>
            </div>
          </motion.div>

          {/* Step 3 — Personal Coaching Program */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div
              className="rounded-2xl p-4 border flex items-center justify-between gap-4"
              style={{
                background: "#FFFFFF",
                borderColor: "#F0E8DE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,106,0,0.1)" }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#FF6A00" }}
                  >
                    3
                  </span>
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#8B7355" }}
                  >
                    Step 3 · 30 Days Money Back Guarantee
                  </p>
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "#1A1A2E" }}
                  >
                    Personal Coaching Program
                  </p>
                </div>
              </div>
              <a
                href="https://hn-coach-plans-jw1.caffeine.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                  boxShadow: "0 3px 8px rgba(255,106,0,0.25)",
                }}
              >
                Start Now <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Admin Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center mt-10"
        >
          <button
            type="button"
            onClick={() => {
              window.location.href = "/admin";
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:shadow-sm hover:bg-gray-50"
            style={{
              color: "#6B7280",
              borderColor: "#D1D5DB",
              background: "transparent",
            }}
            data-ocid="home.admin.button"
          >
            <Shield className="w-4 h-4" />
            Admin Access
          </button>
        </motion.div>
      </main>

      {/* Our Transformations Section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full py-12"
        style={{ background: "#FFFFFF", borderTop: "1px solid #F0E8DE" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col items-center text-center">
            <span
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#FF6A00" }}
            >
              Real Results
            </span>
            <h2
              className="text-2xl sm:text-3xl font-display font-bold"
              style={{ color: "#1A1A2E" }}
            >
              Our Transformations
            </h2>
            <p className="mt-2 text-sm max-w-md" style={{ color: "#8B7355" }}>
              Real people. Real results. See the incredible journeys of our
              coaching community.
            </p>
          </div>
        </div>
        <TransformationsMarquee />
      </motion.section>

      <Footer />

      <LoginModal
        open={showLoginModal}
        onOpenChange={(open) => {
          setShowLoginModal(open);
          if (!open) setPendingDestination(null);
        }}
        reason="Sign in to chat with your coach."
      />
    </div>
  );
}
