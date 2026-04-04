import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Dumbbell, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function SignupPage() {
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
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #071824 0%, #0B2232 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8">
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
              Get started
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#A8B6C3" }}>
              Create your account to begin your coaching journey
            </p>
          </div>

          <div className="space-y-3 mb-8">
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
                <span className="text-sm" style={{ color: "#A8B6C3" }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full h-12 text-base font-semibold text-white rounded-xl"
              style={{ background: "#FF6A00" }}
              data-ocid="signup.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Connecting...
                </>
              ) : (
                "Sign Up with Internet Identity"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hnc-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className="px-2"
                  style={{ color: "#A8B6C3", background: "#112A3A" }}
                >
                  Already have an account?
                </span>
              </div>
            </div>

            <Link to="/login">
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-semibold rounded-xl"
                style={{
                  borderColor: "#FF6A00",
                  color: "#FF6A00",
                  background: "transparent",
                }}
                data-ocid="signup.login.link"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-center" style={{ color: "#A8B6C3" }}>
            Internet Identity uses WebAuthn to keep your identity secure and
            private.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
