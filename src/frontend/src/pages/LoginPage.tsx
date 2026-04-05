import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Dumbbell,
  Heart,
  Leaf,
  Loader2,
  Lock,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const coachingTopics = [
  {
    icon: UtensilsCrossed,
    label: "Diet & Nutrition",
    desc: "Personalized meal plans and nutritional guidance",
  },
  {
    icon: Dumbbell,
    label: "Exercise Routines",
    desc: "Custom workouts tailored to your fitness level",
  },
  {
    icon: Leaf,
    label: "Lifestyle & Habits",
    desc: "Better routines, sleep habits, stress management",
  },
  {
    icon: Sparkles,
    label: "Overall Wellness",
    desc: "Holistic physical, mental, and emotional well-being",
  },
];

const features = [
  "Secure, passwordless authentication",
  "Personal coaching dashboard",
  "Direct messaging with your coach",
  "Easy appointment scheduling",
];

export function LoginPage() {
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/" });
    }
  }, [identity, navigate]);

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(145deg, #FFF8F0 0%, #FFFBF5 50%, #FFF3E8 100%)",
      }}
    >
      {/* ─── Left panel ──────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14"
        style={{
          background: "rgba(255,248,240,0.85)",
          borderRight: "1px solid #F0E8DE",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #FF6A00, #FF8C3A)" }}
          >
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span
            className="font-bold text-2xl tracking-tight"
            style={{ color: "#1A1A2E" }}
          >
            HN<span style={{ color: "#FF6A00" }}> Coach</span>
          </span>
        </div>

        {/* Main content */}
        <div className="space-y-12">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4" style={{ color: "#FF6A00" }} />
              <span
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: "#FF6A00" }}
              >
                Your Personal Coach
              </span>
            </div>
            <h1
              className="text-4xl font-bold leading-snug"
              style={{ color: "#1A1A2E" }}
            >
              Your coach is not less than{" "}
              <span
                style={{
                  color: "#FF6A00",
                  fontStyle: "italic",
                }}
              >
                your best friend
              </span>
            </h1>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: "#8B7355" }}
            >
              Ask from your heart — we&apos;re here to listen, guide, and grow
              with you.
            </p>
          </motion.div>

          {/* Coaching topic cards */}
          <div className="grid grid-cols-2 gap-4">
            {coachingTopics.map((topic, i) => (
              <motion.div
                key={topic.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="p-5 rounded-2xl border bg-white"
                style={{
                  borderColor: "#F0E8DE",
                  boxShadow: "0 2px 12px rgba(255,106,0,0.06)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(255,106,0,0.1)" }}
                >
                  <topic.icon
                    className="w-5 h-5"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: "#1A1A2E" }}
                >
                  {topic.label}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#8B7355" }}
                >
                  {topic.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Privacy badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
            style={{
              background: "rgba(255,106,0,0.06)",
              borderColor: "rgba(255,106,0,0.25)",
            }}
          >
            <Lock
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#FF6A00" }}
            />
            <span className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
              100% Confidential Chat &nbsp;&middot;&nbsp; 100% Privacy 🔏
            </span>
          </motion.div>
        </div>

        <p className="text-xs" style={{ color: "#A89078" }}>
          &copy; {new Date().getFullYear()} HN Coach. All rights reserved.
        </p>
      </div>

      {/* ─── Right panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{
                background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
              }}
            >
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span
              className="font-bold text-xl tracking-tight"
              style={{ color: "#1A1A2E" }}
            >
              HN<span style={{ color: "#FF6A00" }}> Coach</span>
            </span>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl border overflow-hidden"
            style={{
              background: "#FFFFFF",
              borderColor: "#F0E8DE",
              boxShadow:
                "0 20px 60px rgba(255,106,0,0.1), 0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            {/* Card top accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: "linear-gradient(90deg, #FF6A00, #FF8C3A, #FFAB6E)",
              }}
            />

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "rgba(255,106,0,0.1)",
                    border: "1px solid rgba(255,106,0,0.2)",
                  }}
                >
                  <MessageCircleHeart
                    className="w-7 h-7"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: "#1A1A2E" }}
                >
                  Welcome Back!
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#8B7355" }}
                >
                  Sign in to connect with your personal wellness coach
                </p>
              </div>

              {/* Feature list — mobile only */}
              <div className="mb-6 lg:hidden">
                <div className="space-y-2.5">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "#FF6A00" }}
                      />
                      <span className="text-xs" style={{ color: "#6B5E4E" }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider — mobile only */}
              <div
                className="w-full border-t mb-6 lg:hidden"
                style={{ borderColor: "#F0E8DE" }}
              />

              {/* Topic pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-7">
                {["Diet", "Exercise", "Lifestyle", "Wellness"].map((pill) => (
                  <span
                    key={pill}
                    className="px-3.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(255,106,0,0.1)",
                      color: "#FF6A00",
                      border: "1px solid rgba(255,106,0,0.22)",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="w-full h-13 text-base font-bold text-white rounded-xl mb-4 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                  boxShadow: "0 8px 24px rgba(255,106,0,0.35)",
                  height: "52px",
                }}
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 my-5">
                <div
                  className="flex-1 border-t"
                  style={{ borderColor: "#F0E8DE" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#A89078" }}
                >
                  Are you a coach?
                </span>
                <div
                  className="flex-1 border-t"
                  style={{ borderColor: "#F0E8DE" }}
                />
              </div>

              {/* Admin link */}
              <Link to="/admin">
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-semibold rounded-xl flex items-center gap-2"
                  style={{
                    borderColor: "#EDE4D9",
                    color: "#6B5E4E",
                    background: "#FAFAF8",
                    height: "48px",
                  }}
                  data-ocid="login.admin.link"
                >
                  <ShieldCheck
                    className="w-4 h-4"
                    style={{ color: "#FF6A00" }}
                  />
                  Access Admin Panel
                </Button>
              </Link>

              {/* Footer note */}
              <p
                className="mt-6 text-xs text-center"
                style={{ color: "#A89078" }}
              >
                Powered by Internet Identity — secure, passwordless auth
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
