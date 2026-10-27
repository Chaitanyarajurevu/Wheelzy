"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Car,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  FileCheck2,
  Eye,
  Lock,
  Unlock,
  CreditCard,
  Camera,
  Copy,
  Check,
  Building,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  Zap,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  dataStore,
  StoredBooking,
  User as UserType,
  StoredVehicle,
  IncidentReport,
} from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface AdminBookingDetailsModalProps {
  booking: StoredBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated?: () => void;
}

export function getBookingStatusBadge(status: string) {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "active":
      return {
        label: "ACTIVE",
        className: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30",
        dotColor: "bg-emerald-500",
      };
    case "pending":
      return {
        label: "PENDING",
        className: "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/30",
        dotColor: "bg-amber-500",
      };
    case "confirmed":
    case "approved":
      return {
        label: "CONFIRMED",
        className: "bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400/30",
        dotColor: "bg-blue-500",
      };
    case "returned":
    case "completed":
      return {
        label: "RETURNED",
        className: "bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-400/30",
        dotColor: "bg-teal-500",
      };
    case "cancelled":
      return {
        label: "CANCELLED",
        className: "bg-slate-100 text-slate-700 border-slate-300",
        dotColor: "bg-slate-400",
      };
    case "rejected":
      return {
        label: "REJECTED",
        className: "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400/30",
        dotColor: "bg-rose-500",
      };
    default:
      return {
        label: (status || "UNKNOWN").toUpperCase(),
        className: "bg-gray-100 text-gray-700 border-gray-300",
        dotColor: "bg-gray-400",
      };
  }
}

