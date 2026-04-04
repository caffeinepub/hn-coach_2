import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Dumbbell, Loader2, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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
      {/* Left panel - branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "#071824" }}
      >
        <div className="flex items-center gap-3">
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

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-display font-bold text-white leading-tight">
              Transform Your
              <br />
              <span style={{ color: "#FF6A00" }}>Fitness Journey</span>
            </h1>
            <p className="mt-4 text-lg" style={{ color: "#A8B6C3" }}>
              Personal coaching, scheduling, and real-time communication — all
              in one place.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                icon: Zap,
                title: "1-on-1 Coaching",
                desc: "Direct messaging with your personal coach",
              },
              {
                icon: Target,
                title: "Goal Tracking",
                desc: "Set targets and measure your progress",
              },
              {
                icon: TrendingUp,
                title: "Book Sessions",
                desc: "Schedule 40-min Zoom calls with ease",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: "#112A3A" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,106,0,0.15)" }}
                >
                  <item.icon className="w-5 h-5" style={{ color: "#FF6A00" }} />
                </div>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm mt-0.5" style={{ color: "#A8B6C3" }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-sm" style={{ color: "#A8B6C3" }}>
          &copy; {new Date().getFullYear()} HN Coach. All rights reserved.
        </p>
      </div>

      {/* Right panel - login form */}
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
            <span className="text-white font-display font-bold text-xl">
              HN<span style={{ color: "#FF6A00" }}> Coach</span>
            </span>
          </div>

          <div
            className="rounded-2xl p-8 border border-hnc-border shadow-card"
            style={{ background: "#112A3A" }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-white">
                Welcome back
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#A8B6C3" }}>
                Sign in to access your coaching dashboard
              </p>
            </div>

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
                  <div className="w-full border-t border-hnc-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span
                    className="px-2 text-hnc-muted"
                    style={{ background: "#112A3A" }}
                  >
                    New to HN Coach?
                  </span>
                </div>
              </div>

              <Link to="/signup">
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-semibold rounded-xl"
                  style={{
                    borderColor: "#FF6A00",
                    color: "#FF6A00",
                    background: "transparent",
                  }}
                  data-ocid="login.signup.link"
                >
                  Create Account
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
