"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Filter,
  ArrowLeft,
  Sparkles,
  Lock,
  Camera,
  Eye,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Calendar,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  History,
  BadgeCheck,
} from "lucide-react";
import {
  dataStore,
  StoredBooking,
  StoredVehicle,
  STANDARD_HOURLY_RATE,
} from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";
import { InPlatformCallModal } from "@/components/InPlatformCallModal";

type ActiveRidesTab = "active" | "confirmed" | "history" | "all";

function ActiveRidesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const ownerId = user && user.role === "owner" ? user.id : "usr-owner-marcus";

  // Tab state
  const paramTab = searchParams.get("tab") as ActiveRidesTab | null;
  const [activeTab, setActiveTab] = useState<ActiveRidesTab>(
    paramTab && ["active", "confirmed", "history", "all"].includes(paramTab)
      ? paramTab
      : "active"
  );

  // Sync tab with URL
  useEffect(() => {
    const t = searchParams.get("tab") as ActiveRidesTab | null;
    if (t && ["active", "confirmed", "history", "all"].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Owner's single registered vehicle & bookings
  const [vehicle, setVehicle] = useState<StoredVehicle | null>(null);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);
  const [detailsModalBooking, setDetailsModalBooking] = useState<StoredBooking | null>(null);
  const [inspectReturnBooking, setInspectReturnBooking] = useState<StoredBooking | null>(null);
  const [reportModalBooking, setReportModalBooking] = useState<StoredBooking | null>(null);
  const [reportReason, setReportReason] = useState("Vehicle Damage Observed");
  const [reportNotes, setReportNotes] = useState("");

  const reload = () => {
    const single = dataStore.getOwnerVehicle(ownerId) || null;
    setVehicle(single);
    const all = dataStore.getOwnerBookings(ownerId);
    setBookings(all);
    setIsLoading(false);
  };

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  // Bookings specifically for the owner's single vehicle
  const vehicleBookings = useMemo(() => {
    if (!vehicle) return bookings.filter((b) => b.ownerId === ownerId);
    return bookings.filter((b) => b.vehicleId === vehicle.id || b.ownerId === ownerId);
  }, [vehicle, bookings, ownerId]);

  // 1. Current Active Rental: Exactly ONE active session (active, overdue, or return submitted awaiting inspection)
  const activeRide = useMemo(() => {
    return (
      vehicleBookings.find(
        (b) => b.status === "active" || b.status === "returned" || b.status === "overdue"
      ) || null
    );
  }, [vehicleBookings]);

  // 2. Confirmed & Upcoming Future Bookings (Approved by host, awaiting start)
  const upcomingBookings = useMemo(() => {
    return vehicleBookings.filter((b) => b.status === "confirmed");
  }, [vehicleBookings]);

  // 3. Completed Historical Rentals
  const completedBookings = useMemo(() => {
    return vehicleBookings.filter((b) => b.status === "completed");
  }, [vehicleBookings]);

  // Total completed earnings
  const totalCompletedEarnings = useMemo(() => {
    return completedBookings.reduce(
      (sum, b) => sum + (b.totalCost || b.durationHours * STANDARD_HOURLY_RATE),
      0
    );
  }, [completedBookings]);

  // Switch tab with URL update
  const switchTab = (tab: ActiveRidesTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.set("tab", tab);
    router.replace(`/owner/active-rides?${params.toString()}`);
  };

  // Handle Return Verification & Completion (moves from active to completed history)
  const handleApproveReturnHandover = (b: StoredBooking) => {
    dataStore.updateBookingStatus(b.id, "completed");
    toast.success(
      `Return inspection confirmed for ${b.vehicleName}! Payment released. Ride moved to Completed History.`
    );
    setInspectReturnBooking(null);
    reload();
  };

  // Handle Starting a Confirmed Ride
  const handleStartConfirmedRide = (b: StoredBooking) => {
    const res = dataStore.startRide(b.id);
    if (res.success) {
      toast.success(`Ride started for ${b.renterName}! Digital unlock code activated.`);
      reload();
    } else {
      toast.error(res.error || "Failed to start ride.");
    }
  };

  // Submit Incident Report
  const handleReportIssueToAdmin = () => {
    if (!reportModalBooking) return;
    if (!reportNotes.trim()) {
      toast.error("Please describe the issue or damage.");
      return;
    }

    const reportCategory =
      reportReason.includes("Damage")
        ? "Vehicle Damage"
        : reportReason.includes("Wrong")
        ? "Late Return"
        : "Safety Concern";

    dataStore.createReport({
      reporterId: ownerId,
      reporterName: user?.name || "Marcus Vance",
      reporterRole: "owner",
      targetType: "booking",
      targetId: reportModalBooking.id,
      category: reportCategory,
      description: `[${reportReason}] ${reportNotes.trim()} · Vehicle: ${reportModalBooking.vehicleName} (${reportModalBooking.campusHub})`,
    });

    toast.success("Incident report filed with Wheelzy safety administration.");
    setReportModalBooking(null);
    setReportNotes("");
    reload();
  };

  // Inspect Student ID KYC (Zero Aadhaar)
  const handleInspectStudentId = (b: StoredBooking) => {
    const renterUser = dataStore.getUserById(b.renterId);
    setInspectParticipant({
      name: b.renterName,
      avatar: b.renterAvatar,
      campus: b.renterCampus,
      role: "renter",
      studentIdNumber: b.renterStudentIdNumber || renterUser?.studentIdNumber || "SID-UCB-2024-99214",
      studentIdUrl: b.renterStudentIdUrl || renterUser?.studentIdCardUrl || "/student_id_proof.svg",
      studentVerified: b.renterStudentVerified ?? renterUser?.studentVerified ?? true,
      bookingId: b.id,
      vehicleName: b.vehicleName,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* ── Top Page Header ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
              Fleet Operations & Trip Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Active Rides & Trip History
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">
            Monitor live student trips, review confirmed reservations, and inspect completed return history.
          </p>
        </div>

        {/* Quick Header Summary Stats */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Live</span>
            <span className="text-sm font-black text-gray-900 font-mono">
              {activeRide ? "1 Active" : "0"}
            </span>
          </div>

          <div className="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upcoming</span>
            <span className="text-sm font-black text-gray-900 font-mono">
              {upcomingBookings.length}
            </span>
          </div>

          <div className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
            <span className="text-sm font-black text-emerald-900 font-mono">
              {completedBookings.length}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-[#0A1F1A] text-white border border-emerald-950 text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Earned</span>
            <span className="text-sm font-black font-mono text-emerald-300">
              ₹{totalCompletedEarnings}
            </span>
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation Tabs ── */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/90 backdrop-blur-sm rounded-2xl border border-gray-200/80 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => switchTab("active")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "active"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
          }`}
        >
          <Zap size={14} className={activeTab === "active" ? "text-emerald-300 fill-emerald-300/40" : ""} />
          <span>Live Active Rental</span>
          {activeRide && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => switchTab("confirmed")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "confirmed"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
          }`}
        >
          <Calendar size={14} />
          <span>Upcoming & Confirmed</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === "confirmed"
                ? "bg-emerald-500/30 text-emerald-200"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {upcomingBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "history"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
          }`}
        >
          <History size={14} />
          <span>Completed History</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeTab === "history"
                ? "bg-emerald-500/30 text-emerald-200"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {completedBookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "all"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
          }`}
        >
          <Activity size={14} />
          <span>All Records ({vehicleBookings.length})</span>
        </button>
      </div>

      {/* ── Zero Aadhaar Privacy Assurance ── */}
      <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900">
        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
        <span>
          <strong>Zero Aadhaar Exposure:</strong> In compliance with Wheelzy Student Privacy Standards, student Aadhaar credentials are kept strictly encrypted and concealed from peer hosts.
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB / SECTION 1: LIVE ACTIVE RIDE (ONE VEHICLE CARD)
         ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "active" || activeTab === "all") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-600 fill-emerald-600/30" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">
                Current Active Rental
              </h2>
            </div>
            {activeRide && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Single Vehicle Session
              </span>
            )}
          </div>

          {activeRide && vehicle ? (
            /* EXACTLY ONE VEHICLE CARD FOR THE ACTIVE RENTAL */
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden transition-all">
              {/* Top Bar with Live Trip Status and Booking ID */}
              <div className="px-6 py-3.5 bg-[#0A1F1A] text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {activeRide.status === "returned" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/25 text-amber-200 border border-amber-400/40 uppercase tracking-wider">
                      <CheckCircle2 size={12} className="text-amber-300" />
                      <span>RETURN PHOTO SUBMITTED · AWAITING INSPECTION</span>
                    </span>
                  ) : activeRide.status === "overdue" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/25 text-rose-200 border border-rose-400/40 uppercase tracking-wider animate-pulse">
                      <AlertTriangle size={12} className="text-rose-300" />
                      <span>OVERDUE TRIP</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE ON-CAMPUS TRIP</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-emerald-300 font-bold">
                    Booking #{activeRide.id}
                  </span>
                  {activeRide.digitalUnlockCode && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-900 text-emerald-200 font-mono text-[11px] font-bold border border-emerald-700">
                      Unlock: {activeRide.digitalUnlockCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-6">
                {/* Row 1: Vehicle & Renter Split */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-gray-100 pb-6">
                  {/* Vehicle Showcase (5 Cols) */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <img
                      src={vehicle.imageUrl || activeRide.vehicleImage || "/scooter_xiaomi.jpg"}
                      alt={vehicle.name}
                      className="w-24 h-20 rounded-2xl object-cover shadow-2xs shrink-0 ring-1 ring-gray-200"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 uppercase tracking-wider">
                        {vehicle.vehicleType}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1 truncate">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{vehicle.model}</p>
                      <p className="text-[11px] font-mono font-bold text-gray-600 mt-1">
                        RC: {vehicle.documents?.rcNumber || "CA-EBIKE-88192"}
                      </p>
                    </div>
                  </div>

                  {/* Renter Showcase (7 Cols) */}
                  <div className="md:col-span-7 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeRide.renterAvatar || "/default_avatar.jpg"}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {activeRide.renterName}
                          </h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ✓ Student
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{activeRide.renterCampus}</p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-emerald-600" />
                          Hub: {activeRide.campusHub}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleInspectStudentId(activeRide)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>Student ID</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallModalBooking(activeRide)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Phone size={13} />
                        <span>Call Renter</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Rental Timeline & Cost Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Ride Started
                    </span>
                    <p className="text-xs font-bold text-gray-900">
                      {activeRide.actualStartTime || activeRide.pickupTime}
                    </p>
                    <span className="text-[10px] text-gray-500 block">Hub Checkout Verified</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                      Scheduled Return Deadline
                    </span>
                    <p className="text-xs font-bold text-rose-900">
                      {activeRide.mandatoryReturnDeadline || activeRide.dropoffTime}
                    </p>
                    <span className="text-[10px] text-rose-700 block">Strict Return Window</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Rental Duration
                    </span>
                    <p className="text-xs font-bold text-gray-900">
                      {activeRide.durationHours} Hours Window
                    </p>
                    <span className="text-[10px] text-gray-500 block">Standard Rate ₹{STANDARD_HOURLY_RATE}/hr</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Total Rental Payout
                    </span>
                    <p className="text-base font-black font-mono text-emerald-800">
                      ₹{activeRide.totalCost || activeRide.durationHours * STANDARD_HOURLY_RATE}
                    </p>
                    <span className="text-[10px] text-emerald-700 block">Guaranteed Host Payout</span>
                  </div>
                </div>

                {/* Row 3: Return Photo Submission Highlight (If Renter Submitted) */}
                {activeRide.status === "returned" && (
                  <div className="p-5 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera size={16} className="text-amber-700" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                          Student Return Inspection Evidence
                        </h4>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                        Awaiting Host Verification
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {activeRide.returnPhotoUrl && (
                        <div
                          onClick={() => setInspectReturnBooking(activeRide)}
                          className="sm:col-span-4 h-32 rounded-xl overflow-hidden bg-black border border-amber-300 relative group cursor-pointer"
                        >
                          <img
                            src={activeRide.returnPhotoUrl}
                            alt="Return photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye size={14} /> Click to Inspect
                          </div>
                        </div>
                      )}

                      <div className="sm:col-span-8 text-xs space-y-2">
                        <div className="flex items-center justify-between text-gray-700">
                          <span className="text-gray-500">Submission Timestamp:</span>
                          <strong className="text-gray-900">{activeRide.returnTimestamp || "Today"}</strong>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                          <span className="text-gray-500">Campus Hub GPS Evidence:</span>
                          <strong className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Campus Hub Geofenced
                          </strong>
                        </div>
                        {activeRide.returnNotes && (
                          <p className="text-[11px] text-gray-600 bg-white/80 p-2.5 rounded-xl border border-amber-200/60 italic">
                            &quot;{activeRide.returnNotes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/70">
                      <button
                        type="button"
                        onClick={() => setInspectReturnBooking(activeRide)}
                        className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Inspect Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveReturnHandover(activeRide)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Verify & Complete Return</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsModalBooking(activeRide)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye size={13} />
                      <span>View Booking Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCallModalBooking(activeRide)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Phone size={13} className="text-emerald-600" />
                      <span>Contact Renter</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReportModalBooking(activeRide)}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle size={13} />
                      <span>Report an Issue</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY STATE: NO CURRENTLY ACTIVE RENTAL */
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Zap size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">No Active Rides</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                  Your vehicle currently has no active rental session.
                </p>
              </div>

              {vehicle ? (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1 text-left max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{vehicle.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vehicle.isAvailable
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {vehicle.isAvailable ? "Active / Listed" : "Vehicle is Currently Inactive"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {vehicle.isAvailable
                      ? `Available for students to rent at ${vehicle.locationHub}.`
                      : "Set your availability schedule in My Vehicle to make your vehicle available to renters."}
                  </p>
                </div>
              ) : null}

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => switchTab("history")}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <History size={13} />
                  <span>View Completed History ({completedBookings.length})</span>
                </button>

                <Link
                  href="/owner/my-vehicles"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors"
                >
                  <span>My Vehicle</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB / SECTION 2: CONFIRMED & UPCOMING RESERVATIONS
         ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "confirmed" || activeTab === "all") && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Confirmed & Upcoming Reservations ({upcomingBookings.length})
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              Approved rentals waiting for pickup start
            </span>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-emerald-200/90 shadow-2xs p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      Confirmed Reservation
                    </span>
                    <span className="font-mono text-xs text-gray-400 font-bold">{b.id}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={b.renterAvatar || "/default_avatar.jpg"}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900">{b.renterName}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{b.renterCampus}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <MapPin size={11} />
                        {b.campusHub}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-gray-900 block">
                        ₹{b.totalCost || b.durationHours * STANDARD_HOURLY_RATE}
                      </span>
                      <span className="text-[10px] text-gray-400">{b.durationHours} hrs</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Scheduled Pickup:</span>
                      <strong className="text-gray-800">{b.pickupTime}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Return Deadline:</span>
                      <strong className="text-rose-700">
                        {b.mandatoryReturnDeadline || b.dropoffTime}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleInspectStudentId(b)}
                      className="py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors"
                    >
                      Student ID
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartConfirmedRide(b)}
                      className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Zap size={13} />
                      <span>Start Ride</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
              No confirmed future bookings scheduled right now.
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB / SECTION 3: COMPLETED RENTAL HISTORY
         ══════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "history" || activeTab === "all" || (activeTab === "active" && completedBookings.length > 0)) && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History size={16} className="text-emerald-700" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Completed Rental History ({completedBookings.length})
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              Verified campus handovers and released earnings payouts
            </span>
          </div>

          {completedBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-2xs hover:shadow-md transition-all p-5 space-y-4"
                >
                  {/* Top Bar with Status and ID */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <BadgeCheck size={12} className="text-emerald-600" />
                      <span>Completed & Handover Verified</span>
                    </span>
                    <span className="font-mono text-xs text-gray-400 font-bold">{b.id}</span>
                  </div>

                  {/* Renter & Vehicle Info */}
                  <div className="flex items-start gap-3">
                    <img
                      src={b.renterAvatar || "/default_avatar.jpg"}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900">{b.renterName}</h4>
                      <p className="text-[11px] text-gray-500 truncate">{b.renterCampus}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <MapPin size={11} />
                        {b.campusHub}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-emerald-800 block">
                        ₹{b.totalCost || b.durationHours * STANDARD_HOURLY_RATE}
                      </span>
                      <span className="text-[10px] text-gray-400">{b.durationHours} hrs</span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Trip Started:</span>
                      <strong className="text-gray-800">{b.actualStartTime || b.pickupTime}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Return Completed:</span>
                      <strong className="text-emerald-700">
                        {b.actualReturnTime || b.returnTimestamp || b.dropoffTime}
                      </strong>
                    </div>
                  </div>

                  {/* Return Photo Thumbnail (If Present) */}
                  {b.returnPhotoUrl && (
                    <div
                      onClick={() => setInspectReturnBooking(b)}
                      className="relative rounded-2xl overflow-hidden border border-gray-200 group cursor-pointer h-32 bg-black"
                    >
                      <img
                        src={b.returnPhotoUrl}
                        alt="Return photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye size={14} /> Click to Inspect Return Photo
                      </div>
                    </div>
                  )}

                  {/* Student Return Notes */}
                  {b.returnNotes && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-gray-700 italic">
                      &quot;{b.returnNotes}&quot;
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleInspectStudentId(b)}
                        className="py-1.5 px-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                      >
                        Student ID
                      </button>

                      {b.returnPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setInspectReturnBooking(b)}
                          className="py-1.5 px-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors flex items-center gap-1"
                        >
                          <Camera size={12} className="text-emerald-600" />
                          <span>Photo</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailsModalBooking(b)}
                      className="py-1.5 px-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                    >
                      Trip Summary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center max-w-md mx-auto space-y-2">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900">No Completed Rides Yet</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                When student renters conclude their trips and you verify the vehicle return, past rental records and payout history will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS & DIALOGS
         ══════════════════════════════════════════════════════════════════════ */}

      {/* ── MODAL 1: VIEW BOOKING DETAILS ── */}
      {detailsModalBooking && (
        <Dialog open={!!detailsModalBooking} onOpenChange={() => setDetailsModalBooking(null)}>
          <DialogContent className="max-w-lg rounded-3xl bg-white p-6 sm:p-7 font-sans">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Trip Details · #{detailsModalBooking.id}
                </span>
              </div>
              <DialogTitle className="text-lg font-black text-gray-900 mt-1">
                {detailsModalBooking.vehicleName}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Full trip schedule, campus hub geofence status, and financial payout breakdown.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={detailsModalBooking.renterAvatar || "/default_avatar.jpg"}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{detailsModalBooking.renterName}</h4>
                    <p className="text-[11px] text-gray-500">{detailsModalBooking.renterCampus}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleInspectStudentId(detailsModalBooking)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-bold transition-colors shadow-2xs"
                >
                  Student ID
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Campus Hub</span>
                  <span className="font-bold text-emerald-700">{detailsModalBooking.campusHub}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Trip Status</span>
                  <span className="font-bold uppercase text-emerald-800">
                    {detailsModalBooking.status}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Pickup Time</span>
                  <span className="font-bold text-gray-900">{detailsModalBooking.pickupTime}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Mandatory Return Deadline</span>
                  <span className="font-bold text-rose-700">
                    {detailsModalBooking.mandatoryReturnDeadline || detailsModalBooking.dropoffTime}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#0A1F1A] text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    Duration & Rate
                  </span>
                  <span className="text-xs text-gray-300">
                    {detailsModalBooking.durationHours} Hours · ₹{STANDARD_HOURLY_RATE}/hr
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Payout</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    ₹{detailsModalBooking.totalCost || detailsModalBooking.durationHours * STANDARD_HOURLY_RATE}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setDetailsModalBooking(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 2: RETURN PHOTO INSPECTION ── */}
      {inspectReturnBooking && (
        <Dialog open={!!inspectReturnBooking} onOpenChange={() => setInspectReturnBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Return Inspection: {inspectReturnBooking.vehicleName}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Booking ID: {inspectReturnBooking.id} · {inspectReturnBooking.campusHub}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
                <img
                  src={inspectReturnBooking.returnPhotoUrl || "/card_return.jpg"}
                  alt=""
                  className="w-full max-h-80 object-contain"
                />
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <p>
                  <strong>Renter:</strong> {inspectReturnBooking.renterName} ({inspectReturnBooking.renterCampus})
                </p>
                <p>
                  <strong>Submission Time:</strong> {inspectReturnBooking.returnTimestamp || "Today"}
                </p>
                <p>
                  <strong>Student Note:</strong> {inspectReturnBooking.returnNotes || "Safe parking confirmed."}
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setInspectReturnBooking(null)}
                className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              {inspectReturnBooking.status === "returned" && (
                <button
                  type="button"
                  onClick={() => handleApproveReturnHandover(inspectReturnBooking)}
                  className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Verify & Release Payout</span>
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 3: REPORT AN ISSUE ── */}
      {reportModalBooking && (
        <Dialog open={!!reportModalBooking} onOpenChange={() => setReportModalBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>Report an Issue to Safety Administration</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Booking: #{reportModalBooking.id} · {reportModalBooking.vehicleName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Issue Category</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="Vehicle Damage Observed">Vehicle Damage Observed</option>
                  <option value="Missing Helmet / Lock">Missing Helmet or Lock</option>
                  <option value="Wrong Dropoff Hub Location">Wrong Dropoff Hub Location</option>
                  <option value="Excessively Dirty / Vandalized">Excessively Dirty / Vandalized</option>
                  <option value="Suspicious Handover">Suspicious Handover</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Incident Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the discrepancy, damage notes, or missing items..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportModalBooking(null)}
                className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportIssueToAdmin}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Submit Incident Report
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 4: IN-PLATFORM CALLING ── */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="owner"
      />

      {/* ── MODAL 5: STUDENT ID PREVIEW (ZERO AADHAAR) ── */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}

export default function OwnerActiveRidesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-12 text-center text-xs text-gray-500 font-sans">
          Loading Active Rides & History...
        </div>
      }
    >
      <ActiveRidesContent />
    </Suspense>
  );
}
