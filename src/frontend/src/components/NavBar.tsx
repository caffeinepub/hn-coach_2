import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Download, Dumbbell, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUnreadCount,
  useGetCallerUserProfile,
} from "../hooks/useQueries";

// Capture the beforeinstallprompt event globally as early as possible
let _deferredInstallPrompt: any = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredInstallPrompt = e;
    // Dispatch a custom event so any mounted component can react
    window.dispatchEvent(new Event("pwa-installable"));
  });
}

export function NavBar() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: unreadCount } = useGetCallerUnreadCount();
  const [installPrompt, setInstallPrompt] = useState<any>(
    _deferredInstallPrompt,
  );
  const [installed, setInstalled] = useState(false);
  const installPromptRef = useRef(installPrompt);
  installPromptRef.current = installPrompt;

  const hasUnread = unreadCount !== undefined && unreadCount > BigInt(0);

  useEffect(() => {
    // Pick up the event if it fired before mount
    if (_deferredInstallPrompt) {
      setInstallPrompt(_deferredInstallPrompt);
    }
    const onInstallable = () => {
      setInstallPrompt(_deferredInstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("pwa-installable", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("pwa-installable", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPromptRef.current) return;
    installPromptRef.current.prompt();
    const { outcome } = await installPromptRef.current.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setInstallPrompt(null);
    _deferredInstallPrompt = null;
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/login" });
  };

  const avatarUrl = profile?.avatarBlobId || undefined;
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : identity?.getPrincipal().toString().slice(0, 2).toUpperCase() || "U";

  const showInstall = !!installPrompt && !installed;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-hnc-border"
      style={{ background: "#071824" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 cursor-pointer group"
            data-ocid="nav.link"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#FF6A00" }}
            >
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl tracking-tight">
              HN<span style={{ color: "#FF6A00" }}> Coach</span>
            </span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install button */}
            {showInstall && (
              <Button
                size="sm"
                onClick={handleInstall}
                className="font-semibold text-xs hidden sm:flex items-center gap-1.5"
                style={{
                  background: "#FF6A00",
                  color: "white",
                  border: "none",
                }}
                title="Install HN Coach app"
                data-ocid="nav.install_pwa.button"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </Button>
            )}
            {/* Mobile install icon only */}
            {showInstall && (
              <button
                type="button"
                onClick={handleInstall}
                className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: "rgba(255,106,0,0.15)" }}
                title="Install HN Coach app"
                data-ocid="nav.install_pwa.button_mobile"
              >
                <Download className="w-4 h-4" style={{ color: "#FF6A00" }} />
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              data-ocid="nav.profile.link"
            >
              {/* Avatar with unread badge */}
              <div className="relative">
                <Avatar
                  className="w-8 h-8 border-2"
                  style={{ borderColor: "#FF6A00" }}
                >
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={profile?.name || "Avatar"}
                    />
                  )}
                  <AvatarFallback
                    className="text-xs font-bold text-white"
                    style={{ background: "#1A3A4F" }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Unread message dot badge */}
                {hasUnread && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2"
                    style={{ background: "#ef4444", borderColor: "#071824" }}
                    aria-label="Unread messages"
                    data-ocid="nav.unread_badge"
                  />
                )}
              </div>
              {profile?.name && (
                <span className="hidden sm:block text-sm font-medium text-white">
                  {profile.name}
                </span>
              )}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-semibold text-xs uppercase tracking-wide"
              style={{
                borderColor: "#FF6A00",
                color: "#FF6A00",
                background: "transparent",
              }}
              data-ocid="nav.logout.button"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
