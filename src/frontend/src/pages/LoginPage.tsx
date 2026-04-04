import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Dumbbell, Loader2, ShieldCheck } from "lucide-react";
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
              Get started
            </h1>
            <p className="mt-4 text-lg" style={{ color: "#A8B6C3" }}>
              Create your account to begin your coaching journey
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              "Secure, passwordless authentication",
              "Personal coaching dashboard",
              "Direct messaging with your coach",
              "Easy appointment scheduling",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "#112A3A" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,106,0,0.15)" }}
                >
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: "#FF6A00" }}
                  />
                </div>
                <p className="font-medium text-white">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-sm" style={{ color: "#A8B6C3" }}>
          &copy; {new Date().getFullYear()} HN Coach. All rights reserved.
        </p>
      </div>

      {/* Right panel - sign in form */}
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
                Get started
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#A8B6C3" }}>
                Create your account to begin your coaching journey
              </p>
            </div>

            {/* Features - mobile only */}
            <div className="space-y-3 mb-8 lg:hidden">
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
