import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dumbbell, Loader2, Lock, MessageCircleHeart } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export function LoginModal({
  open,
  onOpenChange,
  reason = "Please sign in to continue.",
}: LoginModalProps) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm rounded-3xl border overflow-hidden p-0"
        style={{
          background: "#FFFFFF",
          borderColor: "#F0E8DE",
          boxShadow:
            "0 20px 60px rgba(255,106,0,0.12), 0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg, #FF6A00, #FF8C3A, #FFAB6E)",
          }}
        />

        <div className="p-8">
          <DialogHeader className="text-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(255,106,0,0.1)",
                border: "1px solid rgba(255,106,0,0.2)",
              }}
            >
              <MessageCircleHeart
                className="w-7 h-7"
                style={{ color: "#FF6A00" }}
              />
            </div>
            <DialogTitle
              className="text-2xl font-bold"
              style={{ color: "#1A1A2E" }}
            >
              Sign In Required
            </DialogTitle>
            <DialogDescription
              className="text-sm leading-relaxed mt-1"
              style={{ color: "#8B7355" }}
            >
              {reason}
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full font-bold text-white rounded-xl mb-3"
            style={{
              background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
              boxShadow: "0 8px 24px rgba(255,106,0,0.35)",
              height: "52px",
              fontSize: "15px",
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          <p className="text-xs text-center" style={{ color: "#A89078" }}>
            Secure &amp; passwordless authentication
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
