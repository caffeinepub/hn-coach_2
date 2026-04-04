import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Flame,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export function HomePage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();

  const firstName = profile?.name?.split(" ")[0] || "Athlete";

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#0B2232" }}
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
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#FF6A00" }}
            >
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
              Ready to crush it,
              <br />
              <span style={{ color: "#FF6A00" }}>{firstName}?</span>
            </h1>
            <p className="mt-3 text-base" style={{ color: "#A8B6C3" }}>
              Your personal coaching dashboard — stay connected, stay on track.
            </p>
          </motion.div>

          {/* Main action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                type="button"
                className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-hnc-border shadow-card cursor-pointer group hover:border-orange-400 transition-all duration-300 w-full text-left"
                style={{ background: "#112A3A" }}
                onClick={() => navigate({ to: "/chat" })}
                data-ocid="home.chat.card"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 translate-x-8 -translate-y-8"
                  style={{ background: "#FF6A00" }}
                />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(255,106,0,0.15)" }}
                  >
                    <MessageCircle
                      className="w-7 h-7"
                      style={{ color: "#FF6A00" }}
                    />
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">
                    Chat with your Coach
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#A8B6C3" }}>
                    Send messages to your personal coach anytime. Get guidance,
                    tips, and motivation delivered straight to you.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                    style={{ background: "#FF6A00" }}
                  >
                    Open Chat <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                type="button"
                className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-hnc-border shadow-card cursor-pointer group hover:border-orange-400 transition-all duration-300 w-full text-left"
                style={{ background: "#112A3A" }}
                onClick={() => navigate({ to: "/book" })}
                data-ocid="home.book.card"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 translate-x-8 -translate-y-8"
                  style={{ background: "#FF6A00" }}
                />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(255,106,0,0.15)" }}
                  >
                    <CalendarCheck
                      className="w-7 h-7"
                      style={{ color: "#FF6A00" }}
                    />
                  </div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">
                    Book an Appointment
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "#A8B6C3" }}>
                    Schedule a 40-minute 1-on-1 Zoom session with your coach.
                    Pick a date and time that works for you.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                    style={{ background: "#FF6A00" }}
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: Flame,
                label: "Streak",
                value: "7 days",
                desc: "Keep it going!",
              },
              {
                icon: Trophy,
                label: "Goal",
                value: profile?.targetGoal || "Not set",
                desc: "Your current target",
              },
              {
                icon: Users,
                label: "Coach",
                value: "HN Coach",
                desc: "Your personal trainer",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-5 border border-hnc-border"
                style={{ background: "#112A3A" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,106,0,0.15)" }}
                  >
                    <stat.icon
                      className="w-5 h-5"
                      style={{ color: "#FF6A00" }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "#A8B6C3" }}
                  >
                    {stat.label}
                  </span>
                </div>
                <p className="text-lg font-display font-bold text-white truncate">
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#A8B6C3" }}>
                  {stat.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
