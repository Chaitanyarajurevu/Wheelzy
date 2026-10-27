"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Car,
  FileCheck2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  Sparkles,
  Download,
  Check,
} from "lucide-react";
import { dataStore, User, StoredVehicle, StoredBooking, VerificationRequest } from "@/lib/dataStore";
import { toast } from "sonner";

interface AdminUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onUserUpdated?: () => void;
}

export function AdminUserProfileModal({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}: AdminUserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"documents" | "details" | "activity">("documents");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenTitle, setFullscreenTitle] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Profile data
  const [userData, setUserData] = useState<User | null>(null);
  const [userVehicles, setUserVehicles] = useState<StoredVehicle[]>([]);
  const [userBookings, setUserBookings] = useState<StoredBooking[]>([]);
  const [userVerifications, setUserVerifications] = useState<VerificationRequest[]>([]);

  const reloadProfile = () => {
    if (!userId) return;
    const profile = dataStore.getUserFullProfile(userId);
    if (profile) {
      setUserData({ ...profile.user });
      setUserVehicles([...profile.vehicles]);
      setUserBookings([...profile.bookings]);
      setUserVerifications([...profile.verifications]);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      reloadProfile();
    }
  }, [isOpen, userId]);

  if (!isOpen || !userData) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleKyc = (field: "studentVerified" | "aadhaarVerified" | "licenseVerified") => {
    if (!userData) return;
    const newVal = !userData[field];
    const updated = dataStore.updateUserKyc(userData.id, { [field]: newVal });
    if (updated) {
      setUserData({ ...updated });
      toast.success(
        `${field.replace("Verified", " Verification")} marked as ${newVal ? "VERIFIED" : "UNVERIFIED"}`
      );
      if (onUserUpdated) onUserUpdated();
    }
  };

  const handleToggleAccountStatus = () => {
    if (!userData) return;
    const updated = dataStore.toggleUserStatus(userData.id);
    if (updated) {
      setUserData({ ...updated });
      toast.success(
        `Account status updated: ${updated.status === "active" ? "ACTIVATED" : "SUSPENDED"}`
      );
      if (onUserUpdated) onUserUpdated();
    }
  };

  const handleApproveAllKyc = () => {
    if (!userData) return;
    const updated = dataStore.updateUserKyc(userData.id, {
      studentVerified: true,
      aadhaarVerified: true,
      licenseVerified: true,
    });
    if (updated) {
      setUserData({ ...updated });
      toast.success(`All KYC proofs approved for ${userData.name}!`);
      if (onUserUpdated) onUserUpdated();
    }
  };

  const openFullscreen = (url: string, title: string) => {
    setFullscreenImage(url);
    setFullscreenTitle(title);
  };

  const studentIdUrl = userData.studentIdCardUrl || "/student_id_proof.svg";
  const studentIdNumber = userData.studentIdNumber || "SID-UCB-2024-99214";
  const aadhaarUrl = userData.aadhaarCardUrl || "/aadhaar_card_proof.svg";
  const aadhaarNumber = userData.aadhaarNumber || "XXXX-XXXX-9021";
  const dlUrl = userData.drivingLicenseUrl || "/driving_license_proof.svg";
  const dlNumber = userData.drivingLicenseNumber || "DL-04-2024-9921448";
  const dlExpiry = userData.drivingLicenseExpiry || "2034-05-15";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#022C22] text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-md"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    userData.status === "active" ? "bg-emerald-400" : "bg-rose-500"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{userData.name}</h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase">
                    {userData.role.replace("_", " ")}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      userData.status === "active"
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {userData.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/80">
                  <span className="flex items-center gap-1 font-mono">
                    <Mail size={12} className="text-emerald-400" /> {userData.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-emerald-400" /> {userData.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-400" /> {userData.campus}{" "}
                    {userData.collegeYear ? `· ${userData.collegeYear}` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleToggleAccountStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userData.status === "active"
                    ? "bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30"
                }`}
              >
                {userData.status === "active" ? (
                  <>
                    <UserX size={13} /> Suspend User
                  </>
                ) : (
                  <>
                    <UserCheck size={13} /> Activate User
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Verification Status Pill Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-emerald-800/60">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-emerald-300" />
                <span className="text-xs font-bold text-emerald-100">Student ID</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userData.studentVerified
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                }`}
              >
                {userData.studentVerified ? "VERIFIED ✓" : "PENDING REVIEW"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-300" />
                <span className="text-xs font-bold text-emerald-100">Aadhaar Card</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userData.aadhaarVerified
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                }`}
              >
                {userData.aadhaarVerified ? "VERIFIED ✓" : "PENDING REVIEW"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck2 size={15} className="text-emerald-300" />
                <span className="text-xs font-bold text-emerald-100">Driving Licence</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userData.licenseVerified
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-gray-400/20 text-gray-300 border border-gray-400/40"
                }`}
              >
                {userData.licenseVerified ? "VERIFIED ✓" : "NOT SUBMITTED"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 bg-gray-50/70">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("documents")}
              className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "documents"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <FileCheck2 size={14} />
              <span>KYC & Document Proofs ({userData.role === "owner" ? "4" : "3"})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "details"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <GraduationCap size={14} />
              <span>Full Profile & Campus Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Car size={14} />
              <span>
                {userData.role === "owner"
                  ? `Listed Fleet (${userVehicles.length})`
                  : `Rental History (${userBookings.length})`}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleApproveAllKyc}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={13} />
            <span>Approve All KYC</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: ALL DOCUMENTS AND PROOFS (STUDENT ID, AADHAAR, DRIVING LICENCE, RC) */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Uploaded Verification Files & Government Proofs
                  </h3>
                  <p className="text-xs text-gray-500">
                    Inspecting high-resolution student identity, government Aadhaar binding, and compliance files.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                  Role: {userData.role.toUpperCase()}
                </span>
              </div>

              {/* 3 or 4 Column Document Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* 1. College Student ID Card */}
                <div className="rounded-3xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900">University Student ID</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        userData.studentVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {userData.studentVerified ? "VERIFIED ✓" : "PENDING"}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div
                      onClick={() => openFullscreen(studentIdUrl, "University Student ID Card")}
                      className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer aspect-[1.58/1]"
                    >
                      <img
                        src={studentIdUrl}
                        alt="Student ID"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                        <Eye size={14} /> Click to Enlarge
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Student ID #:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-950">
                          <span>{studentIdNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(studentIdNumber, "Student ID Number")}
                            className="p-1 hover:bg-emerald-100 rounded"
                            title="Copy"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Campus:</span>
                        <span className="font-semibold text-gray-800">{userData.campus}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Department:</span>
                        <span className="font-semibold text-gray-800">{userData.collegeYear || "General"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => handleToggleKyc("studentVerified")}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        userData.studentVerified
                          ? "border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      }`}
                    >
                      {userData.studentVerified ? "Revoke Student ID Verification" : "Verify Student ID Proof"}
                    </button>
                  </div>
                </div>

                {/* 2. Government Aadhaar Card Photo */}
                <div className="rounded-3xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900">Government Aadhaar Card</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        userData.aadhaarVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {userData.aadhaarVerified ? "VERIFIED ✓" : "PENDING"}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div
                      onClick={() => openFullscreen(aadhaarUrl, "Government Aadhaar Card Photo")}
                      className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer aspect-[1.58/1]"
                    >
                      <img
                        src={aadhaarUrl}
                        alt="Aadhaar Card"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                        <Eye size={14} /> Click to Enlarge
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Aadhaar #:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-950">
                          <span>{aadhaarNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(aadhaarNumber, "Aadhaar Number")}
                            className="p-1 hover:bg-emerald-100 rounded"
                            title="Copy"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">UIDAI Masking:</span>
                        <span className="text-emerald-700 font-bold text-[10px]">COMPLIANT (8 Digits Masked)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Name on Card:</span>
                        <span className="font-semibold text-gray-800">{userData.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => handleToggleKyc("aadhaarVerified")}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        userData.aadhaarVerified
                          ? "border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      }`}
                    >
                      {userData.aadhaarVerified ? "Revoke Aadhaar Verification" : "Verify Aadhaar Proof"}
                    </button>
                  </div>
                </div>

                {/* 3. Driving Licence Card */}
                <div className="rounded-3xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-gray-900">Driving Licence (DMV)</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        userData.licenseVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {userData.licenseVerified ? "VERIFIED ✓" : "UNVERIFIED"}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div
                      onClick={() => openFullscreen(dlUrl, "Driver's License Photo")}
                      className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer aspect-[1.58/1]"
                    >
                      <img
                        src={dlUrl}
                        alt="Driving License"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                        <Eye size={14} /> Click to Enlarge
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">License #:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-950">
                          <span>{dlNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(dlNumber, "DL Number")}
                            className="p-1 hover:bg-emerald-100 rounded"
                            title="Copy"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Class:</span>
                        <span className="font-semibold text-gray-800">MCWG / LMV (Two-Wheeler)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Valid Thru:</span>
                        <span className="font-semibold text-gray-800">{dlExpiry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => handleToggleKyc("licenseVerified")}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        userData.licenseVerified
                          ? "border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      }`}
                    >
                      {userData.licenseVerified ? "Revoke License Verification" : "Verify Driving Licence"}
                    </button>
                  </div>
                </div>

                {/* 4. Owner Fleet Vehicle RC & Insurance Proof (If Owner) */}
                {userData.role === "owner" && (
                  <div className="rounded-3xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between md:col-span-2 lg:col-span-3">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-bold text-gray-900">
                          Host Fleet Vehicle Registration (RC) &amp; Insurance Proofs
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {userVehicles.length} Vehicles Listed
                      </span>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userVehicles.map((v) => (
                        <div
                          key={v.id}
                          className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start gap-4"
                        >
                          <img
                            src={v.imageUrl}
                            alt={v.name}
                            className="w-16 h-14 rounded-xl object-cover shrink-0 cursor-pointer"
                            onClick={() => openFullscreen(v.imageUrl, v.name)}
                          />
                          <div className="space-y-1 flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900">{v.name}</h4>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                {v.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono">
                              RC: {v.documents?.rcNumber || "CAL-MOT-33411"}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => openFullscreen("/vehicle_rc_proof.svg", `RC Certificate - ${v.name}`)}
                                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <Eye size={12} /> View RC Form 23
                              </button>
                              <span className="text-gray-300">•</span>
                              <span className="text-[10px] text-gray-500">
                                Ins: {v.documents?.insuranceExpiry || "2027-12-31"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED USER PROFILE */}
          {activeTab === "details" && (
            <div className="bg-gray-50/60 rounded-3xl p-6 border border-gray-200/80 space-y-6">
              <h3 className="text-sm font-bold text-gray-900">Complete System Account Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">User ID</span>
                  <p className="font-mono font-bold text-gray-800">{userData.id}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">Full Name</span>
                  <p className="font-bold text-gray-800">{userData.name}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">Primary Role</span>
                  <p className="font-bold text-emerald-800 uppercase">{userData.role.replace("_", " ")}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">Email Address</span>
                  <p className="font-mono font-bold text-gray-800">{userData.email}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">Mobile Phone</span>
                  <p className="font-mono font-bold text-gray-800">{userData.phone}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">University Campus</span>
                  <p className="font-bold text-gray-800">{userData.campus}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">College Department &amp; Year</span>
                  <p className="font-bold text-gray-800">{userData.collegeYear || "Undergraduate '27"}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">Account Status</span>
                  <p className="font-bold uppercase text-emerald-700">{userData.status}</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium">Platform Joined Date</span>
                  <p className="font-bold text-gray-800">{userData.joinedDate || "2026-01-15"}</p>
                </div>
              </div>

              {/* Security & Audit Summary */}
              <div className="p-4 rounded-2xl bg-white border border-gray-100 space-y-2">
                <h4 className="text-xs font-bold text-gray-900">Admin Audit Compliance Statement</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Both College Student ID and Government Aadhaar Card numbers are stored with platform cryptographic masking in compliance with UIDAI security guidelines. Verification logs are permanently preserved in the platform audit trail for insurance and campus authority inspections.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: RENTAL ACTIVITY OR FLEET LISTINGS */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {userData.role === "owner" ? (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Host Vehicle Fleet Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userVehicles.map((v) => (
                      <div key={v.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                        <div className="flex items-center gap-3">
                          <img src={v.imageUrl} alt="" className="w-12 h-10 rounded-xl object-cover" />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{v.name}</p>
                            <p className="text-[11px] text-gray-500">{v.vehicleType} · {v.locationHub}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                          <span className="text-gray-500">Hourly Rate:</span>
                          <span className="font-bold text-emerald-800">${v.hourlyPrice.toFixed(2)}/hr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Student Rental Activity History</h3>
                  {userBookings.length > 0 ? (
                    <div className="space-y-3">
                      {userBookings.map((b) => (
                        <div key={b.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={b.vehicleImage} alt="" className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-gray-900">{b.vehicleName}</p>
                              <p className="text-[11px] text-gray-500">{b.campusHub} · {b.durationHours} hrs</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 block">${b.totalCost.toFixed(2)}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-6 text-center">No previous rental bookings on record.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Toolbar */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Admin Actions:</span>
            <button
              type="button"
              onClick={handleApproveAllKyc}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Verify All KYC
            </button>
            <button
              type="button"
              onClick={handleToggleAccountStatus}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
            >
              {userData.status === "active" ? "Suspend Account" : "Activate Account"}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>

      {/* High-Resolution Document Lightbox */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={fullscreenImage} alt={fullscreenTitle} className="w-full h-auto rounded-2xl" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">{fullscreenTitle}</h4>
                <p className="text-[11px] text-gray-500 font-mono">
                  Wheelzy Verified Identification File · MinIO Secured
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenImage(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