export default function AdminBookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onBookingUpdated,
}: AdminBookingDetailsModalProps) {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "parties" | "booking" | "renter" | "owner" | "vehicle" | "return" | "documents"
  >("parties");

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Secure unmasking state for sensitive identity records
  const [revealedRenterAadhaar, setRevealedRenterAadhaar] = useState(false);
  const [revealedOwnerAadhaar, setRevealedOwnerAadhaar] = useState(false);

  // Expanded document preview modal
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    type: string;
    url: string;
    isAadhaar?: boolean;
    maskedNumber?: string;
  } | null>(null);

  if (!isOpen || !booking) return null;

  // Authorization enforcement: Only system_admin may view full admin details and Aadhaar records
  const isAuthorizedAdmin = role === "system_admin";

  const renterUser: UserType | undefined = dataStore.getUserById(booking.renterId);
  const ownerUser: UserType | undefined = dataStore.getUserById(booking.ownerId);
  const vehicle: StoredVehicle | undefined = dataStore.getVehicleById(booking.vehicleId);

  // Linked reports/incidents
  const linkedReports: IncidentReport[] = dataStore
    .getReports()
    .filter(
      (r) =>
        r.targetId === booking.id ||
        (r.targetType === "booking" && r.targetId === booking.id) ||
        (r.targetType === "vehicle" && r.targetId === booking.vehicleId)
    );

  const statusBadge = getBookingStatusBadge(booking.status);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Secure unmasking handlers
  const handleRevealRenterAadhaar = () => {
    if (!isAuthorizedAdmin) {
      toast.error("Access denied: Administrative privileges required.");
      return;
    }
    setRevealedRenterAadhaar(true);
    dataStore.addAuditLog(
      user?.name || "Admin (Alex Rivera)",
      "system_admin",
      `SECURE_AADHAAR_ACCESS: Administrator accessed renter Aadhaar verification proof`,
      `Renter: ${booking.renterName} (${booking.renterId}) | Booking: ${booking.id}`
    );
    toast.success("Aadhaar document unmasked. Action recorded in tamper-evident audit log.");
  };

  const handleRevealOwnerAadhaar = () => {
    if (!isAuthorizedAdmin) {
      toast.error("Access denied: Administrative privileges required.");
      return;
    }
    setRevealedOwnerAadhaar(true);
    dataStore.addAuditLog(
      user?.name || "Admin (Alex Rivera)",
      "system_admin",
      `SECURE_AADHAAR_ACCESS: Administrator accessed owner Aadhaar verification proof`,
      `Owner: ${booking.ownerName} (${booking.ownerId}) | Booking: ${booking.id}`
    );
    toast.success("Aadhaar document unmasked. Action recorded in tamper-evident audit log.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background Overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Spacious Modal Container */}
      <div className="relative z-10 w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] font-sans">

        {/* Modal Top Banner - Dark Navy Wheelzy Header */}
        <div className="bg-[#0A1F1A] text-white p-6 sm:p-8 border-b border-emerald-950/40 relative shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {booking.id}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase flex items-center gap-1.5 border ${statusBadge.className}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusBadge.dotColor}`} />
                  {statusBadge.label}
                </span>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/10 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  System Administrator Clearance
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{booking.vehicleName}</span>
                <span className="text-sm font-semibold text-emerald-300 px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800">
                  {booking.vehicleType}
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 flex flex-wrap items-center gap-3">
                <span>
                  Renter: <strong className="text-white font-bold">{booking.renterName}</strong>
                </span>
                <span className="text-emerald-500">•</span>
                <span>
                  Host Owner: <strong className="text-white font-bold">{booking.ownerName}</strong>
                </span>
                <span className="text-emerald-500">•</span>
                <span className="text-emerald-200">Campus Hub: {booking.campusHub}</span>
              </p>
            </div>

            <div className="flex items-center gap-6 self-start lg:self-center">
              <div className="text-right bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Total Quoted Quote</p>
                <p className="text-3xl font-black text-white">${booking.totalCost.toFixed(2)}</p>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-6 -mb-2 border-t border-white/10 pt-4">
            {[
              { id: "parties", label: "Renter & Owner Dossier", icon: Layers, highlight: true },
              { id: "booking", label: "Booking & Trip Info", icon: FileText },
              { id: "renter", label: "Renter KYC Full Details", icon: User },
              { id: "owner", label: "Owner KYC Full Details", icon: Building },
              { id: "vehicle", label: "Vehicle & RC Specs", icon: Car },
              { id: "return", label: "Return & Inspection", icon: Camera, badge: booking.returnPhotoUrl ? "Photo Proof" : undefined },
              { id: "documents", label: "Verification Documents", icon: ShieldCheck, badge: "Aadhaar / ID" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${isActive
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-300/40"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300"
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#FAFAFD]">

          {/* TAB 1: PARTIES AT A GLANCE (RENTER & OWNER SIDE-BY-SIDE) */}
          {activeTab === "parties" && (
            <div className="space-y-6">

              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      Renter & Host Owner Full Information for Booking #{booking.id}
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Side-by-side identity verification, campus affiliation, direct contact details, and account status.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                  {booking.durationHours} Hours Reserved
                </span>
              </div>

              {/* Side-by-Side Cards: Renter vs Owner */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Complete Renter Card */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-5 hover:border-emerald-300 transition-all">
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={renterUser?.avatar || booking.renterAvatar}
                        alt={booking.renterName}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-gray-900">{renterUser?.name || booking.renterName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono">
                            RENTER
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500">{renterUser?.campus || booking.renterCampus}</p>
                        <p className="text-[11px] font-mono text-emerald-700 mt-0.5">User ID: {booking.renterId}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${(renterUser?.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                    >
                      {renterUser?.status || "active"}
                    </span>
                  </div>

                  {/* Renter Contact & Registration Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Email</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 truncate">{renterUser?.email || "renter@campus.edu"}</p>
                        <button
                          onClick={() => copyToClipboard(renterUser?.email || "renter@campus.edu", "Renter Email")}
                          className="p-1 rounded text-gray-400 hover:text-emerald-700"
                          title="Copy Email"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Admin View
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-emerald-900 font-mono">
                          {isAuthorizedAdmin ? renterUser?.phone || "+1 (510) 931-4422" : "••••••••••"}
                        </p>
                        <button
                          onClick={() => copyToClipboard(renterUser?.phone || "+1 (510) 931-4422", "Renter Phone")}
                          className="p-1 rounded text-gray-400 hover:text-emerald-700"
                          title="Copy Phone"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Student Reg ID (SID)</p>
                      <p className="font-mono font-bold text-gray-900">
                        {renterUser?.studentIdNumber || booking.renterStudentIdNumber || "SID-UCB-2024-99214"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">College Class & Program</p>
                      <p className="font-bold text-gray-900">{renterUser?.collegeYear || "Bioengineering '26"}</p>
                    </div>
                  </div>

                  {/* Renter KYC Badges */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">KYC & Document Statuses</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Student ID: {renterUser?.studentVerified || booking.renterStudentVerified ? "VERIFIED" : "PENDING"}</span>
                      </span>

                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Aadhaar KYC: {renterUser?.aadhaarVerified || booking.renterAadhaarVerified ? "VERIFIED" : "PENDING"}</span>
                      </span>

                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-gray-700 border border-gray-200 flex items-center gap-1.5">
                        <FileCheck2 size={13} className="text-gray-500" />
                        <span>License: {renterUser?.licenseVerified ? "VERIFIED (CA Class M2)" : "NOT REQUIRED"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Document Trigger */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          title: `${booking.renterName} – Student ID Proof`,
                          type: "College Student Credential",
                          url: renterUser?.studentIdCardUrl || booking.renterStudentIdUrl || "/student_id_proof.svg",
                        })
                      }
                      className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-emerald-300 text-xs font-bold text-gray-800 hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>Inspect Student ID Card</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("documents")}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck size={14} />
                      <span>Review Aadhaar Proof</span>
                    </button>
                  </div>
                </div>

                {/* 2. Complete Owner Card */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-5 hover:border-emerald-300 transition-all">
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={ownerUser?.avatar || booking.ownerAvatar}
                        alt={booking.ownerName}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-gray-900">{ownerUser?.name || booking.ownerName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono">
                            HOST OWNER
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500">{ownerUser?.campus || "UC Berkeley"}</p>
                        <p className="text-[11px] font-mono text-emerald-700 mt-0.5">User ID: {booking.ownerId}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${(ownerUser?.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                    >
                      {ownerUser?.status || "active"}
                    </span>
                  </div>

                  {/* Owner Contact & Registration Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Email</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 truncate">{ownerUser?.email || "owner@campus.edu"}</p>
                        <button
                          onClick={() => copyToClipboard(ownerUser?.email || "owner@campus.edu", "Owner Email")}
                          className="p-1 rounded text-gray-400 hover:text-emerald-700"
                          title="Copy Email"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Mobile Number</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Admin View
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-emerald-900 font-mono">
                          {isAuthorizedAdmin ? ownerUser?.phone || "+1 (510) 842-1200" : "••••••••••"}
                        </p>
                        <button
                          onClick={() => copyToClipboard(ownerUser?.phone || "+1 (510) 842-1200", "Owner Phone")}
                          className="p-1 rounded text-gray-400 hover:text-emerald-700"
                          title="Copy Phone"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Student Reg ID (SID)</p>
                      <p className="font-mono font-bold text-gray-900">{ownerUser?.studentIdNumber || "SID-UCB-77102"}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Host Member Since</p>
                      <p className="font-bold text-gray-900">{ownerUser?.joinedDate || "2026-01-15"}</p>
                    </div>
                  </div>

                  {/* Owner KYC Badges */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">KYC & Fleet Statuses</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Student ID: {ownerUser?.studentVerified ? "VERIFIED" : "PENDING"}</span>
                      </span>

                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Aadhaar KYC: {ownerUser?.aadhaarVerified ? "VERIFIED" : "PENDING"}</span>
                      </span>

                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <Car size={13} className="text-emerald-600" />
                        <span>Fleet: Verified Host</span>
                      </span>
                    </div>
                  </div>

                  {/* Quick Document Trigger */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          title: `${booking.ownerName} – Host Student ID Proof`,
                          type: "College Student Credential",
                          url: ownerUser?.studentIdCardUrl || "/student_id_proof.svg",
                        })
                      }
                      className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-emerald-300 text-xs font-bold text-gray-800 hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>Inspect Host Student ID</span>
                    </button>

                    <button
                      onClick={() => setActiveTab("documents")}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck size={14} />
                      <span>Review Aadhaar Proof</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicle & Trip Summary Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Vehicle Quick Card */}
                <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={vehicle?.imageUrl || booking.vehicleImage}
                      alt={booking.vehicleName}
                      className="w-14 h-12 rounded-xl object-cover border border-gray-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{booking.vehicleName}</p>
                      <p className="text-[11px] text-gray-500">{booking.vehicleType}</p>
                      <p className="text-[10px] font-mono text-emerald-800 mt-0.5">
                        RC: {vehicle?.documents?.rcNumber || booking.vehicleRegistrationNumber || "CA-CYCLE-7712"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("vehicle")}
                    className="w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 flex items-center justify-center gap-1"
                  >
                    <span>Inspect Vehicle & RC</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Schedule Quick Card */}
                <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-sm space-y-2 text-xs">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Trip Window</p>
                  <p className="font-bold text-gray-900">{booking.pickupTime} – {booking.dropoffTime}</p>
                  <p className="text-gray-500">Duration: {booking.durationHours} hrs @ ${booking.hourlyRate}/hr</p>
                  <p className="text-emerald-700 font-semibold truncate">Hub: {booking.campusHub}</p>
                </div>

                {/* Financial Summary Quick Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-[#0A1F1A] text-white shadow-sm space-y-2">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase">Pricing Calculation</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-emerald-100">Quoted Total:</span>
                    <span className="text-2xl font-black text-white">${booking.totalCost.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-emerald-200/80 leading-tight">
                    Includes ${booking.platformFee ?? 2.0} platform fee & ${booking.depositAmount ?? 15.0} deposit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKING INFORMATION */}
          {activeTab === "booking" && (
            <div className="space-y-6">
              {/* Cancellation or Rejection Alerts */}
              {booking.status === "cancelled" && (
                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 flex items-start gap-3.5 text-slate-800">
                  <AlertTriangle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Booking Cancelled Prior to Ride
                    </h4>
                    <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                      {booking.cancellationReason || "No cancellation reason was submitted."}
                    </p>
                  </div>
                </div>
              )}

              {booking.status === "rejected" && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-rose-800">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">
                      Booking Request Rejected by Host
                    </h4>
                    <p className="text-xs mt-1 text-rose-700 leading-relaxed">
                      {booking.rejectionReason || "No rejection reason provided by host."}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Booking ID</p>
                  <p className="text-base font-black font-mono text-emerald-700">{booking.id}</p>
                  <p className="text-xs text-gray-500">Universal ledger reference</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Booking Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Live system state</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Booking Created Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(booking.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Recorded reservation timestamp</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Requested Schedule</p>
                  <p className="text-sm font-bold text-gray-900">
                    {booking.pickupTime} – {booking.dropoffTime}
                  </p>
                  <p className="text-xs text-gray-500">Reserved window: {booking.durationHours} hrs</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actual Ride Start</p>
                  <p className="text-sm font-bold text-gray-900">
                    {booking.actualStartTime || (booking.status === "active" ? "Started today" : "Not yet commenced")}
                  </p>
                  <p className="text-xs text-gray-500">Digital unlock confirmation</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actual Return Time</p>
                  <p className="text-sm font-bold text-gray-900">
                    {booking.actualReturnTime || (booking.status === "returned" ? booking.returnTimestamp : "Pending vehicle return")}
                  </p>
                  <p className="text-xs text-gray-500">Hub dropoff inspection</p>
                </div>
              </div>

              {/* Pricing & Future Payment Integration Callout */}
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">Financial & Quote Breakdown</h3>
                    <p className="text-xs text-gray-500">Platform pricing structure calculated for this reservation.</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    <CreditCard size={14} className="text-amber-600" />
                    <span>Payment Gateway: Future Phase</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Hourly Rental Amount</p>
                    <p className="text-xl font-black text-gray-900">
                      ${(booking.hourlyRate * booking.durationHours).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{booking.durationHours} hrs @ ${booking.hourlyRate.toFixed(2)}/hr</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Platform Fee</p>
                    <p className="text-xl font-black text-gray-900">
                      ${(booking.platformFee ?? 2.0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Campus hub operations fee</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">Security Deposit</p>
                    <p className="text-xl font-black text-gray-900">
                      ${(booking.depositAmount ?? 15.0).toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold">Refundable upon return inspection</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase">Total Quoted Amount</p>
                    <p className="text-2xl font-black text-emerald-900">
                      ${booking.totalCost.toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-700">Calculated platform quote</p>
                  </div>
                </div>

                <div className="rounded-2xl p-4 bg-gray-50 text-gray-600 text-xs leading-relaxed border border-gray-200/80 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Policy Note on Payments:</strong> Wheelzy platform payment gateway integration is scheduled for an upcoming release phase. Quoted sums represent pre-ride cost estimates and platform calculations. No real credit transactions have been charged or settled at this stage.
                  </p>
                </div>
              </div>

              {/* Digital Unlock Information */}
              {booking.digitalUnlockCode && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-[#0A1F1A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Unlock size={15} />
                      <span>Smart Lock Digital One-Time Passcode</span>
                    </p>
                    <p className="text-xs text-emerald-100">
                      Generated upon host confirmation for physical bike lock release at campus hub.
                    </p>
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 font-mono text-2xl font-black tracking-widest text-emerald-300">
                    {booking.digitalUnlockCode}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RENTER KYC FULL DETAILS */}
          {activeTab === "renter" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-5">
                    <img
                      src={renterUser?.avatar || booking.renterAvatar}
                      alt={booking.renterName}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-black text-gray-900">{renterUser?.name || booking.renterName}</h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          RENTER
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{renterUser?.campus || booking.renterCampus}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">User ID: {booking.renterId}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${(renterUser?.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                    >
                      Account: {renterUser?.status || "active"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Registered Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 truncate">{renterUser?.email || "renter@campus.edu"}</p>
                      <button onClick={() => copyToClipboard(renterUser?.email || "renter@campus.edu", "Renter Email")} className="p-1 text-gray-400 hover:text-emerald-700">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-gray-400 uppercase">Mobile Number</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Admin Only
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 font-mono">
                        {isAuthorizedAdmin ? renterUser?.phone || "+1 (510) 931-4422" : "••••••••••"}
                      </p>
                      <button onClick={() => copyToClipboard(renterUser?.phone || "+1 (510) 931-4422", "Renter Phone")} className="p-1 text-gray-400 hover:text-emerald-700">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">College / Campus</p>
                    <p className="text-xs font-bold text-gray-900">{renterUser?.campus || "UC Berkeley"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Student Registration ID</p>
                    <p className="text-xs font-bold text-emerald-800 font-mono">
                      {renterUser?.studentIdNumber || booking.renterStudentIdNumber || "SID-UCB-2024-99214"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Student ID Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {renterUser?.studentVerified || booking.renterStudentVerified ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                          <Clock size={13} className="text-amber-600" />
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Driving License Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {renterUser?.licenseVerified ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          VERIFIED ({renterUser.drivingLicenseNumber || "CA-M2"})
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500">NOT REQUIRED FOR BICYCLES</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identity Proofs Preview Cards for Renter */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Renter Identity Documents
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student ID Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <GraduationCap size={16} className="text-emerald-600" />
                          Student ID Proof
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {renterUser?.studentVerified || booking.renterStudentVerified ? "VERIFIED" : "PENDING"}
                        </span>
                      </div>
                      <div className="h-40 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                        <img
                          src={renterUser?.studentIdCardUrl || booking.renterStudentIdUrl || "/student_id_proof.svg"}
                          alt="Renter Student ID Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-600 text-xs">
                          {renterUser?.studentIdNumber || booking.renterStudentIdNumber || "SID-UCB-2024-99214"}
                        </span>
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              title: `${renterUser?.name || booking.renterName} – Student ID Proof`,
                              type: "College Student Credential",
                              url: renterUser?.studentIdCardUrl || booking.renterStudentIdUrl || "/student_id_proof.svg",
                            })
                          }
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Inspect Proof</span>
                        </button>
                      </div>
                    </div>

                    {/* Aadhaar Verification Record Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-emerald-600" />
                          Aadhaar KYC Verification
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {renterUser?.aadhaarVerified || booking.renterAadhaarVerified ? "VERIFIED" : "PENDING"}
                        </span>
                      </div>

                      {!revealedRenterAadhaar ? (
                        <div className="h-40 rounded-xl bg-gray-50 border border-dashed border-gray-300 p-4 flex flex-col items-center justify-center text-center space-y-2">
                          <Lock className="w-6 h-6 text-gray-400" />
                          <p className="text-xs font-semibold text-gray-700">
                            Masked Aadhaar Number:{" "}
                            <span className="font-mono font-bold text-emerald-700">
                              XXXX-XXXX-{(renterUser?.aadhaarNumber || booking.renterAadhaarNumber || "9021").slice(-4)}
                            </span>
                          </p>
                          <button
                            onClick={handleRevealRenterAadhaar}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Unlock size={13} />
                            <span>Authorized Unmask & Inspect</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-40 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200 flex items-center justify-center">
                            <img
                              src={renterUser?.aadhaarCardUrl || booking.renterAadhaarUrl || "/aadhaar_card_proof.svg"}
                              alt="Aadhaar KYC Document"
                              className="w-full h-full object-cover select-none pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[0.5px] pointer-events-none flex items-center justify-center">
                              <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/70 px-3 py-1 rounded">
                                CONFIDENTIAL ADMIN RECORD
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-gray-700 font-bold text-xs">
                              {renterUser?.aadhaarNumber || booking.renterAadhaarNumber || "XXXX-XXXX-9021"}
                            </span>
                            <span className="text-xs text-emerald-700 font-semibold">Audit Logged ✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OWNER KYC FULL DETAILS */}
          {activeTab === "owner" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-5">
                    <img
                      src={ownerUser?.avatar || booking.ownerAvatar}
                      alt={booking.ownerName}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-black text-gray-900">{ownerUser?.name || booking.ownerName}</h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          HOST OWNER
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{ownerUser?.campus || "UC Berkeley"}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">User ID: {booking.ownerId}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${(ownerUser?.status || "active") === "active"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                    >
                      Account: {ownerUser?.status || "active"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Registered Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 truncate">{ownerUser?.email || "owner@campus.edu"}</p>
                      <button onClick={() => copyToClipboard(ownerUser?.email || "owner@campus.edu", "Owner Email")} className="p-1 text-gray-400 hover:text-emerald-700">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-gray-400 uppercase">Mobile Number</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Admin Only
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 font-mono">
                        {isAuthorizedAdmin ? ownerUser?.phone || "+1 (510) 842-1200" : "••••••••••"}
                      </p>
                      <button onClick={() => copyToClipboard(ownerUser?.phone || "+1 (510) 842-1200", "Owner Phone")} className="p-1 text-gray-400 hover:text-emerald-700">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">College / Campus</p>
                    <p className="text-xs font-bold text-gray-900">{ownerUser?.campus || "UC Berkeley"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Student Registration ID</p>
                    <p className="text-xs font-bold text-emerald-800 font-mono">
                      {ownerUser?.studentIdNumber || "SID-UCB-77102"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Student ID Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {ownerUser?.studentVerified ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                          <Clock size={13} className="text-amber-600" />
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Member Since</p>
                    <p className="text-xs font-bold text-gray-900">{ownerUser?.joinedDate || "2026-01-15"}</p>
                  </div>
                </div>

                {/* Identity Proofs Preview Cards for Owner */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Host Owner Identity Documents
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner Student ID Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <GraduationCap size={16} className="text-emerald-600" />
                          Host Student ID Proof
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {ownerUser?.studentVerified ? "VERIFIED" : "PENDING"}
                        </span>
                      </div>
                      <div className="h-40 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                        <img
                          src={ownerUser?.studentIdCardUrl || "/student_id_proof.svg"}
                          alt="Host Student ID Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-600 text-xs">
                          {ownerUser?.studentIdNumber || "SID-UCB-77102"}
                        </span>
                        <button
                          onClick={() =>
                            setPreviewDoc({
                              title: `${ownerUser?.name || booking.ownerName} – Host Student ID Proof`,
                              type: "College Student Credential",
                              url: ownerUser?.studentIdCardUrl || "/student_id_proof.svg",
                            })
                          }
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Inspect Proof</span>
                        </button>
                      </div>
                    </div>

                    {/* Owner Aadhaar Verification Record Card */}
                    <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-300 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-emerald-600" />
                          Host Aadhaar KYC Verification
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {ownerUser?.aadhaarVerified ? "VERIFIED" : "PENDING"}
                        </span>
                      </div>

                      {!revealedOwnerAadhaar ? (
                        <div className="h-40 rounded-xl bg-gray-50 border border-dashed border-gray-300 p-4 flex flex-col items-center justify-center text-center space-y-2">
                          <Lock className="w-6 h-6 text-gray-400" />
                          <p className="text-xs font-semibold text-gray-700">
                            Masked Aadhaar Number:{" "}
                            <span className="font-mono font-bold text-emerald-700">
                              XXXX-XXXX-{(ownerUser?.aadhaarNumber || "4410").slice(-4)}
                            </span>
                          </p>
                          <button
                            onClick={handleRevealOwnerAadhaar}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Unlock size={13} />
                            <span>Authorized Unmask & Inspect</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-40 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200 flex items-center justify-center">
                            <img
                              src={ownerUser?.aadhaarCardUrl || "/aadhaar_card_proof.svg"}
                              alt="Owner Aadhaar KYC Document"
                              className="w-full h-full object-cover select-none pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[0.5px] pointer-events-none flex items-center justify-center">
                              <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/70 px-3 py-1 rounded">
                                CONFIDENTIAL ADMIN RECORD
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-gray-700 font-bold text-xs">
                              {ownerUser?.aadhaarNumber || "XXXX-XXXX-4410"}
                            </span>
                            <span className="text-xs text-emerald-700 font-semibold">Audit Logged ✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VEHICLE & RC */}
          {activeTab === "vehicle" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-5">
                    <img
                      src={vehicle?.imageUrl || booking.vehicleImage}
                      alt={booking.vehicleName}
                      className="w-24 h-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-black text-gray-900">{booking.vehicleName}</h3>
                        <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {booking.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{vehicle?.model || booking.vehicleModel}</p>
                      <p className="text-xs font-mono text-emerald-700 mt-0.5">
                        Vehicle ID: {booking.vehicleId} • {booking.vehicleType}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      Fleet Status: {vehicle?.status || "approved"}
                    </span>
                  </div>
                </div>

                {/* Vehicle Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Registration / RC Number</p>
                    <p className="text-sm font-bold text-emerald-800 font-mono">
                      {vehicle?.documents?.rcNumber || booking.vehicleRegistrationNumber || "CA-CYCLE-7712"}
                    </p>
                    <p className="text-[11px] text-gray-500">Government transport registration</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">RC Verification Status</p>
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>{vehicle?.documents?.verified ? "VERIFIED & APPROVED" : "PENDING AUDIT"}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">
                      {vehicle?.documents?.rcMinioKey || "minio://wheelzy-docs/rc.pdf"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Insurance Document Status</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                      Valid through {vehicle?.documents?.insuranceExpiry || "2027-05-15"}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">Active Third-Party & Rider Cover</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Host Owner Association</p>
                    <p className="text-xs font-bold text-gray-900">{booking.ownerName}</p>
                    <p className="text-[11px] text-gray-500">{booking.ownerId}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Assigned Campus Hub</p>
                    <p className="text-xs font-bold text-gray-900">{booking.campusHub}</p>
                    <p className="text-[11px] text-gray-500">Geofenced pickup bay</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Hourly Listing Rate</p>
                    <p className="text-xs font-bold text-gray-900">${booking.hourlyRate.toFixed(2)} / hr</p>
                    <p className="text-[11px] text-gray-500">Host established tariff</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-0.5">
                    <p className="font-bold">Fleet Compliance & Safety Check</p>
                    <p className="text-emerald-800 leading-relaxed">
                      This vehicle complies with Wheelzy campus speed governs (capped at 25 km/h for e-scooters), passed helmet inspection standards, and has valid student ownership registration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RETURN & INSPECTION */}
          {activeTab === "return" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Return & End-of-Trip Verification</h3>
                    <p className="text-xs text-gray-500">Post-ride photographic proof, hub lock audit, and incident logging.</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${statusBadge.className}`}
                  >
                    Return Status: {booking.status === "returned" || booking.status === "completed" ? "RETURNED & INSPECTED" : booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Return Photo Preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Camera size={15} className="text-emerald-600" />
                      <span>Return Handover Photo</span>
                    </h4>

                    {booking.returnPhotoUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 relative group">
                        <img
                          src={booking.returnPhotoUrl}
                          alt="Vehicle Return Proof"
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5 text-white">
                          <div className="space-y-1">
                            <p className="text-xs font-bold">Uploaded by {booking.renterName}</p>
                            <p className="text-xs text-gray-300">
                              Timestamp: {booking.returnPhotoTimestamp || booking.returnTimestamp || "Recorded at return"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <Camera className="w-10 h-10 text-gray-400" />
                        <p className="text-sm font-bold text-gray-700">No Return Photo Available</p>
                        <p className="text-xs text-gray-500 max-w-sm">
                          {booking.status === "active"
                            ? "Ride is currently active in transit. The renter will upload a hub parking photo when ending the ride."
                            : "Vehicle was returned without digital photo or was cancelled prior to trip commencement."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Return Metadata & Checklist */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Handover Audit Record
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Actual Return Timestamp</p>
                        <p className="text-xs font-bold text-gray-900">
                          {booking.actualReturnTime || (booking.status === "returned" ? booking.returnTimestamp : "Pending return dropoff")}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Dropoff Hub</p>
                        <p className="text-xs font-bold text-gray-900">{booking.campusHub}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Renter Return Notes</p>
                        <p className="text-xs text-gray-700 italic leading-relaxed">
                          "{booking.returnNotes || (booking.status === "returned" ? "Vehicle locked safely at campus bay." : "No notes recorded.")}"
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">MinIO Cloud Object Key</p>
                        <p className="text-xs font-mono text-gray-600 truncate">
                          {booking.returnPhotoMinioKey || "minio://wheelzy-media/returns/ret_default.webp"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Incident Reports */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center justify-between">
                    <span>Linked Incidents & Complaints ({linkedReports.length})</span>
                  </h4>

                  {linkedReports.length > 0 ? (
                    <div className="space-y-3">
                      {linkedReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-900 text-sm">
                              #{report.id} – {report.category}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800 uppercase">
                              {report.status}
                            </span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{report.description}</p>
                          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                            <span>Filed by: {report.reporterName} ({report.reporterRole})</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          {report.resolutionNotes && (
                            <p className="bg-white p-3 rounded-xl text-emerald-800 border border-emerald-200 font-medium">
                              Resolution: {report.resolutionNotes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-xs text-gray-500">
                        No incident reports, damages, or complaints filed for this booking.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SECURE VERIFICATION DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Administrator Identity Verification Review</h3>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Confidential administrative clearance node. All inspection actions, document unmasking events, and status checks are logged to Wheelzy's security ledger. Do not download, redistribute, or capture sensitive Aadhaar proofs.
                </p>
              </div>

              {/* Document Review List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Renter Student ID */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Renter Credential</span>
                      <h4 className="text-sm font-black text-gray-900 mt-0.5">College Student ID Card</h4>
                      <p className="text-xs text-gray-500">{booking.renterName} ({renterUser?.campus || booking.renterCampus})</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {renterUser?.studentVerified || booking.renterStudentVerified ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1">
                    <p className="text-gray-500">Registration Number:</p>
                    <p className="font-mono font-bold text-gray-900 text-sm">
                      {renterUser?.studentIdNumber || booking.renterStudentIdNumber || "SID-UCB-2024-99214"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setPreviewDoc({
                        title: `${booking.renterName} – Student ID Card`,
                        type: "Student Identification Proof",
                        url: renterUser?.studentIdCardUrl || booking.renterStudentIdUrl || "/student_id_proof.svg",
                      })
                    }
                    className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye size={15} />
                    <span>View Student ID Document</span>
                  </button>
                </div>

                {/* 2. Renter Aadhaar Card */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Renter KYC (Confidential)</span>
                      <h4 className="text-sm font-black text-gray-900 mt-0.5">Government Aadhaar KYC</h4>
                      <p className="text-xs text-gray-500">{booking.renterName}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {renterUser?.aadhaarVerified || booking.renterAadhaarVerified ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1">
                    <p className="text-gray-500">Aadhaar Number (Masked):</p>
                    <p className="font-mono font-bold text-emerald-800 text-sm">
                      {revealedRenterAadhaar
                        ? renterUser?.aadhaarNumber || booking.renterAadhaarNumber || "XXXX-XXXX-9021"
                        : `XXXX-XXXX-${(renterUser?.aadhaarNumber || booking.renterAadhaarNumber || "9021").slice(-4)}`}
                    </p>
                  </div>

                  {!revealedRenterAadhaar ? (
                    <button
                      onClick={handleRevealRenterAadhaar}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Unlock size={15} />
                      <span>Unmask & Review Aadhaar Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          title: `${booking.renterName} – Aadhaar Verification Record`,
                          type: "Aadhaar Identity Proof (Watermarked)",
                          url: renterUser?.aadhaarCardUrl || booking.renterAadhaarUrl || "/aadhaar_card_proof.svg",
                          isAadhaar: true,
                          maskedNumber: renterUser?.aadhaarNumber || booking.renterAadhaarNumber,
                        })
                      }
                      className="w-full py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>View Unmasked Aadhaar Record</span>
                    </button>
                  )}
                </div>

                {/* 3. Owner Student ID */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Host Credential</span>
                      <h4 className="text-sm font-black text-gray-900 mt-0.5">Host Student ID Card</h4>
                      <p className="text-xs text-gray-500">{booking.ownerName} ({ownerUser?.campus || "UC Berkeley"})</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ownerUser?.studentVerified ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1">
                    <p className="text-gray-500">Registration Number:</p>
                    <p className="font-mono font-bold text-gray-900 text-sm">{ownerUser?.studentIdNumber || "SID-UCB-77102"}</p>
                  </div>

                  <button
                    onClick={() =>
                      setPreviewDoc({
                        title: `${booking.ownerName} – Host Student ID Card`,
                        type: "Host Student Credential",
                        url: ownerUser?.studentIdCardUrl || "/student_id_proof.svg",
                      })
                    }
                    className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye size={15} />
                    <span>View Host Student ID Document</span>
                  </button>
                </div>

                {/* 4. Owner Aadhaar Card */}
                <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Host KYC (Confidential)</span>
                      <h4 className="text-sm font-black text-gray-900 mt-0.5">Host Aadhaar KYC</h4>
                      <p className="text-xs text-gray-500">{booking.ownerName}</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ownerUser?.aadhaarVerified ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-1">
                    <p className="text-gray-500">Aadhaar Number (Masked):</p>
                    <p className="font-mono font-bold text-emerald-800 text-sm">
                      {revealedOwnerAadhaar
                        ? ownerUser?.aadhaarNumber || "XXXX-XXXX-4410"
                        : `XXXX-XXXX-${(ownerUser?.aadhaarNumber || "4410").slice(-4)}`}
                    </p>
                  </div>

                  {!revealedOwnerAadhaar ? (
                    <button
                      onClick={handleRevealOwnerAadhaar}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Unlock size={15} />
                      <span>Unmask & Review Aadhaar Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          title: `${booking.ownerName} – Aadhaar Verification Record`,
                          type: "Aadhaar Identity Proof (Watermarked)",
                          url: ownerUser?.aadhaarCardUrl || "/aadhaar_card_proof.svg",
                          isAadhaar: true,
                          maskedNumber: ownerUser?.aadhaarNumber,
                        })
                      }
                      className="w-full py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>View Unmasked Aadhaar Record</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audited session for admin {user?.name || "Alex Rivera"}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close Record
            </button>
          </div>
        </div>
      </div>

      {/* Internal High-Security Document Viewer Dialog */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setPreviewDoc(null)} />
          <div className="relative z-10 max-w-2xl w-full p-6 rounded-3xl bg-white border border-gray-100 shadow-2xl font-sans space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  {previewDoc.type}
                </span>
                {previewDoc.isAadhaar && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    NO EXPORT / AUDIT RECORDED
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-gray-900">{previewDoc.title}</h3>
              <p className="text-xs text-gray-500">
                Official verification record inspected under administrative clearance.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-50 flex items-center justify-center p-3 select-none">
              <img
                src={previewDoc.url}
                alt="Identity Proof"
                className="max-h-[55vh] w-auto object-contain rounded-xl select-none pointer-events-none"
                onContextMenu={(e) => e.preventDefault()}
              />
              {/* Security Watermark for Aadhaar/Confidential views */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center rotate-[-25deg] opacity-25">
                <span className="text-lg sm:text-2xl font-black text-emerald-950 uppercase tracking-widest text-center">
                  WHEELZY CONFIDENTIAL<br />
                  ADMIN VERIFICATION ONLY<br />
                  AUDIT LOGGED
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-gray-500">
                {previewDoc.maskedNumber ? `Aadhaar: ${previewDoc.maskedNumber}` : "Standard Student Document"}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
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
