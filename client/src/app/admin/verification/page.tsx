"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  FileCheck,
  Car,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  UserCheck,
  FileText,
  FileCheck2,
  Lock,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  Power,
  SlidersHorizontal,
} from "lucide-react";
import {
  dataStore,
  VerificationRequest,
  StoredVehicle,
  User,
  STANDARD_HOURLY_RATE,
} from "@/lib/dataStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminUserProfileModal } from "@/components/AdminUserProfileModal";

type VerificationTab = "student" | "license" | "vehicle";

function VerificationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tab state from URL parameter with fallback to "student"
  const tabParam = searchParams.get("tab") as VerificationTab | null;
  const [activeTab, setActiveTab] = useState<VerificationTab>(
    tabParam === "license" || tabParam === "vehicle" ? tabParam : "student"
  );

  // Sync tab with URL
  useEffect(() => {
    if (tabParam === "student" || tabParam === "license" || tabParam === "vehicle") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const switchTab = (tab: VerificationTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/verification?${params.toString()}`);
  };

  // Data state from central dataStore
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [vehicles, setVehicles] = useState<StoredVehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Search & Status filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campusFilter, setCampusFilter] = useState<string>("all");

  // Profile Dossier Inspection Modal
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

  // Document Fullscreen Preview Modal
  const [previewDocTitle, setPreviewDocTitle] = useState("");
  const [previewDocUrl, setPreviewDocUrl] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Rejection Dialog Modal State
  const [rejectingItem, setRejectingItem] = useState<{
    id: string;
    type: "request" | "vehicle";
    title: string;
    targetVehicleId?: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const reloadData = () => {
    setVerifications(dataStore.getVerifications());
    setVehicles(dataStore.getVehicles());
    setUsers(dataStore.getUsers());
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  // Open Document Preview Modal
  const openDocumentPreview = (title: string, url: string) => {
    setPreviewDocTitle(title);
    setPreviewDocUrl(url);
    setIsPreviewModalOpen(true);
  };

  // Pending Queue Counts
  const pendingStudentCount = useMemo(
    () => verifications.filter((v) => v.type === "student_id" && v.status === "pending").length,
    [verifications]
  );
  const pendingLicenseCount = useMemo(
    () => verifications.filter((v) => v.type === "driving_license" && v.status === "pending").length,
    [verifications]
  );
  const pendingVehicleCount = useMemo(() => {
    const pendingReqs = verifications.filter((v) => v.type === "vehicle_rc" && v.status === "pending").length;
    const pendingVehs = vehicles.filter((v) => v.status === "pending_approval").length;
    return Math.max(pendingReqs, pendingVehs);
  }, [verifications, vehicles]);

  const totalPending = pendingStudentCount + pendingLicenseCount + pendingVehicleCount;

  // ──────────────────────────────────────────────────────────────────────────
  // ACTION HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  // 1. Approve Verification Request (Student or License or RC)
  const handleApproveRequest = (v: VerificationRequest) => {
    dataStore.reviewVerification(v.id, "approved");
    toast.success(`Approved verification for ${v.userName} (${v.documentTitle})`);
    reloadData();
  };

  // 2. Open Rejection Dialog
  const openRejectionDialog = (
    id: string,
    type: "request" | "vehicle",
    title: string,
    targetVehicleId?: string
  ) => {
    setRejectingItem({ id, type, title, targetVehicleId });
    setRejectionReason("");
  };

  // 3. Confirm Rejection with Reason
  const handleConfirmRejection = () => {
    if (!rejectingItem) return;
    const finalReason =
      rejectionReason.trim() || "Documentation is expired, illegible, or details do not match records.";

    if (rejectingItem.type === "request") {
      dataStore.reviewVerification(rejectingItem.id, "rejected", finalReason);
      toast.error(`Rejected verification request for ${rejectingItem.title}`);
    } else {
      dataStore.reviewVehicle(rejectingItem.id, "rejected", finalReason);
      toast.error(`Rejected vehicle listing: ${rejectingItem.title}`);
    }

    setRejectingItem(null);
    setRejectionReason("");
    reloadData();
  };

  // 4. Approve Vehicle Directly (Strictly keeps isAvailable = false until owner schedules!)
  const handleApproveVehicle = (v: StoredVehicle) => {
    dataStore.reviewVehicle(v.id, "approved");
    toast.success(
      `Approved ${v.name}! Status: Approved – Not Listed (Owner must set schedule before listing).`
    );
    reloadData();
  };

  // 5. Toggle Maintenance / Suspension
  const handleToggleMaintenance = (v: StoredVehicle) => {
    const nextStatus = v.status === "maintenance" ? "approved" : "maintenance";
    dataStore.updateVehicleStatus(v.id, nextStatus, false);
    toast.success(`${v.name} status updated to ${nextStatus.toUpperCase()}`);
    reloadData();
  };

  // ──────────────────────────────────────────────────────────────────────────
  // FILTERED DATA
  // ──────────────────────────────────────────────────────────────────────────

  // Filtered Student Requests
  const studentRequests = useMemo(() => {
    return verifications.filter((v) => {
      if (v.type !== "student_id") return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (campusFilter !== "all" && v.campus !== campusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.userName.toLowerCase().includes(q) ||
          v.idNumber.toLowerCase().includes(q) ||
          (v.studentIdNumber && v.studentIdNumber.toLowerCase().includes(q)) ||
          (v.aadhaarNumber && v.aadhaarNumber.toLowerCase().includes(q)) ||
          v.campus.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [verifications, statusFilter, campusFilter, searchQuery]);

  // Filtered License Requests
  const licenseRequests = useMemo(() => {
    return verifications.filter((v) => {
      if (v.type !== "driving_license") return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (campusFilter !== "all" && v.campus !== campusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.userName.toLowerCase().includes(q) ||
          v.idNumber.toLowerCase().includes(q) ||
          (v.drivingLicenseNumber && v.drivingLicenseNumber.toLowerCase().includes(q)) ||
          v.campus.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [verifications, statusFilter, campusFilter, searchQuery]);

  // Filtered Vehicles
  const vehicleList = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && v.status !== "pending_approval") return false;
        if (statusFilter === "approved" && v.status !== "approved") return false;
        if (statusFilter === "rejected" && v.status !== "rejected") return false;
        if (statusFilter === "maintenance" && v.status !== "maintenance") return false;
      }
      if (campusFilter !== "all" && v.campus !== campusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q) ||
          (v.documents?.rcNumber && v.documents.rcNumber.toLowerCase().includes(q)) ||
          v.campus.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehicles, statusFilter, campusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check size={11} className="stroke-[3]" />
            <span>Verified</span>
          </span>
        );
      case "pending":
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending Review</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <X size={11} className="stroke-[3]" />
            <span>Rejected</span>
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <span>Maintenance</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <span>Not Uploaded</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── Top Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Platform Trust &amp; Safety
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Identity &amp; Fleet Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Audit student identities, driving licences, and vehicle registration compliance across university hubs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
            <Clock size={13} className="text-amber-700" />
            <span>Pending Queue: {totalPending}</span>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>

      {/* ── Section Tabs Navigation ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-2 shadow-xs flex flex-wrap sm:flex-nowrap items-center gap-1.5">
        {/* Tab 1: Student Verification */}
        <button
          type="button"
          onClick={() => switchTab("student")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "student"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
          }`}
        >
          <GraduationCap size={16} />
          <span>Student &amp; Aadhaar Verification</span>
          {pendingStudentCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "student" ? "bg-amber-400 text-gray-950" : "bg-amber-100 text-amber-800"
              }`}
            >
              {pendingStudentCount}
            </span>
          )}
        </button>

        {/* Tab 2: Driving Licence */}
        <button
          type="button"
          onClick={() => switchTab("license")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "license"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
          }`}
        >
          <FileCheck size={16} />
          <span>Driving Licence Verification</span>
          {pendingLicenseCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "license" ? "bg-amber-400 text-gray-950" : "bg-amber-100 text-amber-800"
              }`}
            >
              {pendingLicenseCount}
            </span>
          )}
        </button>

        {/* Tab 3: Vehicle Verification */}
        <button
          type="button"
          onClick={() => switchTab("vehicle")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "vehicle"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
          }`}
        >
          <Car size={16} />
          <span>Vehicle &amp; RC Verification</span>
          {pendingVehicleCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === "vehicle" ? "bg-amber-400 text-gray-950" : "bg-amber-100 text-amber-800"
              }`}
            >
              {pendingVehicleCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "student"
                ? "Search by student name, ID number, Aadhaar or campus..."
                : activeTab === "license"
                ? "Search by driver name, DL number, campus..."
                : "Search by vehicle name, owner, RC number, campus..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Verified / Approved</option>
            <option value="rejected">Rejected</option>
            {activeTab === "vehicle" && <option value="maintenance">Maintenance</option>}
          </select>

          {/* Campus Filter */}
          <select
            value={campusFilter}
            onChange={(e) => setCampusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700"
          >
            <option value="all">All Campuses</option>
            <option value="UC Berkeley">UC Berkeley</option>
            <option value="Stanford University">Stanford University</option>
          </select>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          PANEL 1: STUDENT & AADHAAR VERIFICATION
         ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === "student" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Student ID &amp; Aadhaar Submissions ({studentRequests.length})
            </h2>
            <span className="text-xs text-gray-400">
              Authorized System Administrator Audit View
            </span>
          </div>

          {studentRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {studentRequests.map((req) => {
                const userObj = dataStore.getUserById(req.userId);
                const studentProofUrl =
                  req.studentIdUrl || req.documentUrl || userObj?.studentIdCardUrl || "/student_id_proof.svg";
                const aadhaarProofUrl =
                  req.aadhaarUrl || userObj?.aadhaarCardUrl || "/aadhaar_card_proof.svg";
                const isPending = req.status === "pending";

                return (
                  <div
                    key={req.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.userAvatar || "/default_avatar.jpg"}
                            alt=""
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-gray-900 truncate">
                                {req.userName}
                              </h3>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                                {req.userRole || userObj?.role || "RENTER"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{req.campus}</p>
                          </div>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      {/* Rejection Alert if rejected */}
                      {req.status === "rejected" && (
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle size={13} className="text-rose-600" />
                            <span>Rejection Reason:</span>
                          </div>
                          <p className="text-[11px] text-rose-700 pl-4">
                            {req.notes || userObj?.studentIdRejectionReason || "Identity document obscured or expired."}
                          </p>
                        </div>
                      )}

                      {/* Dual Proof Visual Preview (Student ID + Aadhaar Card) */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Student ID Proof Box */}
                        <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                          <div className="aspect-[1.4/1] w-full flex items-center justify-center p-2">
                            <img
                              src={studentProofUrl}
                              alt="Student ID"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-gray-700 font-bold truncate">
                              {req.studentIdNumber || req.idNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => openDocumentPreview("Student ID Card", studentProofUrl)}
                              className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-emerald-50 text-emerald-800 font-semibold cursor-pointer shrink-0"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>

                        {/* Aadhaar Proof Box */}
                        <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                          <div className="aspect-[1.4/1] w-full flex items-center justify-center p-2">
                            <img
                              src={aadhaarProofUrl}
                              alt="Aadhaar Card"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-gray-700 font-bold truncate">
                              {req.aadhaarNumber || userObj?.aadhaarNumber || "Aadhaar Card"}
                            </span>
                            <button
                              type="button"
                              onClick={() => openDocumentPreview("Aadhaar Card Proof", aadhaarProofUrl)}
                              className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-emerald-50 text-emerald-800 font-semibold cursor-pointer shrink-0"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Metadata Chips */}
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Student ID Number:</span>
                          <span className="font-mono font-bold text-gray-900">
                            {req.studentIdNumber || req.idNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Aadhaar Reference:</span>
                          <span className="font-mono font-bold text-gray-800">
                            {req.aadhaarNumber || userObj?.aadhaarNumber || "Encrypted"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Submitted:</span>
                          <span className="text-gray-600">{req.submittedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req)}
                          disabled={req.status === "approved"}
                          className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectionDialog(req.id, "request", req.userName)}
                          disabled={req.status === "rejected"}
                          className="py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setProfileModalUserId(req.userId)}
                        className="w-full py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck size={13} className="text-emerald-700" />
                        <span>Inspect Full Student Dossier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-12 text-center max-w-md mx-auto space-y-3">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No Student Verifications Found</h3>
              <p className="text-xs text-gray-500">
                No requests match the current search or status filter criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          PANEL 2: DRIVING LICENCE VERIFICATION
         ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === "license" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Driving Licence Submissions ({licenseRequests.length})
            </h2>
            <span className="text-xs text-gray-400">
              DMV Two-Wheeler Motorized Vehicle Verification
            </span>
          </div>

          {licenseRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {licenseRequests.map((req) => {
                const userObj = dataStore.getUserById(req.userId);
                const dlProofUrl =
                  req.drivingLicenseUrl || req.documentUrl || userObj?.drivingLicenseUrl || "/driving_license_proof.svg";

                return (
                  <div
                    key={req.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.userAvatar || "/default_avatar.jpg"}
                            alt=""
                            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-gray-900 truncate">
                                {req.userName}
                              </h3>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                                {req.userRole || userObj?.role || "RENTER"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{req.campus}</p>
                          </div>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      {/* Rejection Alert if rejected */}
                      {req.status === "rejected" && (
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle size={13} className="text-rose-600" />
                            <span>Rejection Reason:</span>
                          </div>
                          <p className="text-[11px] text-rose-700 pl-4">
                            {req.notes || "License expired, invalid DMV class, or obscured document photo."}
                          </p>
                        </div>
                      )}

                      {/* Driving License Image Preview */}
                      <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                        <div className="aspect-[1.58/1] w-full flex items-center justify-center p-2.5">
                          <img
                            src={dlProofUrl}
                            alt="Driver License"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="font-mono text-gray-800 font-bold truncate">
                            {req.drivingLicenseNumber || req.idNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => openDocumentPreview("Driving Licence Document", dlProofUrl)}
                            className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>

                      {/* License Metadata */}
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">DMV License #:</span>
                          <span className="font-mono font-bold text-gray-900">
                            {req.drivingLicenseNumber || req.idNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Student ID Link:</span>
                          <span className="font-mono text-gray-700">
                            {userObj?.studentIdNumber || req.studentIdNumber || "Verified"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">MinIO Key:</span>
                          <span className="font-mono text-[10px] text-gray-400 truncate max-w-[150px]">
                            {req.minioKey}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req)}
                          disabled={req.status === "approved"}
                          className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectionDialog(req.id, "request", req.userName)}
                          disabled={req.status === "rejected"}
                          className="py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setProfileModalUserId(req.userId)}
                        className="w-full py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck size={13} className="text-emerald-700" />
                        <span>Inspect Full Driver Dossier</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-12 text-center max-w-md mx-auto space-y-3">
              <FileCheck className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No Driving License Requests</h3>
              <p className="text-xs text-gray-500">
                No driving license records match the selected filter criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          PANEL 3: VEHICLE & RC VERIFICATION (ONE VEHICLE PER OWNER RULE)
         ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === "vehicle" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Registered Campus Vehicles ({vehicleList.length})
              </h2>
              <p className="text-xs text-gray-500">
                Strict 1-vehicle-per-owner fleet policy. Approving marks vehicle as Approved – Not Listed until owner schedules availability.
              </p>
            </div>
            <Link
              href="/admin/vehicles"
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Manage Global Fleet</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {vehicleList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicleList.map((veh) => {
                const ownerUser = dataStore.getUserById(veh.ownerId);
                const rcUrl = veh.documents?.rcDocUrl || "/vehicle_rc_proof.svg";
                const insUrl = veh.documents?.insuranceDocUrl || "/insurance_document_proof.svg";
                const isApproved = veh.status === "approved";
                const isPending = veh.status === "pending_approval";

                return (
                  <div
                    key={veh.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3.5">
                      {/* Top Vehicle Info & Owner */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={veh.ownerAvatar || ownerUser?.avatar || "/default_avatar.jpg"}
                            alt=""
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">{veh.name}</h3>
                            <p className="text-xs text-gray-500 truncate">
                              Host: {veh.ownerName} ({veh.campus})
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(veh.status)}
                      </div>

                      {/* Rejection Alert if rejected */}
                      {veh.status === "rejected" && (
                        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertCircle size={13} className="text-rose-600" />
                            <span>Vehicle Rejection Reason:</span>
                          </div>
                          <p className="text-[11px] text-rose-700 pl-4">
                            {veh.documents?.rcRejectionReason ||
                              "RC registration documentation or insurance expired or mismatched."}
                          </p>
                        </div>
                      )}

                      {/* Dual Visual Previews (Vehicle Photo + RC Document) */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Vehicle Photo */}
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group">
                          <div className="aspect-[1.4/1] w-full flex items-center justify-center">
                            <img
                              src={veh.imageUrl || "/scooter_xiaomi.jpg"}
                              alt={veh.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-1.5 bg-black/60 text-white text-[9px] font-bold absolute bottom-1 left-1 rounded backdrop-blur-xs">
                            {veh.vehicleType}
                          </div>
                        </div>

                        {/* RC Document Preview */}
                        <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 group">
                          <div className="aspect-[1.4/1] w-full flex items-center justify-center p-2">
                            <img src={rcUrl} alt="RC Document" className="w-full h-full object-contain" />
                          </div>
                          <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-gray-700 font-bold truncate">
                              {veh.documents?.rcNumber || "RC Cert"}
                            </span>
                            <button
                              type="button"
                              onClick={() => openDocumentPreview(`RC Document: ${veh.name}`, rcUrl)}
                              className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-emerald-50 text-emerald-800 font-semibold cursor-pointer shrink-0"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Specs & Documents Metadata */}
                      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Designated Hub:</span>
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <MapPin size={11} className="text-emerald-600" />
                            {veh.locationHub}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">RC Number:</span>
                          <span className="font-mono font-bold text-gray-800">
                            {veh.documents?.rcNumber || "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Insurance Expiry:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-gray-700">
                              {veh.documents?.insuranceExpiry || "2027-05-15"}
                            </span>
                            <button
                              type="button"
                              onClick={() => openDocumentPreview(`Insurance: ${veh.name}`, insUrl)}
                              className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                            >
                              [View Policy]
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <span className="text-gray-500">Rental Rate:</span>
                          <span className="font-bold text-emerald-800 font-mono">
                            ₹{STANDARD_HOURLY_RATE}/hr (Fixed)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Listing State:</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              veh.isAvailable
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {veh.isAvailable ? "Active / Listed" : "Approved – Not Listed"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveVehicle(veh)}
                          disabled={veh.status === "approved"}
                          className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectionDialog(veh.id, "vehicle", veh.name)}
                          disabled={veh.status === "rejected"}
                          className="py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleMaintenance(veh)}
                          className="py-2 px-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Power size={12} className={veh.status === "maintenance" ? "text-emerald-600" : "text-amber-600"} />
                          <span>{veh.status === "maintenance" ? "End Maintenance" : "Maintenance"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileModalUserId(veh.ownerId)}
                          className="py-2 px-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <UserCheck size={12} className="text-emerald-700" />
                          <span>Host Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200/90 p-12 text-center max-w-md mx-auto space-y-3">
              <Car className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No Vehicles Found</h3>
              <p className="text-xs text-gray-500">
                No registered vehicles match the selected filter criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── SHARED REJECTION REASON DIALOG MODAL ── */}
      {rejectingItem && (
        <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600" />
                <span>Reject Verification: {rejectingItem.title}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Provide a clear rejection reason for the student or host. This will be visible on their profile to guide resubmission.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-3">
              {/* Preset Quick Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Document expired",
                  "Photo blurry or obscured",
                  "Name mismatch with college email",
                  "Invalid document type",
                  "RC certificate details mismatch",
                  "Insurance coverage expired",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-gray-100 hover:bg-rose-50 hover:text-rose-800 border border-gray-200 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Specific Rejection Reason / Instructions:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. The student ID card photo is cut off. Please re-upload a full, clear photo showing your expiration date."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Rejection
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── SHARED DOCUMENT FULLSCREEN PREVIEW MODAL ── */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
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
              Authorized Campus Administration Security Audit • Rendered via MinIO Encrypted Storage
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── FULL USER DOSSIER PROFILE MODAL ── */}
      <AdminUserProfileModal
        isOpen={Boolean(profileModalUserId)}
        onClose={() => setProfileModalUserId(null)}
        userId={profileModalUserId}
        onUserUpdated={reloadData}
      />
    </div>
  );
}

export default function AdminVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs text-gray-500 font-sans">
          Loading Verification Center...
        </div>
      }
    >
      <VerificationPageContent />
    </Suspense>
  );
}

