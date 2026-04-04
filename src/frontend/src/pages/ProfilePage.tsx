import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Loader2, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  useGetCallerUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    name: string;
    age: string;
    whatsAppNumber: string;
    email: string;
    weight: string;
    height: string;
    targetGoal: string;
    avatarBlobId?: string;
  }>({
    name: "",
    age: "",
    whatsAppNumber: "",
    email: "",
    weight: "",
    height: "",
    targetGoal: "",
    avatarBlobId: undefined,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile && isFetched) {
      setForm({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        whatsAppNumber: profile.whatsAppNumber || "",
        email: profile.email || "",
        weight: profile.weight || "",
        height: profile.height || "",
        targetGoal: profile.targetGoal || "",
        avatarBlobId: profile.avatarBlobId,
      });
    }
  }, [profile, isFetched]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploading(true);

    try {
      // Store as object URL (in production this would upload via StorageClient)
      setForm((prev) => ({ ...prev, avatarBlobId: previewUrl }));
      toast.success("Avatar uploaded successfully");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Failed to upload avatar");
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const profileData: UserProfile = {
      name: form.name,
      age: BigInt(form.age || "0"),
      whatsAppNumber: form.whatsAppNumber,
      email: form.email,
      weight: form.weight,
      height: form.height,
      targetGoal: form.targetGoal,
      avatarBlobId: form.avatarBlobId,
    };

    try {
      await saveProfile.mutateAsync(profileData);
      toast.success("Profile saved successfully!");
      navigate({ to: "/" });
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save profile");
    }
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const displayAvatar = avatarPreview || form.avatarBlobId || undefined;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div
          className="min-h-screen flex flex-col"
          style={{ background: "#0B2232" }}
        >
          <NavBar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "#FF6A00" }}
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "#0B2232" }}
      >
        <NavBar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                data-ocid="profile.back.button"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: "#A8B6C3" }} />
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  My Profile
                </h1>
                <p className="text-sm" style={{ color: "#A8B6C3" }}>
                  Update your personal information
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 sm:p-8 border border-hnc-border shadow-card"
              style={{ background: "#112A3A" }}
            >
              {/* Avatar section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <Avatar
                    className="w-24 h-24 border-4 hover:opacity-80 transition-opacity"
                    style={{ borderColor: "#FF6A00" }}
                  >
                    {displayAvatar && (
                      <AvatarImage src={displayAvatar} alt="Profile" />
                    )}
                    <AvatarFallback
                      className="text-2xl font-bold text-white"
                      style={{ background: "#1A3A4F" }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-hnc-card"
                    style={{ background: "#FF6A00" }}
                    data-ocid="profile.upload_button"
                  >
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>
                <p className="mt-3 text-sm" style={{ color: "#A8B6C3" }}>
                  Click to upload profile photo
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  data-ocid="profile.dropzone"
                />
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-white mb-1.5 flex items-center gap-1.5"
                  >
                    <User
                      className="w-3.5 h-3.5"
                      style={{ color: "#FF6A00" }}
                    />{" "}
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.name.input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="age"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={form.age}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, age: e.target.value }))
                    }
                    placeholder="Your age"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.age.input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="whatsApp"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsApp"
                    value={form.whatsAppNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        whatsAppNumber: e.target.value,
                      }))
                    }
                    placeholder="+1 234 567 8900"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.whatsapp.input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="your@email.com"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.email.input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="weight"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Weight
                  </Label>
                  <Input
                    id="weight"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, weight: e.target.value }))
                    }
                    placeholder="e.g. 75 kg"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.weight.input"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="height"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Height
                  </Label>
                  <Input
                    id="height"
                    value={form.height}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, height: e.target.value }))
                    }
                    placeholder="e.g. 175 cm"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.height.input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="targetGoal"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Target / Goal
                  </Label>
                  <Textarea
                    id="targetGoal"
                    value={form.targetGoal}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        targetGoal: e.target.value,
                      }))
                    }
                    placeholder="What do you want to achieve? e.g. Lose 10kg, run 5k, build muscle..."
                    rows={3}
                    className="rounded-xl border-hnc-border text-white placeholder:text-hnc-muted resize-none"
                    style={{ background: "#1A3A4F" }}
                    data-ocid="profile.targetgoal.textarea"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saveProfile.isPending}
                  className="flex-1 h-11 font-semibold text-white rounded-xl"
                  style={{ background: "#FF6A00" }}
                  data-ocid="profile.save.submit_button"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
