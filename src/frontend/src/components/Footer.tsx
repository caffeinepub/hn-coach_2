import { Dumbbell } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

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
          <p className="text-sm" style={{ color: "#8B7355" }}>
            &copy; {year}. Built with{" "}
            <span style={{ color: "#FF6A00" }}>♥</span> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "#FF6A00" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
