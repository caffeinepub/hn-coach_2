import { useNavigate } from "@tanstack/react-router";
import { Dumbbell, ShieldCheck } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer
      className="mt-auto border-t"
      style={{ background: "#FFFBF5", borderColor: "#F0E8DE" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
              }}
            >
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-display font-bold"
              style={{ color: "#1A1A2E" }}
            >
              HN<span style={{ color: "#FF6A00" }}> Coach</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              className="flex items-center gap-1.5 text-xs hover:underline transition-colors"
              style={{ color: "#B0A090" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Coach Admin
            </button>

            <p className="text-sm" style={{ color: "#8B7355" }}>
              &copy; {year} HN Coach. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
