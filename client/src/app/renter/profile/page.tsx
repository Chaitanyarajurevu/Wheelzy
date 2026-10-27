"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCircle,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Lock,
  Save,
  Car,
  FileCheck2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CAMPUS_OPTIONS } from "@/data/mockVehicles";

export default function RenterProfilePage() {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || "Priya Nair");
  const [phone, setPhone] = useState(user?.phone || "+1 (510) 931-4422");
  const [campus, setCampus] = useState(user?.campus || "UC Berkeley");
  const [collegeYear, setCollegeYear] = useState(user?.collegeYear || "Bioengineering '26");
  const [isSaving, setIsSaving] = useState(false);

  // Password change simulation
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUserProfile({
        name,
        phone,
        campus,
        collegeYear,
      });
      setIsSaving(false);
      toast.success("Renter profile updated successfully!");
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Account password changed successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student Renter Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal details, campus enrollment verification, and account credentials.
          </p>
        </div>

        <Link
          href="/renter/dashboard"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          ← Return to Dashboard
        </Link>
      </div>

      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-900/10 ring-4 ring-emerald-50">
              {user?.name ? user.name[0] : "P"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{user?.name || "Student Renter"}</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 uppercase">
                  Student Renter
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                <Mail size={12} className="text-emerald-600" /> {user?.email}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <MapPin size={11} className="text-emerald-500" /> {user?.campus || "UC Berkeley"} · {user?.collegeYear || "Student"}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Banner Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* College Student ID Verification */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-gray-900">Student ID</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.studentVerified
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {user?.studentVerified ? "VERIFIED ✓" : "PENDING"}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {user?.studentVerified
                ? "Enrollment confirmed at UC Berkeley. Eligible for campus-wide peer rentals."
                : "Student ID under review. Required before initial ride reservation."}
            </p>
            <Link
              href="/renter/college-verification"
              className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{user?.studentVerified ? "View Submitted ID" : "Upload Student ID"}</span>
              <ExternalLink size={10} />
            </Link>
          </div>

          {/* Privacy & Peer Security Assurance */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-gray-900">Peer Privacy Protection</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Wheelzy protects your privacy: only your University Student ID proof is visible to vehicle owners. Personal mobile numbers and government identity documents are strictly confidential.
            </p>
          </div>

          {/* Driver's License Verification */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-gray-900">Driving License</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.licenseVerified
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {user?.licenseVerified ? "VERIFIED ✓" : "NOT SUBMITTED"}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {user?.licenseVerified
                ? "State driver’s license approved for motorized e-scooters and road bikes."
                : "Required for road legal e-scooters and motorized campus vehicles."}
            </p>
            <Link
              href="/renter/driving-license"
              className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{user?.licenseVerified ? "View License Details" : "Verify License"}</span>
              <ExternalLink size={10} />
            </Link>
          </div>

          {/* Account Security Status */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-gray-900">Account Standing</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {user?.status === "active" ? "GOOD STANDING" : "SUSPENDED"}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Active campus member since {user?.joinedDate || "2026-02-10"}. Zero incident penalties.
            </p>
            <div className="text-[11px] text-emerald-700 font-semibold pt-1">
              Encrypted SSO Session Active
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit & Security Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Edit Personal Information */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
            <p className="text-xs text-gray-500">Update your student contact and academic department info.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Registered Email (Read Only)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Campus Hub</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">College Year & Major</label>
                <input
                  type="text"
                  value={collegeYear}
                  onChange={(e) => setCollegeYear(e.target.value)}
                  placeholder="e.g. Bioengineering '26"
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? "Saving..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Security & Password */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Security Credentials</h3>
            <p className="text-xs text-gray-500">Update your account password and session settings.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Lock size={13} />
                <span>{isChangingPassword ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Campus Trust Verification Rule:</p>
            <p>
              Your verified .edu student profile ensures access to campus vehicle rates. Changes to email require administrator re-verification.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
