import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  Circle,
  Loader2,
  Save,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import {
  ProtectedRoute,
  isProfileComplete,
} from "../components/ProtectedRoute";
import {
  useGetCallerUserProfile,
  useSaveUserProfile,
} from "../hooks/useQueries";

type FormState = {
  name: string;
  age: string;
  whatsAppNumber: string;
  email: string;
  weight: string;
  height: string;
  targetGoal: string;
  avatarBlobId?: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validateForm(
  form: FormState,
  avatarPreview: string | null,
): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.age.trim() || Number(form.age) <= 0)
    errors.age = "Valid age is required";
  if (!form.whatsAppNumber.trim())
    errors.whatsAppNumber = "WhatsApp number is required";
  if (!form.email.trim()) errors.email = "Email address is required";
  if (!form.weight.trim()) errors.weight = "Weight is required";
  if (!form.height.trim()) errors.height = "Height is required";
  if (!form.targetGoal.trim()) errors.targetGoal = "Target / Goal is required";
  if (!form.avatarBlobId && !avatarPreview)
    errors.avatarBlobId = "Profile photo is required";
  return errors;
}

type FieldStatus = {
  label: string;
  filled: boolean;
};

function getFieldStatuses(
  form: FormState,
  avatarPreview: string | null,
): FieldStatus[] {
  return [
    { label: "Full Name", filled: !!form.name.trim() },
    { label: "Age", filled: !!form.age.trim() && Number(form.age) > 0 },
    { label: "WhatsApp Number", filled: !!form.whatsAppNumber.trim() },
    { label: "Email", filled: !!form.email.trim() },
    { label: "Weight", filled: !!form.weight.trim() },
    { label: "Height", filled: !!form.height.trim() },
    { label: "Target / Goal", filled: !!form.targetGoal.trim() },
    {
      label: "Profile Photo",
      filled: !!(avatarPreview || form.avatarBlobId),
    },
  ];
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Determine if this is a first-time setup (profile incomplete)
  const isFirstTimeSetup = isFetched && !isProfileComplete(profile);

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
      if (profile.avatarBlobId) {
        setAvatarPreview(profile.avatarBlobId);
      }
    }
  }, [profile, isFetched]);

  useEffect(() => {
    if (submitted) {
      setErrors(validateForm(form, avatarPreview));
    }
  }, [form, avatarPreview, submitted]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploading(true);

    try {
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
    setSubmitted(true);
    const validationErrors = validateForm(form, avatarPreview);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(
        "Please fill in all required fields including a profile photo",
      );
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
      // Set the profile data in the cache immediately so ProtectedRoute
      // sees a complete profile before we navigate away from /profile.
      queryClient.setQueryData(["currentUserProfile"], profileData);
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

  const fieldStatuses = getFieldStatuses(form, avatarPreview);
  const filledCount = fieldStatuses.filter((f) => f.filled).length;
  const totalCount = fieldStatuses.length;
  const progressPercent = Math.round((filledCount / totalCount) * 100);

  if (isLoading) {
    return (
      // isProfilePage=true so we don't get redirected back to /profile infinitely
      <ProtectedRoute isProfilePage>
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
    // isProfilePage=true so ProtectedRoute won't redirect back to /profile
    <ProtectedRoute isProfilePage>
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
            {/* First-time setup banner */}
            {isFirstTimeSetup && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6 rounded-xl border px-5 py-4 flex items-start gap-3"
                style={{
                  background: "rgba(255,106,0,0.08)",
                  borderColor: "#FF6A00",
                }}
              >
                <AlertCircle
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "#FF6A00" }}
                />
                <div>
                  <p className="font-semibold text-white text-sm">
                    Welcome! Please complete your profile first
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#A8B6C3" }}>
                    All fields and a profile photo are required before you can
                    start chatting or booking appointments.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Progress indicator */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6 rounded-2xl border p-5"
              style={{
                background: "#112A3A",
                borderColor: "rgba(168,182,195,0.15)",
              }}
              data-ocid="profile.progress.card"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">
                  Profile Completion
                </p>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: progressPercent === 100 ? "#4ade80" : "#FF6A00",
                  }}
                >
                  {filledCount} / {totalCount} — {progressPercent}%
                </span>
              </div>

              <div
                className="w-full h-2.5 rounded-full overflow-hidden mb-4"
                style={{ background: "#1A3A4F" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      progressPercent === 100
                        ? "#4ade80"
                        : "linear-gradient(90deg, #FF6A00, #ff9a40)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {fieldStatuses.map((field) => (
                  <div
                    key={field.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      background: field.filled
                        ? "rgba(74,222,128,0.07)"
                        : "rgba(168,182,195,0.06)",
                    }}
                  >
                    {field.filled ? (
                      <Check
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#4ade80" }}
                      />
                    ) : (
                      <Circle
                        className="w-3.5 h-3.5 flex-shrink-0 opacity-40"
                        style={{ color: "#A8B6C3" }}
                      />
                    )}
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: field.filled ? "#e2e8f0" : "#A8B6C3" }}
                    >
                      {field.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="flex items-center gap-3 mb-8">
              {!isFirstTimeSetup && (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  data-ocid="profile.back.button"
                >
                  <ArrowLeft className="w-5 h-5" style={{ color: "#A8B6C3" }} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  {isFirstTimeSetup ? "Complete Your Profile" : "My Profile"}
                </h1>
                <p className="text-sm" style={{ color: "#A8B6C3" }}>
                  {isFirstTimeSetup
                    ? "Step 1 of 1 — required to access the app"
                    : "Update your personal information"}
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
                    style={{
                      borderColor:
                        errors.avatarBlobId && submitted
                          ? "#ef4444"
                          : "#FF6A00",
                    }}
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
                  <span style={{ color: "#FF6A00" }}>*</span>
                </p>
                {errors.avatarBlobId && submitted && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.avatarBlobId}
                  </p>
                )}
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
                    Full Name <span style={{ color: "#FF6A00" }}>*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.name && submitted ? "#ef4444" : undefined,
                    }}
                    data-ocid="profile.name.input"
                  />
                  {errors.name && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="age"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Age <span style={{ color: "#FF6A00" }}>*</span>
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
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.age && submitted ? "#ef4444" : undefined,
                    }}
                    data-ocid="profile.age.input"
                  />
                  {errors.age && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.age}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="whatsApp"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    WhatsApp Number <span style={{ color: "#FF6A00" }}>*</span>
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
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.whatsAppNumber && submitted
                          ? "#ef4444"
                          : undefined,
                    }}
                    data-ocid="profile.whatsapp.input"
                  />
                  {errors.whatsAppNumber && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.whatsAppNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Email Address <span style={{ color: "#FF6A00" }}>*</span>
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
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.email && submitted ? "#ef4444" : undefined,
                    }}
                    data-ocid="profile.email.input"
                  />
                  {errors.email && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="weight"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Weight <span style={{ color: "#FF6A00" }}>*</span>
                  </Label>
                  <Input
                    id="weight"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, weight: e.target.value }))
                    }
                    placeholder="e.g. 75 kg"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.weight && submitted ? "#ef4444" : undefined,
                    }}
                    data-ocid="profile.weight.input"
                  />
                  {errors.weight && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.weight}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="height"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Height <span style={{ color: "#FF6A00" }}>*</span>
                  </Label>
                  <Input
                    id="height"
                    value={form.height}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, height: e.target.value }))
                    }
                    placeholder="e.g. 175 cm"
                    className="h-11 rounded-xl border-hnc-border text-white placeholder:text-hnc-muted"
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.height && submitted ? "#ef4444" : undefined,
                    }}
                    data-ocid="profile.height.input"
                  />
                  {errors.height && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.height}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label
                    htmlFor="targetGoal"
                    className="text-sm font-medium text-white mb-1.5 block"
                  >
                    Target / Goal <span style={{ color: "#FF6A00" }}>*</span>
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
                    style={{
                      background: "#1A3A4F",
                      borderColor:
                        errors.targetGoal && submitted ? "#ef4444" : undefined,
                    }}
                    data-ocid="profile.targetgoal.textarea"
                  />
                  {errors.targetGoal && submitted && (
                    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                      {errors.targetGoal}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs" style={{ color: "#A8B6C3" }}>
                <span style={{ color: "#FF6A00" }}>*</span> All fields are
                required
              </p>

              <div className="mt-6 flex gap-3">
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
                      <Save className="w-4 h-4 mr-2" />
                      {isFirstTimeSetup
                        ? "Complete Profile & Continue"
                        : "Save Profile"}
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
