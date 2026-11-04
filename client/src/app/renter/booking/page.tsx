"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Download,
  AlertTriangle,
  Eye,
  ArrowRight,
  Phone,
  Camera,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
} from "lucide-react";
import { dataStore, StoredBooking, VehicleReview, STANDARD_HOURLY_RATE } from "@/lib/dataStore";
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
import { InPlatformCallModal } from "@/components/InPlatformCallModal";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";

export type BookingTab = "all" | "pending" | "active" | "completed" | "cancelled_rejected";

function formatBookingDate(dateStr?: string, fallback?: string): string {
  if (!dateStr) return fallback || "28 Oct 2026";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  } catch {}
  return dateStr.split("T")[0] || fallback || "28 Oct 2026";
}

function StarRatingInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="cursor-pointer transition-transform hover:scale-110 p-0.5"
            aria-label={`Rate ${star} star`}
          >
            <Star
              size={18}
              className={`transition-colors ${
                star <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-bold text-gray-700 w-8 text-right">
          {(hovered || value) > 0 ? `${hovered || value}/5` : "—"}
        </span>
      </div>
    </div>
  );
}

function renderStatusBadge(status: StoredBooking["status"]) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active In-Trip</span>
        </span>
      );
    case "overdue":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
          <AlertTriangle size={11} className="text-rose-600" />
          <span>Overdue Return</span>
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={11} className="text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    case "returned":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
          <CheckCircle2 size={11} className="text-teal-600" />
          <span>Returned &amp; Verified</span>
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={11} className="text-emerald-600" />
          <span>Approved by Host</span>
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={11} className="text-emerald-600" />
          <span>Confirmed</span>
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 tracking-wide uppercase">
          <Clock size={11} className="text-amber-600 animate-pulse shrink-0" />
          <span>PENDING – AWAITING OWNER APPROVAL</span>
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          <XCircle size={11} className="text-slate-500" />
          <span>Cancelled</span>
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle size={11} className="text-rose-600" />
          <span>Rejected by Host</span>
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
          {status}
        </span>
      );
  }
}

function RenterBookingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  let initialTab: BookingTab = "all";
  if (tabParam === "pending" || tabParam === "requests") initialTab = "pending";
  else if (tabParam === "active") initialTab = "active";
  else if (tabParam === "completed" || tabParam === "history") initialTab = "completed";
  else if (tabParam === "cancelled" || tabParam === "cancelled_rejected" || tabParam === "rejected")
    initialTab = "cancelled_rejected";
  else if (tabParam === "all") initialTab = "all";

  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";

  const [activeTab, setActiveTab] = useState<BookingTab>(initialTab);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  // Modals state
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);
  const [selectedDetailsBooking, setSelectedDetailsBooking] = useState<StoredBooking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<StoredBooking | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<StoredBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("Schedule change / Class rescheduled");
  const [isCancelling, setIsCancelling] = useState(false);

  // Return modal state
  const [returnRideBooking, setReturnRideBooking] = useState<StoredBooking | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Review Form State
  const [overallRating, setOverallRating] = useState(5);
  const [conditionRating, setConditionRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [statusSubFilter, setStatusSubFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const reloadData = useCallback(() => {
    setBookings(dataStore.getRenterBookings(renterId));
  }, [renterId]);

  useEffect(() => {
    reloadData();
    window.addEventListener("wheelzy-store-update", reloadData);
    return () => window.removeEventListener("wheelzy-store-update", reloadData);
  }, [reloadData]);

  // Tab categorization
  const allBookings = useMemo(() => bookings, [bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "pending");
  }, [bookings]);

  const activeBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.status === "active" ||
        b.status === "overdue" ||
        b.status === "approved" ||
        b.status === "confirmed"
    );
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "completed" || b.status === "returned");
  }, [bookings]);

  const cancelledRejectedBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "cancelled" || b.status === "rejected");
  }, [bookings]);

  // Tab change handler with URL sync
  const handleTabChange = (tab: BookingTab) => {
    setActiveTab(tab);
    setSearchText("");
    setStatusSubFilter("all");
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Base list for active tab
  const currentTabBookings = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pendingBookings;
      case "active":
        return activeBookings;
      case "completed":
        return completedBookings;
      case "cancelled_rejected":
        return cancelledRejectedBookings;
      case "all":
      default:
        return allBookings;
    }
  }, [activeTab, allBookings, pendingBookings, activeBookings, completedBookings, cancelledRejectedBookings]);

  // Filtered and Sorted Bookings
  const filteredBookings = useMemo(() => {
    return currentTabBookings
      .filter((b) => {
        // Status sub-filter
        if (statusSubFilter !== "all") {
          if (statusSubFilter === "active" && b.status !== "active") return false;
          if (statusSubFilter === "overdue" && b.status !== "overdue") return false;
          if (statusSubFilter === "completed" && b.status !== "completed") return false;
          if (statusSubFilter === "returned" && b.status !== "returned") return false;
          if (statusSubFilter === "pending" && b.status !== "pending") return false;
          if (statusSubFilter === "approved" && b.status !== "approved" && b.status !== "confirmed")
            return false;
          if (statusSubFilter === "cancelled" && b.status !== "cancelled") return false;
          if (statusSubFilter === "rejected" && b.status !== "rejected") return false;
        }

        // Search text
        if (searchText.trim()) {
          const q = searchText.toLowerCase();
          const matchName = b.vehicleName.toLowerCase().includes(q);
          const matchModel = b.vehicleModel.toLowerCase().includes(q);
          const matchId = b.id.toLowerCase().includes(q);
          const matchOwner = b.ownerName.toLowerCase().includes(q);
          if (!matchName && !matchModel && !matchId && !matchOwner) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.pickupTime).getTime() || 0;
        const timeB = new Date(b.createdAt || b.pickupTime).getTime() || 0;
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [currentTabBookings, statusSubFilter, searchText, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Actions
  const handleOpenReviewModal = (booking: StoredBooking) => {
    setReviewBooking(booking);
    setOverallRating(5);
    setConditionRating(5);
    setCleanlinessRating(5);
    setReviewText("");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setIsSubmittingReview(true);
    dataStore.submitReview({
      bookingId: reviewBooking.id,
      vehicleId: reviewBooking.vehicleId,
      renterId,
      renterName: user?.name || "Student Renter",
      renterAvatar: user?.avatar || "/avatar.jpg",
      rating: overallRating,
      vehicleExperience: `${overallRating}/5 Stars`,
      vehicleCondition: `${conditionRating}/5 Stars`,
      cleanliness: `${cleanlinessRating}/5 Stars`,
      comment:
        reviewText.trim() ||
        "Excellent ride! Vehicle was in great condition and host was very responsive.",
    });

    toast.success(`Review for ${reviewBooking.vehicleName} submitted! Thank you.`);
    setIsSubmittingReview(false);
    setReviewBooking(null);
    reloadData();
  };

  const handleDownloadReceipt = (booking: StoredBooking) => {
    toast.success(`Official Wheelzy digital receipt for ${booking.id} generated and downloaded.`);
  };

  const handleCancelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalBooking) return;

    setIsCancelling(true);
    dataStore.cancelBooking(
      cancelModalBooking.id,
      cancelReason.trim() || "Cancelled by student renter before start."
    );

    toast.success(
      `Booking ${cancelModalBooking.id} cancelled. 100% full refund processed to student wallet.`
    );
    setIsCancelling(false);
    setCancelModalBooking(null);
    setCancelReason("Schedule change / Class rescheduled");
    reloadData();
  };

  const handleSubmitReturnPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnRideBooking) return;

    setIsSubmittingReturn(true);
    setTimeout(() => {
      dataStore.submitReturnPhoto(
        returnRideBooking.id,
        "/card_return.jpg",
        returnNotes.trim() || "Locked securely at designated campus quad rack. Key placed in safety box."
      );
      toast.success("Return inspection photo confirmed! Ride marked as RETURNED.");
      setIsSubmittingReturn(false);
      setReturnRideBooking(null);
      setReturnNotes("");
      reloadData();
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              Renter Ride Central
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            View and manage all your campus ride reservations, active trips, and completed history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/renter/browse"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Find a Ride</span>
          </Link>
          <Link
            href="/renter/return"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Return Hub</span>
          </Link>
        </div>
      </div>

      {/* ── 5 Tab Navigation Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-1.5 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {/* Tab 1: All Bookings */}
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#064E3B] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <BookOpen size={15} />
            <span>All Bookings</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {allBookings.length}
            </span>
          </button>

          {/* Tab 2: Pending (With Count Badge) */}
          <button
            type="button"
            onClick={() => handleTabChange("pending")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#064E3B] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <Clock size={15} className={pendingBookings.length > 0 ? "text-amber-500 animate-pulse" : ""} />
            <span>Pending</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
                activeTab === "pending"
                  ? "bg-white/20 text-white"
                  : pendingBookings.length > 0
                  ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {pendingBookings.length}
            </span>
          </button>

          {/* Tab 3: Active */}
          <button
            type="button"
            onClick={() => handleTabChange("active")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "active"
                ? "bg-[#064E3B] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <Zap size={15} className={activeBookings.length > 0 ? "animate-pulse" : ""} />
            <span>Active</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === "active" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {activeBookings.length}
            </span>
          </button>

          {/* Tab 4: Completed */}
          <button
            type="button"
            onClick={() => handleTabChange("completed")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "completed"
                ? "bg-[#064E3B] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>Completed</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === "completed" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {completedBookings.length}
            </span>
          </button>

          {/* Tab 5: Cancelled / Rejected */}
          <button
            type="button"
            onClick={() => handleTabChange("cancelled_rejected")}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === "cancelled_rejected"
                ? "bg-[#064E3B] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
            }`}
          >
            <XCircle size={15} />
            <span>Cancelled / Rejected</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === "cancelled_rejected"
                  ? "bg-white/20 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {cancelledRejectedBookings.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Search, Filter & Sort Controls ── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle name, model, booking ID (BK-...), or host name"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status Sub-Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shrink-0">
            <Filter size={13} className="text-emerald-700 shrink-0" />
            <label htmlFor="booking-status-filter" className="text-xs font-semibold text-gray-700 shrink-0">
              Filter:
            </label>
            <select
              id="booking-status-filter"
              aria-label="Filter bookings by status"
              value={statusSubFilter}
              onChange={(e) => {
                setStatusSubFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-emerald-900 outline-none cursor-pointer pr-1"
            >
              <option value="all">All Statuses</option>
              {activeTab === "all" && (
                <>
                  <option value="active">Active Trips</option>
                  <option value="completed">Completed</option>
                  <option value="returned">Returned &amp; Verified</option>
                  <option value="pending">Pending Host Approval</option>
                  <option value="approved">Approved by Host</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected by Host</option>
                </>
              )}
              {activeTab === "pending" && (
                <>
                  <option value="pending">Awaiting Host Approval</option>
                </>
              )}
              {activeTab === "active" && (
                <>
                  <option value="active">Active (On Schedule)</option>
                  <option value="overdue">Overdue Return</option>
                </>
              )}
              {activeTab === "completed" && (
                <>
                  <option value="completed">Completed</option>
                  <option value="returned">Returned &amp; Inspected</option>
                </>
              )}
              {activeTab === "cancelled_rejected" && (
                <>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected by Host</option>
                </>
              )}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 shrink-0">
            <ArrowUpDown size={13} className="text-emerald-700 shrink-0" />
            <label htmlFor="booking-sort-order" className="text-xs font-semibold text-gray-700 shrink-0">
              Sort:
            </label>
            <select
              id="booking-sort-order"
              aria-label="Sort booking records"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-emerald-900 outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Clear filters badge */}
        {(searchText !== "" || statusSubFilter !== "all" || sortOrder !== "newest") && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Showing {filteredBookings.length} of {currentTabBookings.length} bookings in this view
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                setStatusSubFilter("all");
                setSortOrder("newest");
                setCurrentPage(1);
              }}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Bookings List ── */}
      {paginatedBookings.length > 0 ? (
        <div className="space-y-4">
          {paginatedBookings.map((b) => {
            const isCompleted = b.status === "completed" || b.status === "returned";
            const isPending = b.status === "pending";
            const isActive =
              b.status === "active" ||
              b.status === "overdue" ||
              b.status === "approved" ||
              b.status === "confirmed";

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Vehicle Image & Info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src={b.vehicleImage || "/scooter_activa.jpg"}
                      alt={b.vehicleName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#0A1F1A]/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                      {b.category}
                    </span>

                    {b.returnPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoPreviewUrl(b.returnPhotoUrl || null)}
                        className="absolute bottom-1.5 right-1.5 bg-black/75 hover:bg-black text-white p-1 rounded-md text-[9px] flex items-center gap-0.5 cursor-pointer shadow-xs"
                        title="Inspect verified return photo"
                      >
                        <Camera size={10} className="text-emerald-400" />
                        <span>Photo</span>
                      </button>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-500">{b.id}</span>
                      {/* Booking Status Badge */}
                      {renderStatusBadge(b.status)}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                      {b.vehicleName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{b.vehicleModel}</p>

                    <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-600 flex-wrap">
                      <div className="flex items-center gap-1.5 truncate">
                        <img
                          src={b.ownerAvatar}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-[11px] truncate">Host: {b.ownerName}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin size={11} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{b.campusHub}</span>
                      </div>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Calendar size={11} className="text-gray-400 shrink-0" />
                        <span>Booked: {formatBookingDate(b.createdAt, b.pickupTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Timing, Duration & Total Cost */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-2.5 sm:gap-3 text-xs bg-gray-50/80 p-3 rounded-xl border border-gray-100 shrink-0">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Trip Start</p>
                    <p className="font-bold text-gray-900 mt-0.5 truncate">
                      {b.actualStartTime || b.pickupTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase text-gray-500">
                      {isCompleted ? "Returned At" : "Scheduled Return"}
                    </p>
                    <p
                      className={`font-bold mt-0.5 truncate ${
                        isCompleted ? "text-gray-900" : "text-rose-700"
                      }`}
                    >
                      {isCompleted
                        ? b.actualReturnTime || b.returnTimestamp || b.dropoffTime
                        : b.mandatoryReturnDeadline || b.dropoffTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Duration</p>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {b.durationHours || 3} Hours
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Total Cost</p>
                    <p className="font-black text-emerald-950 mt-0.5">₹{b.totalCost}</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailsBooking(b)}
                    className="flex-1 lg:flex-initial py-2 px-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 bg-white text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>

                  {/* Contextual actions */}
                  {isCompleted && (
                    <>
                      {b.hasReview ? (
                        <span className="flex-1 lg:flex-initial py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>Reviewed</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(b)}
                          className="flex-1 lg:flex-initial py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Star size={13} className="fill-white" />
                          <span>Rate &amp; Review</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(b)}
                        className="hidden sm:flex py-1.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] font-semibold transition-colors items-center justify-center gap-1 cursor-pointer"
                      >
                        <Download size={11} />
                        <span>Receipt</span>
                      </button>
                    </>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => setCancelModalBooking(b)}
                      className="flex-1 lg:flex-initial py-2 px-3.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <XCircle size={13} />
                      <span>Cancel Request</span>
                    </button>
                  )}

                  {isActive && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCallModalBooking(b)}
                        className="flex-1 lg:flex-initial py-1.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone size={12} />
                        <span>Call Host</span>
                      </button>
                      <Link
                        href={`/renter/return?bookingId=${b.id}`}
                        className="flex-1 lg:flex-initial py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RotateCcw size={12} />
                        <span>Return Vehicle</span>
                      </Link>
                    </>
                  )}

                  {b.status === "cancelled" || b.status === "rejected" ? (
                    <span className="text-[11px] font-semibold text-gray-400 italic py-1 text-center lg:text-left">
                      Session closed
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 px-2 text-xs">
              <span className="text-gray-500 font-medium">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-bold text-gray-800 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-2xs">
          {activeTab === "pending" ? (
            <>
              <Clock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Pending Requests</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                You do not have any booking requests awaiting owner approval right now. Browse available campus rides to request your next trip.
              </p>
              <Link
                href="/renter/browse"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>Find a Ride Now</span>
                <ArrowRight size={13} />
              </Link>
            </>
          ) : activeTab === "active" ? (
            <>
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Active Trips</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                You do not have any vehicle checked out at the moment. Browse available campus rides to start a new trip.
              </p>
              <Link
                href="/renter/browse"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>Find a Ride Now</span>
                <ArrowRight size={13} />
              </Link>
            </>
          ) : activeTab === "completed" ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Completed Rentals</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                You haven&apos;t completed any campus rides yet. When you return a vehicle, your verified return receipt will be stored here.
              </p>
              <Link
                href="/renter/browse"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>Browse Campus Rides</span>
                <ArrowRight size={13} />
              </Link>
            </>
          ) : activeTab === "cancelled_rejected" ? (
            <>
              <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Cancelled or Rejected Bookings</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                All of your bookings are in good standing! Any bookings cancelled by you or declined by hosts will be logged here.
              </p>
              <Link
                href="/renter/browse"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>Explore Campus Rides</span>
                <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <>
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Bookings Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No ride reservations match your search or filter criteria. Try resetting the filters or book a ride.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                {(searchText !== "" || statusSubFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      setStatusSubFilter("all");
                      setSortOrder("newest");
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
                <Link
                  href="/renter/browse"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Find a Ride Now</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. VIEW BOOKING DETAILS MODAL                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedDetailsBooking && (
        <Dialog open={!!selectedDetailsBooking} onOpenChange={() => setSelectedDetailsBooking(null)}>
          <DialogContent className="max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {selectedDetailsBooking.id}
                </span>
                {renderStatusBadge(selectedDetailsBooking.status)}
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900 pt-1">
                {selectedDetailsBooking.vehicleName}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {selectedDetailsBooking.vehicleModel} · {selectedDetailsBooking.category}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Vehicle Photo */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={selectedDetailsBooking.vehicleImage || "/scooter_activa.jpg"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Host & Hub */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedDetailsBooking.ownerAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-900">{selectedDetailsBooking.ownerName}</p>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        Verified Host
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{selectedDetailsBooking.campusHub}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const hostUser = dataStore.getUserById(selectedDetailsBooking.ownerId);
                    setInspectParticipant({
                      name: selectedDetailsBooking.ownerName,
                      avatar: selectedDetailsBooking.ownerAvatar,
                      campus: selectedDetailsBooking.campusHub,
                      role: "owner",
                      studentIdNumber: hostUser?.studentIdNumber || "SID-HOST-9912",
                      studentIdUrl: hostUser?.studentIdCardUrl || "/student_id_proof.svg",
                      studentVerified: true,
                      vehicleName: selectedDetailsBooking.vehicleName,
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap size={13} className="text-emerald-600" />
                  <span>Host ID</span>
                </button>
              </div>

              {/* Rental Window Breakdown */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Trip Start</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedDetailsBooking.actualStartTime || selectedDetailsBooking.pickupTime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-rose-700">Must Return By</p>
                  <p className="font-bold text-rose-800 mt-0.5">
                    {selectedDetailsBooking.actualReturnTime ||
                      selectedDetailsBooking.mandatoryReturnDeadline ||
                      selectedDetailsBooking.dropoffTime}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500">Rental Duration</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {selectedDetailsBooking.durationHours} Hours (Owner-Defined)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500">Total Rental Cost</p>
                  <p className="text-base font-black text-emerald-950 mt-0.5">
                    ₹{selectedDetailsBooking.totalCost}
                  </p>
                </div>
              </div>

              {/* Unlock Code if active */}
              {selectedDetailsBooking.digitalUnlockCode && (
                <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-gray-600">Digital Smart Lock Code:</span>
                  <span className="font-mono text-sm font-black text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {selectedDetailsBooking.digitalUnlockCode}
                  </span>
                </div>
              )}

              {/* Cancellation Reason if cancelled */}
              {selectedDetailsBooking.cancellationReason && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Cancellation Note</p>
                  <p className="font-medium text-[11px]">{selectedDetailsBooking.cancellationReason}</p>
                </div>
              )}

              {/* Return Notes if returned */}
              {selectedDetailsBooking.returnNotes && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Return Hub Notes</p>
                  <p className="font-medium text-gray-800 text-[11px]">{selectedDetailsBooking.returnNotes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedDetailsBooking(null)}
                className="py-2.5 px-5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. RATE & REVIEW MODAL                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {reviewBooking && (
        <Dialog open={!!reviewBooking} onOpenChange={() => setReviewBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Rate &amp; Review Your Ride
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {reviewBooking.vehicleName} · Host: {reviewBooking.ownerName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 my-2">
              <StarRatingInput
                label="Overall Experience"
                value={overallRating}
                onChange={setOverallRating}
              />
              <StarRatingInput
                label="Vehicle Condition"
                value={conditionRating}
                onChange={setConditionRating}
              />
              <StarRatingInput
                label="Cleanliness &amp; Gear"
                value={cleanlinessRating}
                onChange={setCleanlinessRating}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Written Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about the brakes, battery life, host communication, and pickup ease..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="py-2 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmittingReview ? "Submitting..." : "Submit Review"}</span>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. RETURN PHOTO PREVIEW MODAL                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {photoPreviewUrl && (
        <Dialog open={!!photoPreviewUrl} onOpenChange={() => setPhotoPreviewUrl(null)}>
          <DialogContent className="max-w-lg rounded-3xl bg-white p-5 shadow-2xl border border-gray-200 font-sans">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-gray-900">
                Verified Return Inspection Photo
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Campus quad safe dropoff verification record
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl overflow-hidden border border-gray-200 my-2 aspect-[4/3] bg-gray-100">
              <img src={photoPreviewUrl} alt="Return photo" className="w-full h-full object-cover" />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setPhotoPreviewUrl(null)}
                className="py-2 px-5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. CANCEL BOOKING MODAL                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {cancelModalBooking && (
        <Dialog open={!!cancelModalBooking} onOpenChange={() => setCancelModalBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Cancel Booking Reservation?
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Cancel reservation for {cancelModalBooking.vehicleName} ({cancelModalBooking.id}).
                100% full refund of ₹{cancelModalBooking.totalCost} will be returned to your student wallet.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCancelBooking} className="space-y-3.5 my-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="Schedule change / Class rescheduled">Schedule change / Class rescheduled</option>
                  <option value="Booked incorrect campus hub">Booked incorrect campus hub</option>
                  <option value="Bad weather / Rain on campus">Bad weather / Rain on campus</option>
                  <option value="Other student trip changes">Other student trip changes</option>
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Wheelzy Student Guarantee</p>
                <p className="text-[11px] text-emerald-800">
                  Pre-trip cancellations are never penalized. Your slot will be released back to the campus fleet.
                </p>
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{isCancelling ? "Processing..." : "Confirm Cancellation"}</span>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. ACTIVE RETURN PHOTO SUBMISSION MODAL                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {returnRideBooking && (
        <Dialog open={!!returnRideBooking} onOpenChange={() => setReturnRideBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                End Ride &amp; Submit Inspection Photo
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Safely park and lock {returnRideBooking.vehicleName} at {returnRideBooking.campusHub}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitReturnPhoto} className="space-y-3.5 my-2">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-emerald-200 bg-gray-50">
                <img src="/card_return.jpg" alt="Return photo preview" className="w-full h-full object-cover" />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                <p>
                  <strong>Designated Hub:</strong> {returnRideBooking.campusHub}
                </p>
                <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                  MinIO Secure Storage: minio://wheelzy-media/returns/ret_{returnRideBooking.id.toLowerCase()}.webp
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hub Parking Notes
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Locked securely at Bay 3 quad rack. Key left in campus secure dropbox."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnRideBooking(null)}
                  className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="py-2 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmittingReturn ? "Submitting..." : "Complete Return"}</span>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* In-Platform Call Modal */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="renter"
      />

      {/* Host Student ID Preview Modal */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}

export default function RenterBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RenterBookingsContent />
    </Suspense>
  );
}
