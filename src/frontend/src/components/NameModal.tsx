import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import type { UserProfile } from "../types";

interface NameModalProps {
  open: boolean;
  onComplete: () => void;
}

export function NameModal({ open, onComplete }: NameModalProps) {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setError("");
      setIsSaving(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!actor) {
      toast.error("Still connecting. Please wait a moment and try again.");
      return;
    }
    setError("");
    setIsSaving(true);

    const profileData: UserProfile = {
      name: name.trim(),
      age: BigInt(0),
      whatsAppNumber: "",
      email: "",
      weight: "",
      height: "",
      targetGoal: "",
    };

    try {
      await actor.saveCallerUserProfile(profileData);
      queryClient.setQueryData(["currentUserProfile"], profileData);
      toast.success("Welcome to HN Coach!");
      onComplete();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const buttonDisabled = isSaving;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm rounded-3xl border overflow-hidden p-0"
        style={{
          background: "#FFFFFF",
          borderColor: "#F0E8DE",
          boxShadow:
            "0 20px 60px rgba(255,106,0,0.12), 0 4px 20px rgba(0,0,0,0.06)",
        }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
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
              <User className="w-7 h-7" style={{ color: "#FF6A00" }} />
            </div>
            <DialogTitle
              className="text-2xl font-bold"
              style={{ color: "#1A1A2E" }}
            >
              What's your name?
            </DialogTitle>
            <DialogDescription
              className="text-sm mt-1"
              style={{ color: "#8B7355" }}
            >
              This is how your coach will know you.
            </DialogDescription>
          </DialogHeader>

          <div className="mb-5">
            <Label
              htmlFor="modal-name"
              className="text-sm font-medium mb-1.5 block"
              style={{ color: "#1A1A2E" }}
            >
              Full Name
            </Label>
            <Input
              id="modal-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && !buttonDisabled && handleSave()
              }
              placeholder="Your full name"
              className="h-11 rounded-xl"
              style={{
                background: "#FBF7F4",
                borderColor: error ? "#ef4444" : "#EDE4D9",
                color: "#1A1A2E",
              }}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={buttonDisabled}
            className="w-full h-11 font-semibold text-white rounded-xl"
            style={{
              background: buttonDisabled
                ? "#ccc"
                : "linear-gradient(135deg, #FF6A00, #FF8C3A)",
              boxShadow: buttonDisabled
                ? "none"
                : "0 4px 16px rgba(255,106,0,0.3)",
            }}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Continue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
