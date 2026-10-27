"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  UserCircle,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Lock,
  Save,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CAMPUS_OPTIONS } from "@/data/mockVehicles";
import { dataStore } from "@/lib/dataStore";

export default function OwnerProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const ownerId = user?.id || "usr-owner-marcus";

  const ownerVehicles = dataStore.getOwnerVehicles(ownerId);
  const stats = dataStore.getOwnerStats(ownerId);

  const [name, setName] = useState(user?.name || "Marcus Vance");
  const [phone, setPhone] = useState(user?.phone || "+1 (510) 842-1200");
  const [campus, setCampus] = useState(user?.campus || "UC Berkeley");
  const [collegeYear, setCollegeYear] = useState(user?.collegeYear || "EECS '27");
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
      toast.success("Host profile updated successfully!");
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
      toast.success("Host account password changed successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vehicle Owner & Host Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your fleet host credentials, campus location hubs, and account security.
          </p>
        </div>

        <Link
          href="/owner/dashboard"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          ← Return to Host Dashboard
        </Link>
      </div>

      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#022C22] to-[#047857] text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-950/20 ring-4 ring-emerald-50">
              {user?.name ? user.name[0] : "M"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{user?.name || "Marcus Vance"}</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 uppercase">
                  Fleet Host
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                <Mail size={12} className="text-emerald-600" /> {user?.email}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <MapPin size={11} className="text-emerald-500" /> {user?.campus || "UC Berkeley"} · {user?.collegeYear || "Host"}
              </p>
            </div>
          </div>

          {/* Quick Switcher & Fleet Actions */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            <Link
              href="/owner/add-vehicle"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle size={13} />
              <span>Add Vehicle Listing</span>
            </Link>
          </div>
        </div>

        {/* Host Stats & Verification Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Fleet Size</span>
            <p className="text-2xl font-black text-gray-900">{ownerVehicles.length} Listed</p>
            <p className="text-[11px] text-gray-500">Bikes & Scooters in Campus Hubs</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Earnings</span>
            <p className="text-2xl font-black text-gray-900">${(stats?.totalEarnings ?? 485.5).toFixed(2)}</p>
            <p className="text-[11px] text-emerald-700 font-semibold">+18% this month</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Host Rating</span>
            <p className="text-2xl font-black text-gray-900">4.9 ★</p>
            <p className="text-[11px] text-gray-500">From 24 verified student reviews</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Host KYC & Verification</span>
            <p className="text-sm font-black text-emerald-800 flex items-center gap-1 pt-1">
              <ShieldCheck size={16} className="text-emerald-600" /> Tier 2 Certified Host
            </p>
            <p className="text-[11px] text-gray-500">Student ID &amp; Fleet RC Verified</p>
          </div>
        </div>
      </div>

      {/* Edit Details & Security Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Host Information */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Host Contact & Operational Details</h3>
            <p className="text-xs text-gray-500">These details help students identify your vehicles at campus quads.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Host Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Host Email (Read Only)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone (Coordination)</label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Primary Campus Hub</label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Department / College</label>
                <input
                  type="text"
                  value={collegeYear}
                  onChange={(e) => setCollegeYear(e.target.value)}
                  placeholder="e.g. EECS '27"
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
                <span>{isSaving ? "Saving..." : "Save Host Details"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Security & Documents */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Host Security & Credentials</h3>
            <p className="text-xs text-gray-500">Update login password and vehicle document status.</p>
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

          {/* Host Personal KYC Verification */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-900">Host Identity & KYC Proofs</h4>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-gray-600 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-950 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  <span>College Student ID Proof</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  VERIFIED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-950 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-700" />
                  <span>Peer Privacy Protocol</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-gray-500 pt-0.5">
                Only your University Student ID proof is visible to student renters. Personal numbers and documents are protected.
              </p>
              <Link
                href="/owner/documents"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline pt-0.5"
              >
                <span>Upload or Replace Host Student ID</span>
                <ExternalLink size={10} />
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-900">Fleet Vehicle Documents Verification</h4>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-gray-600 space-y-1">
              <p className="font-semibold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-700" />
                <span>3 of 3 Vehicle Documents Verified</span>
              </p>
              <p>Registration certificates (RC) and liability coverage are verified for all listed vehicles.</p>
              <Link
                href="/owner/documents"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline pt-1"
              >
                <span>Manage Vehicle Documents</span>
                <ExternalLink size={10} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
