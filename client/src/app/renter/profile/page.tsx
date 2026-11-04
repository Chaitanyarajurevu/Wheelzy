"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Save,
  RotateCcw,
  Upload,
  FileText,
  FileCheck2,
  Eye,
  Check,
  X,
  Lock,
  User,
  Building,
  BookOpen,
  Camera,
  Edit3,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type VerificationStatusType = "verified" | "pending" | "rejected" | "not_uploaded";

export default function RenterProfilePage() {
  const { user, updateUserProfile } = useAuth();

  // ── Personal Information Form State ──
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 10 Fields
  const [fullName, setFullName] = useState(user?.name || "Priya Nair");
  const [phone, setPhone] = useState(user?.phone || "+1 (510) 662-8821");
  const email = user?.email || "renter@campus.edu"; // read-only
  const registrationNumber = user?.registrationNumber || "REG-2024-BIO-0912"; // read-only
  const collegeName = user?.collegeName || "College of Engineering, UC Berkeley"; // read-only
  const [branchDepartment, setBranchDepartment] = useState(user?.branchDepartment || "Bioengineering");
  const [academicYear, setAcademicYear] = useState(user?.academicYear || user?.collegeYear || "3rd Year (Class of 2026)");
  const [section, setSection] = useState(user?.section || "Section B");
  const studentIdNumber = user?.studentIdNumber || "SID-UCB-2024-99214"; // read-only
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  );

  // ── Document State ──
  const [studentIdDocUrl, setStudentIdDocUrl] = useState<string>(
    user?.studentIdCardUrl || "/student_id_proof.svg"
  );
  const [studentIdStatus, setStudentIdStatus] = useState<VerificationStatusType>(
    user?.studentIdStatus || (user?.studentVerified ? "verified" : "pending")
  );
  const [studentIdRejectionReason, setStudentIdRejectionReason] = useState<string | undefined>(
    user?.studentIdRejectionReason
  );

  const [aadhaarDocUrl, setAadhaarDocUrl] = useState<string>(
    user?.aadhaarCardUrl || "/aadhaar_card_proof.svg"
  );
  const [aadhaarStatus, setAadhaarStatus] = useState<VerificationStatusType>(
    user?.aadhaarStatus || (user?.aadhaarVerified ? "verified" : "pending")
  );
  const [aadhaarRejectionReason, setAadhaarRejectionReason] = useState<string | undefined>(
    user?.aadhaarRejectionReason
  );
  const maskedAadhaarNumber = user?.aadhaarNumber ? `•••• •••• ${user.aadhaarNumber.slice(-4)}` : "•••• •••• 9021";

  // Upload simulation & progress state
  const [studentIdUploadProgress, setStudentIdUploadProgress] = useState<number | null>(null);
  const [aadhaarUploadProgress, setAadhaarUploadProgress] = useState<number | null>(null);

  // Document inspection modal state (renter viewing their own documents)
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDocTitle, setPreviewDocTitle] = useState("");
  const [previewDocUrl, setPreviewDocUrl] = useState("");

  const studentIdFileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Save Personal Information
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Please enter a valid full name.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      toast.error("Please enter a valid contact phone number.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateUserProfile({
        name: fullName.trim(),
        phone: phone.trim(),
        branchDepartment: branchDepartment.trim(),
        academicYear: academicYear.trim(),
        section: section.trim(),
        avatar: avatarUrl,
      });
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Personal information updated successfully!");
    }, 400);
  };

  const handleCancelEditing = () => {
    setFullName(user?.name || "Priya Nair");
    setPhone(user?.phone || "+1 (510) 662-8821");
    setBranchDepartment(user?.branchDepartment || "Bioengineering");
    setAcademicYear(user?.academicYear || user?.collegeYear || "3rd Year (Class of 2026)");
    setSection(user?.section || "Section B");
    setAvatarUrl(user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80");
    setIsEditing(false);
  };

  // Handle Student ID File Selection & Upload
  const handleStudentIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid JPG, PNG, or PDF file.");
      return;
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller document.");
      return;
    }

    setStudentIdUploadProgress(20);
    const progressTimer = setInterval(() => {
      setStudentIdUploadProgress((prev) => {
        if (prev === null || prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 30;
      });
    }, 150);

    // Read file for preview
    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      setTimeout(() => {
        clearInterval(progressTimer);
        setStudentIdUploadProgress(100);
        setTimeout(() => {
          setStudentIdDocUrl(resultUrl);
          setStudentIdStatus("pending");
          setStudentIdRejectionReason(undefined);
          setStudentIdUploadProgress(null);

          updateUserProfile({
            studentIdCardUrl: resultUrl,
            studentIdStatus: "pending",
            studentIdRejectionReason: undefined,
          });

          toast.success("Student ID Card uploaded! Submitted for campus admin verification.");
        }, 300);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  // Handle Aadhaar File Selection & Upload
  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid JPG, PNG, or PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller document.");
      return;
    }

    setAadhaarUploadProgress(20);
    const progressTimer = setInterval(() => {
      setAadhaarUploadProgress((prev) => {
        if (prev === null || prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 30;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      setTimeout(() => {
        clearInterval(progressTimer);
        setAadhaarUploadProgress(100);
        setTimeout(() => {
          setAadhaarDocUrl(resultUrl);
          setAadhaarStatus("pending");
          setAadhaarRejectionReason(undefined);
          setAadhaarUploadProgress(null);

          updateUserProfile({
            aadhaarCardUrl: resultUrl,
            aadhaarStatus: "pending",
            aadhaarRejectionReason: undefined,
          });

          toast.success("Aadhaar Card uploaded securely! Encrypted for campus identity verification.");
        }, 300);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Avatar Change
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setAvatarUrl(url);
      updateUserProfile({ avatar: url });
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const openDocumentPreview = (title: string, url: string) => {
    setPreviewDocTitle(title);
    setPreviewDocUrl(url);
    setPreviewModalOpen(true);
  };

  const getStatusBadge = (status: VerificationStatusType) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check size={11} className="stroke-[3]" />
            <span>Verified</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending Verification</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <X size={11} className="stroke-[3]" />
            <span>Rejected</span>
          </span>
        );
      case "not_uploaded":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <span>Not Uploaded</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* ── 1. Page Heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Renter Account Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile &amp; Verification</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your personal student details, campus enrollment verification, and identity documents.
          </p>
        </div>

        <Link
          href="/renter/dashboard"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          ← Return to Dashboard
        </Link>
      </div>

      {/* ── 2. Profile Overview Header ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar with Upload Trigger */}
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-50 border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                title="Change Profile Photo"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                <Camera size={12} />
              </button>
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{fullName}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  Student Renter
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 font-mono">
                  {registrationNumber}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                <Mail size={12} className="text-emerald-600 shrink-0" />
                <span>{email}</span>
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Building size={12} className="text-emerald-600 shrink-0" />
                <span>{collegeName}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 font-medium">{academicYear}</span>
              </p>
            </div>
          </div>

          {/* Quick Verification Status Pill Strip */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Student ID:</span>
              {getStatusBadge(studentIdStatus)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Aadhaar:</span>
              {getStatusBadge(aadhaarStatus)}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Personal Information Section (2-Column Desktop, 1-Column Mobile) ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User size={16} className="text-emerald-700" />
              <span>Personal Information</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and update your registered student contact and academic information.
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        {/* 10 Fields Grid */}
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              disabled={!isEditing}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl font-medium transition-all ${
                isEditing
                  ? "bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              }`}
            />
          </div>

          {/* 2. Phone Number */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl font-medium transition-all ${
                isEditing
                  ? "bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              }`}
            />
          </div>

          {/* 3. Email Address (Read-Only) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">Email Address</label>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                <Lock size={10} /> Verified Campus Domain
              </span>
            </div>
            <input
              type="email"
              value={email}
              disabled
              className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono"
            />
          </div>

          {/* 4. Registration Number (Read-Only) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">Registration Number</label>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                <Lock size={10} /> College Enrolled
              </span>
            </div>
            <input
              type="text"
              value={registrationNumber}
              disabled
              className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono"
            />
          </div>

          {/* 5. College Name (Read-Only) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">College Name</label>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                <Lock size={10} /> Campus Hub
              </span>
            </div>
            <input
              type="text"
              value={collegeName}
              disabled
              className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* 6. Branch / Department */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Branch / Department</label>
            <input
              type="text"
              value={branchDepartment}
              disabled={!isEditing}
              onChange={(e) => setBranchDepartment(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl font-medium transition-all ${
                isEditing
                  ? "bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              }`}
            />
          </div>

          {/* 7. Academic Year */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              disabled={!isEditing}
              onChange={(e) => setAcademicYear(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl font-medium transition-all ${
                isEditing
                  ? "bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              }`}
            />
          </div>

          {/* 8. Section */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Section</label>
            <input
              type="text"
              value={section}
              disabled={!isEditing}
              onChange={(e) => setSection(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl font-medium transition-all ${
                isEditing
                  ? "bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              }`}
            />
          </div>

          {/* 9. Student ID (Read-Only) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">Student ID Number</label>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                <Lock size={10} /> Verified ID
              </span>
            </div>
            <input
              type="text"
              value={studentIdNumber}
              disabled
              className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono"
            />
          </div>

          {/* 10. Profile Photo URL */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">Profile Photo</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={avatarUrl}
                disabled={!isEditing}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Image URL"
                className={`flex-1 p-2.5 text-xs rounded-xl font-medium truncate ${
                  isEditing
                    ? "bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    : "bg-gray-50 border border-gray-200 text-gray-600"
                }`}
              />
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Upload
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── 4. Identity Documents & Verification Section ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700" />
            <span>Identity Documents &amp; Verification</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified student documentation ensures trust, accountability, and campus compliance. Your Student ID is visible to vehicle hosts during trip handover. Your Aadhaar details are confidential and accessible only to authorized administrators.
          </p>
        </div>

        {/* Two Upload Cards in Responsive 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── Card A: Student ID Card ── */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Student ID Card</h4>
                    <p className="text-[11px] text-gray-500">Upload your valid college ID card.</p>
                  </div>
                </div>
                {getStatusBadge(studentIdStatus)}
              </div>

              {/* Rejection Alert (if rejected) */}
              {studentIdStatus === "rejected" && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Verification Rejected by Administrator</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      {studentIdRejectionReason || "The uploaded student ID is obscured or expired. Please upload a clear, current student identification card."}
                    </p>
                  </div>
                </div>
              )}

              {/* Document Preview Box */}
              {studentIdDocUrl ? (
                <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                  <div className="h-44 w-full flex items-center justify-center p-3">
                    <img
                      src={studentIdDocUrl}
                      alt="Student ID Preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
                    />
                  </div>
                  <div className="px-3.5 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="truncate">
                      <span className="font-mono text-[11px] text-gray-600">{studentIdNumber}</span>
                      <p className="text-[10px] text-gray-400">Stored in MinIO • Student KYC Bucket</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDocumentPreview("Student ID Card", studentIdDocUrl)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">No Student ID Uploaded</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, or PDF up to 5MB</p>
                </div>
              )}

              {/* Upload Progress Bar */}
              {studentIdUploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-emerald-800 font-semibold">
                    <span>Uploading Student ID to MinIO...</span>
                    <span>{studentIdUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-200"
                      style={{ width: `${studentIdUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100">
              <input
                ref={studentIdFileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleStudentIdFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => studentIdFileInputRef.current?.click()}
                disabled={studentIdUploadProgress !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload size={14} />
                <span>{studentIdDocUrl ? "Replace Student ID Card" : "Upload Student ID Card"}</span>
              </button>
            </div>
          </div>

          {/* ── Card B: Aadhaar Card ── */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Aadhaar Card</h4>
                    <p className="text-[11px] text-gray-500">Upload Aadhaar proof for secure identity verification.</p>
                  </div>
                </div>
                {getStatusBadge(aadhaarStatus)}
              </div>

              {/* Rejection Alert (if rejected) */}
              {aadhaarStatus === "rejected" && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Verification Rejected by Administrator</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      {aadhaarRejectionReason || "Aadhaar number or name is obscured. Please upload a clear, legible Aadhaar card copy."}
                    </p>
                  </div>
                </div>
              )}

              {/* Document Preview Box */}
              {aadhaarDocUrl ? (
                <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                  <div className="h-44 w-full flex items-center justify-center p-3">
                    <img
                      src={aadhaarDocUrl}
                      alt="Aadhaar Card Preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
                    />
                  </div>
                  <div className="px-3.5 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="truncate">
                      <span className="font-mono text-[11px] text-gray-700 font-semibold">{maskedAadhaarNumber}</span>
                      <p className="text-[10px] text-gray-400">Encrypted MinIO Key • Admin Access Only</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDocumentPreview("Aadhaar Card (Confidential)", aadhaarDocUrl)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">No Aadhaar Document Uploaded</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, or PDF up to 5MB</p>
                </div>
              )}

              {/* Upload Progress Bar */}
              {aadhaarUploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-teal-800 font-semibold">
                    <span>Encrypting &amp; Uploading Aadhaar...</span>
                    <span>{aadhaarUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-200"
                      style={{ width: `${aadhaarUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Privacy Notice Callout */}
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[10.5px] text-emerald-900 flex items-start gap-1.5 leading-relaxed">
                <Lock size={12} className="text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Privacy:</strong> Vehicle hosts and other renters can <strong>NEVER</strong> view your Aadhaar document or number. Accessible solely to campus safety admins.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100">
              <input
                ref={aadhaarFileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleAadhaarFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => aadhaarFileInputRef.current?.click()}
                disabled={aadhaarUploadProgress !== null}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Upload size={14} />
                <span>{aadhaarDocUrl ? "Replace Aadhaar Document" : "Upload Aadhaar Document"}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 5. Verification Status Section ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>Verification Status Summary</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Your verification tier across platform trust and community safety criteria.
          </p>
        </div>

        {/* 3 Compact Status Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Row 1: College Verification */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <GraduationCap size={15} className="text-emerald-700" />
                <span>College Enrollment</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified ✓
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Official university student email authenticated at {collegeName}.
            </p>
          </div>

          {/* Row 2: Student ID Verification */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <ShieldCheck size={15} className="text-emerald-700" />
                <span>Student ID Card</span>
              </div>
              {getStatusBadge(studentIdStatus)}
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {studentIdStatus === "verified"
                ? "Physical student ID verified by campus administration."
                : studentIdStatus === "pending"
                ? "Submitted ID under review by campus administrators."
                : studentIdStatus === "rejected"
                ? "ID card rejected. Please replace with a valid photo."
                : "Required before initial ride booking."}
            </p>
          </div>

          {/* Row 3: Aadhaar Verification */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <Lock size={14} className="text-teal-700" />
                <span>Aadhaar Identity</span>
              </div>
              {getStatusBadge(aadhaarStatus)}
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {aadhaarStatus === "verified"
                ? "Encrypted government identity verified for platform security."
                : aadhaarStatus === "pending"
                ? "Aadhaar verification pending administrative review."
                : aadhaarStatus === "rejected"
                ? "Aadhaar rejected. Please re-upload a clear document."
                : "Required for community trust & peer rental eligibility."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Document Inspection Modal (Renter viewing own submitted proof) ── */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
          <DialogHeader className="border-b border-gray-100 pb-3 flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 size={16} className="text-emerald-700" />
              <span>{previewDocTitle}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 p-3">
              <img
                src={previewDocUrl}
                alt={previewDocTitle}
                className="max-h-[50vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Confidential document • Rendered with authorized renter session credentials
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
