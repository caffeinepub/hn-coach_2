import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import {
  useGetCallerUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile && isFetched && profile.name) {
      setName(profile.name);
    }
  }, [profile, isFetched]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");

    const profileData: UserProfile = {
      name: name.trim(),
      age: profile?.age ?? BigInt(0),
      whatsAppNumber: profile?.whatsAppNumber ?? "",
      email: profile?.email ?? "",
      weight: profile?.weight ?? "",
      height: profile?.height ?? "",
      targetGoal: profile?.targetGoal ?? "",
      avatarBlobId: profile?.avatarBlobId,
    };

    try {
      await saveProfile.mutateAsync(profileData);
      queryClient.setQueryData(["currentUserProfile"], profileData);
      toast.success("Profile saved!");
      navigate({ to: "/" });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save profile");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#FFFBF5" }}
    >
      <NavBar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div
            className="rounded-2xl border p-8"
            style={{
              background: "#FFFFFF",
              borderColor: "#F0E8DE",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div className="text-center mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(255,106,0,0.1)" }}
              >
                <User className="w-6 h-6" style={{ color: "#FF6A00" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: "#1A1A2E" }}>
                What's your name?
              </h1>
              <p className="text-sm mt-1" style={{ color: "#8B7355" }}>
                This is how your coach will know you.
              </p>
            </div>

            <div className="mb-5">
              <Label
                htmlFor="name"
                className="text-sm font-medium mb-1.5 block"
                style={{ color: "#1A1A2E" }}
              >
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
              disabled={saveProfile.isPending}
              className="w-full h-11 font-semibold text-white rounded-xl"
              style={{
                background: "linear-gradient(135deg, #FF6A00, #FF8C3A)",
                boxShadow: "0 4px 16px rgba(255,106,0,0.3)",
              }}
            >
              {saveProfile.isPending ? (
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
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
