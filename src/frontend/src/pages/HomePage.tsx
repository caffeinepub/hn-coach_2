import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { LoginModal } from "../components/LoginModal";
import { NavBar } from "../components/NavBar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();

  const [showLoginModal, setShowLoginModal] = useState(false);
  // "chat" | "book" | null — remembers where the user wanted to go
  const [pendingDestination, setPendingDestination] = useState<
    "chat" | "book" | null
  >(null);

  // After login: navigate directly to the pending destination
  useEffect(() => {
    if (!isAnonymous && pendingDestination) {
      const dest = pendingDestination;
      setPendingDestination(null);
      navigate({ to: dest === "chat" ? "/chat" : "/book" });
    }
  }, [isAnonymous, pendingDestination, navigate]);

  const handleCardClick = (dest: "chat" | "book") => {
    if (isAnonymous) {
      setPendingDestination(dest);
      setShowLoginModal(true);
    } else {
      navigate({ to: dest === "chat" ? "/chat" : "/book" });
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
                Chat with your coach or book an appointment — sign in when
                you're ready.
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

        {/* Main action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              onClick={() => handleCardClick("chat")}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              type="button"
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border cursor-pointer group hover:shadow-lg transition-all duration-300 w-full text-left"
              style={{
                background: "#FFFFFF",
                borderColor: "#F0E8DE",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
              onClick={() => handleCardClick("book")}
              data-ocid="home.book.card"
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
                  <CalendarCheck
                    className="w-7 h-7"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
                <h2
                  className="text-xl font-display font-bold mb-2"
                  style={{ color: "#1A1A2E" }}
                >
                  Book an Appointment
                </h2>
                <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
                  Schedule a 40-minute 1-on-1 Zoom session with your coach. Pick
                  a date and time that works for you.
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                  style={{
                    background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                    boxShadow: "0 4px 12px rgba(255,106,0,0.3)",
                  }}
                >
                  Book Now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Login modal — shown when anonymous user clicks a card */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={(open) => {
          setShowLoginModal(open);
          if (!open) setPendingDestination(null);
        }}
        reason="Sign in to chat with your coach or book an appointment."
      />
    </div>
  );
}
