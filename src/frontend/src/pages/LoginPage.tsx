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
    desc: "Personalized meal plans, healthy eating habits, and nutritional guidance",
  },
  {
    icon: Dumbbell,
    label: "Exercise Routines",
    desc: "Custom workout plans tailored to your body, goals, and fitness level",
  },
  {
    icon: Leaf,
    label: "Lifestyle & Habits",
    desc: "Build better daily routines, sleep habits, stress management",
  },
  {
    icon: Sparkles,
    label: "Overall Wellness",
    desc: "Holistic approach to physical, mental, and emotional well-being",
  },
];

const topicPills = ["Diet", "Exercise", "Lifestyle", "Wellness"];

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
        background: "linear-gradient(135deg, #071824 0%, #0B2232 100%)",
      }}
    >
      {/* ─── Left panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "#071824" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#FF6A00" }}
          >
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-2xl">
            HN<span style={{ color: "#FF6A00" }}> Coach</span>
          </span>
        </div>

        {/* Main content */}
        <div className="space-y-10">
          {/* Emotional tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5" style={{ color: "#FF6A00" }} />
              <span
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: "#FF6A00" }}
              >
                Your personal coach
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Your personal coach is not less than{" "}
              <span style={{ color: "#FF6A00" }}>your best friend</span>
            </h1>
            <p className="mt-4 text-base" style={{ color: "#A8B6C3" }}>
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
                className="p-4 rounded-xl border"
                style={{
                  background: "#112A3A",
                  borderColor: "#1E3A4A",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: "rgba(255,106,0,0.15)" }}
                >
                  <topic.icon
                    className="w-5 h-5"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
                <p className="font-semibold text-white text-sm mb-1">
                  {topic.label}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#A8B6C3" }}
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
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: "#1E3A4A", borderColor: "#2A4F63" }}
          >
            <Lock
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#FF6A00" }}
            />
            <span className="text-sm font-medium text-white">
              100% Confidential Chat &nbsp;·&nbsp; 100% Privacy 🔏
            </span>
          </motion.div>
        </div>

        <p className="text-sm" style={{ color: "#A8B6C3" }}>
          &copy; {new Date().getFullYear()} HN Coach. All rights reserved.
        </p>
      </div>

      {/* ─── Right panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#FF6A00" }}
            >
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">
              HN<span style={{ color: "#FF6A00" }}> Coach</span>
            </span>
          </div>

          <div
            className="rounded-2xl p-8 border shadow-card"
            style={{ background: "#112A3A", borderColor: "#1E3A4A" }}
          >
            {/* Emotional header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircleHeart
                  className="w-5 h-5"
                  style={{ color: "#FF6A00" }}
                />
                <h2 className="text-2xl font-bold text-white">
                  Ask from your heart 💬
                </h2>
              </div>
              <p className="text-sm" style={{ color: "#A8B6C3" }}>
                Share your goals, struggles, diet, exercise routines, lifestyle
                — your coach is your trusted companion
              </p>

              {/* Privacy row */}
              <div className="flex items-center gap-2 mt-3">
                <Lock
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#FF6A00" }}
                />
                <span className="text-xs" style={{ color: "#A8B6C3" }}>
                  100% Confidential &nbsp;·&nbsp; 100% Private 🔏
                </span>
              </div>

              {/* Topic pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {topicPills.map((pill) => (
                  <span
                    key={pill}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "#1E3A4A", color: "#FF6A00" }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile – emotional tagline */}
            <div className="mb-6 lg:hidden space-y-3">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: "#1E3A4A", borderColor: "#2A4F63" }}
              >
                <Lock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#FF6A00" }}
                />
                <span className="text-xs font-medium text-white">
                  100% Confidential Chat &nbsp;·&nbsp; 100% Privacy 🔏
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                Your personal coach is not less than{" "}
                <span style={{ color: "#FF6A00" }}>your best friend</span>
              </p>
              <div className="space-y-2">
                {[
                  "Secure, passwordless authentication",
                  "Personal coaching dashboard",
                  "Direct messaging with your coach",
                  "Easy appointment scheduling",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#FF6A00" }}
                    />
                    <span className="text-xs" style={{ color: "#A8B6C3" }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full border-t mb-6"
              style={{ borderColor: "#1E3A4A" }}
            />

            <div className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="w-full h-12 text-base font-semibold text-white rounded-xl"
                style={{ background: "#FF6A00" }}
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  "Sign In with Internet Identity"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: "#1E3A4A" }}
                  />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span
                    className="px-2"
                    style={{ color: "#A8B6C3", background: "#112A3A" }}
                  >
                    Are you a coach?
                  </span>
                </div>
              </div>

              <Link to="/admin">
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-semibold rounded-xl flex items-center gap-2"
                  style={{
                    borderColor: "#1E3A4A",
                    color: "#A8B6C3",
                    background: "transparent",
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
            </div>

            <p
              className="mt-6 text-xs text-center"
              style={{ color: "#A8B6C3" }}
            >
              Powered by Internet Identity &mdash; secure, passwordless
              authentication
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
