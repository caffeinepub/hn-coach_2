import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Dumbbell, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export function NavBar() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();

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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              data-ocid="nav.profile.link"
            >
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
