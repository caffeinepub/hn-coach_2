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
  "/assets/img_20260406_113714_095-019d6167-950e-75dc-b59a-be638032ee71.jpg",
  "/assets/img_20260406_113714_282-019d6167-969c-738e-b81a-1dc91812d5f3.jpg",
  "/assets/img_20260406_113714_505-019d6167-956b-7584-8c7c-d34d24adb0b0.jpg",
  "/assets/img_20260406_113714_523-019d6167-9259-7629-8e3a-dde5c4bdcb04.jpg",
  "/assets/img_20260406_113714_565-019d6167-939e-7699-9487-4eba4b39b0a9.jpg",
  "/assets/img_20260406_113714_671-019d6167-95c6-77d9-9116-ccc9ef8462c7.jpg",
  "/assets/img_20260406_113714_689-019d6167-9602-750d-9336-bde6631d4570.jpg",
  "/assets/img_20260406_120437-019d6188-5a0d-7059-a9b7-9a9efedd3bdb.jpg",
  "/assets/img_20260406_120343-019d6188-5ba5-7456-b920-4aeccecd0c2f.jpg",
  "/assets/img_20260406_120325-019d6188-5ea7-7339-ad34-4f49b45fe0ac.jpg",
  "/assets/img_20260406_120425-019d6188-5f20-7001-9f3d-3ef5ef1f56c9.jpg",
  "/assets/img_20260406_120353-019d6188-5f93-757c-b8bb-358203f1a1f0.jpg",
  "/assets/img_20260406_120407-019d6188-5fac-76f8-a334-8ec49db15a24.jpg",
  "/assets/img_20260406_120646_064-019d6188-60d9-77d7-9325-985f49a605e8.jpg",
];

const MARQUEE_IMAGES = [...TRANSFORMATION_IMAGES, ...TRANSFORMATION_IMAGES];

function TransformationsMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);
  const ITEM_WIDTH = 160;
  const TOTAL_WIDTH = ITEM_WIDTH * TRANSFORMATION_IMAGES.length;
  const SPEED = 0.5;

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
              background: "#FFFFFF",
            }}
          >
            <img
              src={src}
              alt={`Transformation ${(i % TRANSFORMATION_IMAGES.length) + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats bar
const STATS = [
  { value: "500+", label: "Clients Transformed" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "30", label: "Days to Results" },
  { value: "24/7", label: "Coach Support" },
];

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

      <main className="flex-1">
        {/* ── HERO SECTION ─────────────────────────────────────────────── */}
        <section
          className="w-full"
          style={{
            background:
              "linear-gradient(135deg, #FFFBF5 0%, #FFF3E8 50%, #FFFBF5 100%)",
            borderBottom: "1px solid #F0E8DE",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left: headline + CTA */}
              <motion.div
                className="flex-1 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{
                    background: "rgba(255,106,0,0.12)",
                    color: "#FF6A00",
                  }}
                >
                  ✨ Personal Wellness Coaching
                </span>

                {isAnonymous ? (
                  <>
                    <h1
                      className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-4"
                      style={{ color: "#1A1A2E" }}
                    >
                      Transform Your
                      <br />
                      <span style={{ color: "#FF6A00" }}>Health in 2026</span>
                    </h1>
                    <p className="text-base mb-8" style={{ color: "#6B7355" }}>
                      Expert coaching, personalised plans, and real results.
                      Your journey to a healthier you starts with one chat.
                    </p>
                  </>
                ) : (
                  <>
                    <h1
                      className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-4"
                      style={{ color: "#1A1A2E" }}
                    >
                      Ready to crush it,
                      <br />
                      <span style={{ color: "#FF6A00" }}>{firstName}!</span>
                    </h1>
                    <p className="text-base mb-8" style={{ color: "#6B7355" }}>
                      Your personal coaching dashboard — stay connected, stay on
                      track.
                    </p>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleCardClick}
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-base text-white transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                    boxShadow: "0 8px 24px rgba(255,106,0,0.35)",
                  }}
                  data-ocid="home.chat.hero.button"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat with your Coach
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Right: hero illustration */}
              <motion.div
                className="flex-1 flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
              >
                <img
                  src="/assets/generated/hero-coaching-chat.dim_600x500.png"
                  alt="Wellness coaching illustration"
                  className="w-full max-w-sm lg:max-w-md xl:max-w-lg drop-shadow-xl"
                  style={{ borderRadius: "24px" }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────────── */}
        <motion.section
          className="w-full py-6"
          style={{ background: "#FF6A00" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-display font-bold text-white">
                    {s.value}
                  </p>
                  <p
                    className="text-xs font-medium mt-0.5"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── STEPS SECTION ────────────────────────────────────────────── */}
        <section className="w-full py-14" style={{ background: "#FFFBF5" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                style={{
                  background: "rgba(255,106,0,0.1)",
                  color: "#FF6A00",
                }}
              >
                Your Journey
              </span>
              <h2
                className="text-2xl sm:text-3xl font-display font-bold"
                style={{ color: "#1A1A2E" }}
              >
                3 Steps to a Better You
              </h2>
              <p
                className="mt-2 text-sm max-w-md mx-auto"
                style={{ color: "#8B7355" }}
              >
                Follow these steps to get the most from your coaching
                experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="rounded-3xl overflow-hidden border group hover:shadow-xl transition-all duration-300"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#F0E8DE",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="h-44 overflow-hidden flex items-center justify-center"
                  style={{ background: "#FFF3E8" }}
                >
                  <img
                    src="/assets/generated/illus-wellness.dim_400x320.png"
                    alt="Wellness assessment illustration"
                    className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Step 1
                  </span>
                  <h3
                    className="text-base font-display font-bold mt-1 mb-2"
                    style={{ color: "#1A1A2E" }}
                  >
                    Wellness Assessment Report
                  </h3>
                  <p className="text-xs mb-4" style={{ color: "#8B7355" }}>
                    Get your personalized wellness report to understand where
                    you stand.
                  </p>
                  <a
                    href="https://hn-coach-wellness-report-by1.caffeine.xyz/?ref=9155348866"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all hover:opacity-90 hover:shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                      boxShadow: "0 3px 10px rgba(255,106,0,0.3)",
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Now
                  </a>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="rounded-3xl overflow-hidden border group hover:shadow-xl transition-all duration-300"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#F0E8DE",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="h-44 overflow-hidden flex items-center justify-center"
                  style={{ background: "#F0FDF4" }}
                >
                  <img
                    src="/assets/generated/illus-diet.dim_400x320.png"
                    alt="Diet plan illustration"
                    className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Step 2
                  </span>
                  <h3
                    className="text-base font-display font-bold mt-1 mb-2"
                    style={{ color: "#1A1A2E" }}
                  >
                    Personalized Diet Plan
                  </h3>
                  <p className="text-xs mb-4" style={{ color: "#8B7355" }}>
                    A tailored nutrition plan built for your body and your
                    goals.
                  </p>
                  <a
                    href="https://dietplan-hncoach-8m2.caffeine.xyz/admin?ref=9155348866"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all hover:opacity-90 hover:shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                      boxShadow: "0 3px 10px rgba(255,106,0,0.3)",
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Now
                  </a>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="rounded-3xl overflow-hidden border group hover:shadow-xl transition-all duration-300"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#F0E8DE",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="h-44 overflow-hidden flex items-center justify-center"
                  style={{ background: "#FFF8F0" }}
                >
                  <img
                    src="/assets/generated/illus-program.dim_400x320.png"
                    alt="Coaching program illustration"
                    className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#FF6A00" }}
                  >
                    Step 3 · 30 Days Money Back Guarantee
                  </span>
                  <h3
                    className="text-base font-display font-bold mt-1 mb-2"
                    style={{ color: "#1A1A2E" }}
                  >
                    Personal Coaching Program
                  </h3>
                  <p className="text-xs mb-4" style={{ color: "#8B7355" }}>
                    Join a proven 30-day program designed to build lasting
                    healthy habits.
                  </p>
                  <a
                    href="https://hn-coach-plans-jw1.caffeine.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all hover:opacity-90 hover:shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                      boxShadow: "0 3px 10px rgba(255,106,0,0.3)",
                    }}
                  >
                    Start Now <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ADMIN ACCESS ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center pb-8"
          style={{ background: "#FFFBF5" }}
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

        {/* ── OUR TRANSFORMATIONS ──────────────────────────────────────── */}
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
      </main>

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
