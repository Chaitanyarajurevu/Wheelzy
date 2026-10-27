"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserCircle,
  KeyRound,
  Lock,
  Save,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ScrollText,
  Users,
  Settings,
  Car,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { dataStore } from "@/lib/dataStore";

export default function AdminProfilePage() {
  const { user, updateUserProfile, switchRole } = useAuth();
  const auditLogs = dataStore.getAuditLogs().slice(0, 5);

  const [name, setName] = useState(user?.name || "Alex Rivera");
  const [phone, setPhone] = useState(user?.phone || "+1 (510) 555-0199");
  const [campus, setCampus] = useState(user?.campus || "Wheelzy HQ & Campus Command");
  const [department, setDepartment] = useState("Platform Trust & Safety");
  const [isSaving, setIsSaving] = useState(false);

  // Password simulation
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
      });
      setIsSaving(false);
      toast.success("Administrator profile credentials updated.");
    }, 400);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your existing administrator passphrase.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Administrative passphrases must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passphrases do not match.");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Administrator security passphrase updated.");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Administrator Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            Platform command center authority, audit clearance, and security configurations.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto"
        >
          ← Return to Admin Dashboard
        </Link>
      </div>

      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#064E3B] to-[#059669] text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-950/20 ring-4 ring-emerald-50">
              {user?.name ? user.name[0] : "A"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{user?.name || "Alex Rivera"}</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 uppercase">
                  Platform Admin
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300">
                  MFA Enabled ✓
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 font-mono">
                <Mail size={12} className="text-emerald-600" /> {user?.email || "admin@wheelzy.internal"}
              </p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <MapPin size={11} className="text-emerald-500" /> {user?.campus || "Wheelzy HQ & Campus Command"}
              </p>
            </div>
          </div>

          {/* Quick Demo Portal Switchers */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            <span className="text-[11px] text-gray-400">Test other role interfaces:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => switchRole("renter")}
                className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1 border border-gray-200"
              >
                <GraduationCap size={13} />
                <span>Renter View</span>
              </button>
              <button
                type="button"
                onClick={() => switchRole("owner")}
                className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1 border border-gray-200"
              >
                <Car size={13} />
                <span>Host View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Administrative Clearance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Access Clearance</span>
            <p className="text-xl font-black text-gray-900">Level 4 Root</p>
            <p className="text-[11px] text-gray-500">Full Platform Command Authority</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Verification Scope</span>
            <p className="text-xl font-black text-gray-900">Chief Inspector</p>
            <p className="text-[11px] text-emerald-700 font-semibold">Student ID & RC Document Approval</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Audit Authority</span>
            <p className="text-xl font-black text-gray-900">Cryptographic</p>
            <p className="text-[11px] text-gray-500">Live security event auditing</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Security State</span>
            <p className="text-sm font-black text-emerald-800 flex items-center gap-1 pt-1">
              <ShieldCheck size={16} className="text-emerald-600" /> Active Hardware Key
            </p>
            <p className="text-[11px] text-gray-500">2-Factor Authentication Verified</p>
          </div>
        </div>
      </div>

      {/* Edit Details & Security Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Administrator Details */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Administrator Contact Details</h3>
            <p className="text-xs text-gray-500">Internal campus security and command center credentials.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Administrator Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Administrative Email (Secured)</label>
                <input
                  type="email"
                  value={user?.email || "admin@wheelzy.internal"}
                  disabled
                  className="w-full p-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Helpline Dispatch Phone</label>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Operating Command Center</label>
                <input
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Division</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
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
                <span>{isSaving ? "Saving..." : "Save Admin Credentials"}</span>
              </button>
            </div>
          </form>

          {/* Recent Security Audit Events */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ScrollText size={14} className="text-emerald-700" />
                <span>Recent Platform Audit Entries</span>
              </h4>
              <Link href="/admin/audit-logs" className="text-[11px] font-bold text-emerald-700 hover:underline">
                View All Logs →
              </Link>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-800">{log.action}</span>
                    <span className="text-[10px] text-gray-400">{log.timestamp}</span>
                  </div>
                  <p className="text-gray-500">Actor: {log.actorName} ({log.actorRole}) · IP: {log.ipAddress}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Security Settings & Multi-Factor Auth */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Admin Passphrase & Multi-Factor Auth</h3>
            <p className="text-xs text-gray-500">Hardware token and administrative password management.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Current Passphrase</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Administrative Passphrase</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Passphrase</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new passphrase"
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
                <span>{isChangingPassword ? "Updating Passphrase..." : "Update Passphrase"}</span>
              </button>
            </div>
          </form>

          {/* MFA Security Card */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-bold text-gray-900">Multi-Factor Authentication (MFA)</h4>
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span className="font-bold text-emerald-900">MFA Enforced for Administrators</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Per Section 2 of Wheelzy security architecture, administrator sessions require hardware/TOTP multi-factor verification.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-emerald-800">
                <span>Key ID: WHZ-ADMIN-SEC-9201</span>
                <span>·</span>
                <span>Status: Enforced</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
