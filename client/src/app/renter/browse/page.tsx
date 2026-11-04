"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CalendarDays,
  Bike,
  Clock,
  GraduationCap,
  Sparkles,
  Check,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Calendar,
  AlertCircle,
  X,
} from "lucide-react";
import {
  dataStore,
  StoredVehicle,
  STANDARD_HOURLY_RATE,
  calculateRentalAmount,
  getVehicleDurationHours,
} from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";
import { getPendingSearch, clearPendingSearch } from "@/lib/searchState";

function getVehicleDescription(v: StoredVehicle): string {
  if (v.vehicleType === "Electric Scooter") {
    return "Campus-ready electric scooter with responsive front/rear disc brakes, high-efficiency battery, and bright LED headlamp. Ideal for quick, quiet transit across campus hubs, library runs, and classroom commutes.";
  }
  if (v.vehicleType === "Hybrid Bicycle") {
    return "Lightweight commuter bicycle featuring precision Shimano gearing, puncture-resistant road tires, and ergonomic saddle. Well-maintained by student host and equipped with secure cable U-lock.";
  }
  if (v.vehicleType === "Motor Scooter") {
    return "Fuel-efficient student scooter with spacious underseat helmet storage, electric push start, and smooth automatic transmission. Fully registered and permitted for designated campus parking bays.";
  }
  return "Reliable student-owned two-wheeler inspected for mechanical safety, smooth braking, and university campus compliance. Includes verified vehicle registration and essential safety equipment.";
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/** Parse a display time string like "9:00 AM", "17:00", etc. into minutes since midnight. */
function parseTimeToMinutes(t: string): number {
  if (!t) return -1;
  const match = t.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = (match[3] || "").toUpperCase();
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** Convert date + time to ms timestamp */
function toMs(date: string, time: string): number {
  const mins = parseTimeToMinutes(time);
  if (!date || mins < 0) return 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`).getTime();
}

/** Convert time to 24h format (HH:mm) for HTML time inputs */
function to24h(t: string): string {
  if (!t) return "09:00";
  const match = t.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return t.length === 5 ? t : "09:00";
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = (match[3] || "").toUpperCase();
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

/** Convert 24h format (HH:mm) to 12h display string ("9:00 AM") */
function to12h(t: string): string {
  if (!t) return "9:00 AM";
  const [hStr, mStr] = t.split(":");
  if (!hStr) return t;
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

interface SearchScheduleCriteria {
  vehicleType: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
}

/** Inner component that uses useSearchParams (wrapped in Suspense) */
function RenterBrowseContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const today = todayStr();

  // ── URL param reading ──────────────────────────────────────
  const urlVehicleType = searchParams.get("vehicleType") || "All";
  const urlPickupDate = searchParams.get("pickupDate") || "";
  const urlPickupTime = searchParams.get("pickupTime") || "";
  const urlDropoffDate = searchParams.get("dropoffDate") || "";
  const urlDropoffTime = searchParams.get("dropoffTime") || "";
  const urlVehicleId = searchParams.get("vehicleId") || "";

  // Session storage pending search fallback
  const pendingSearch = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getPendingSearch();
  }, []);

  const effectiveVehicleId = urlVehicleId || pendingSearch?.selectedVehicleId || "";

  // All approved & available vehicles from dataStore
  const [allVehicles, setAllVehicles] = useState(() => dataStore.getApprovedAvailableVehicles());

  useEffect(() => {
    const handleStoreUpdate = () => {
      setAllVehicles(dataStore.getApprovedAvailableVehicles());
    };
    window.addEventListener("wheelzy-store-update", handleStoreUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleStoreUpdate);
  }, []);

  // Compact Search Bar State
  const initialType = urlVehicleType !== "All" ? urlVehicleType : (pendingSearch?.vehicleType || "All");
  const initialPickupDate = urlPickupDate || pendingSearch?.pickupDate || today;
  const initialPickupTime = urlPickupTime || pendingSearch?.pickupTime || "09:00 AM";
  const initialDropoffDate = urlDropoffDate || pendingSearch?.dropoffDate || today;
  const initialDropoffTime = urlDropoffTime || pendingSearch?.dropoffTime || "05:00 PM";

  const [searchVehicleType, setSearchVehicleType] = useState<string>(initialType);
  const [searchPickupDate, setSearchPickupDate] = useState<string>(initialPickupDate);
  const [searchPickupTime, setSearchPickupTime] = useState<string>(to24h(initialPickupTime));
  const [searchDropoffDate, setSearchDropoffDate] = useState<string>(initialDropoffDate);
  const [searchDropoffTime, setSearchDropoffTime] = useState<string>(to24h(initialDropoffTime));
  const [searchError, setSearchError] = useState<string | null>(null);

  // Active submitted search criteria
  const [activeSearch, setActiveSearch] = useState<SearchScheduleCriteria | null>(() => {
    if (urlPickupDate && urlPickupTime && urlDropoffDate && urlDropoffTime) {
      return {
        vehicleType: initialType,
        pickupDate: urlPickupDate,
        pickupTime: to12h(urlPickupTime),
        dropoffDate: urlDropoffDate,
        dropoffTime: to12h(urlDropoffTime),
      };
    }
    if (pendingSearch && pendingSearch.pickupDate && pendingSearch.dropoffDate) {
      return {
        vehicleType: pendingSearch.vehicleType || "All",
        pickupDate: pendingSearch.pickupDate,
        pickupTime: to12h(pendingSearch.pickupTime),
        dropoffDate: pendingSearch.dropoffDate,
        dropoffTime: to12h(pendingSearch.dropoffTime),
      };
    }
    return null;
  });

  // Secondary text & category filters
  const [category, setCategory] = useState<"All" | "Bike" | "Scooter">(() => {
    if (initialType === "Bike") return "Bike";
    if (initialType === "Scooter") return "Scooter";
    return "All";
  });
  const [search, setSearch] = useState("");
  const [durationSort, setDurationSort] = useState<"default" | "shortest" | "longest">("default");
  const [durationFilter, setDurationFilter] = useState<
    "all" | "up_to_1" | "1_to_2" | "2_to_3" | "more_than_3"
  >("all");

  const [selectedVehicle, setSelectedVehicle] = useState<StoredVehicle | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);

  // Auto-open vehicle modal from vehicleId query param
  useEffect(() => {
    if (!effectiveVehicleId) return;
    const v = allVehicles.find((x) => x.id === effectiveVehicleId);
    if (v) {
      setSelectedVehicle(v);
      setActiveImageIndex(0);
    }
    clearPendingSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveVehicleId]);

  // Handle Find a Ride submission
  const handleFindRide = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const pickupMs = new Date(`${searchPickupDate}T${searchPickupTime}`).getTime();
    const dropoffMs = new Date(`${searchDropoffDate}T${searchDropoffTime}`).getTime();

    if (isNaN(pickupMs) || isNaN(dropoffMs)) {
      setSearchError("Please select valid pickup and drop-off dates and times.");
      return;
    }
    if (dropoffMs <= pickupMs) {
      setSearchError("Drop-off time must be after pickup time.");
      return;
    }

    const formattedPickupTime = to12h(searchPickupTime);
    const formattedDropoffTime = to12h(searchDropoffTime);

    setActiveSearch({
      vehicleType: searchVehicleType,
      pickupDate: searchPickupDate,
      pickupTime: formattedPickupTime,
      dropoffDate: searchDropoffDate,
      dropoffTime: formattedDropoffTime,
    });

    if (searchVehicleType === "Bike" || searchVehicleType === "Scooter") {
      setCategory(searchVehicleType);
    } else {
      setCategory("All");
    }

    toast.success("Applied schedule filter. Showing matching available rides.");
  };

  const handleClearSearch = () => {
    setActiveSearch(null);
    setSearchVehicleType("All");
    setCategory("All");
    setSearchPickupDate(today);
    setSearchPickupTime("09:00");
    setSearchDropoffDate(today);
    setSearchDropoffTime("17:00");
    setSearchError(null);
    clearPendingSearch();
    toast.info("Cleared schedule filter. Showing all approved rides.");
  };

  // 1. Filter vehicles based on active search schedule, approval, availability & owner window
  const filtered = useMemo(() => {
    return allVehicles.filter((v) => {
      // Must be approved and currently available
      if (v.status !== "approved") return false;
      if (!v.isAvailable) return false;

      // Category filter (support both category pills and search vehicle type)
      if (category !== "All" && v.category !== category) return false;

      // Search Schedule Filter (if submitted)
      if (activeSearch) {
        if (activeSearch.vehicleType !== "All" && v.category !== activeSearch.vehicleType) {
          return false;
        }

        const reqPickupMs = toMs(activeSearch.pickupDate, activeSearch.pickupTime);
        const reqDropoffMs = toMs(activeSearch.dropoffDate, activeSearch.dropoffTime);

        if (reqPickupMs > 0 && reqDropoffMs > reqPickupMs) {
          // Check owner-defined availability window
          const ownerPickupMs = toMs(v.availableFromDate || "", v.availableFromTime || "");
          const ownerDropoffMs = toMs(v.returnDate || "", v.returnTime || "");

          if (ownerPickupMs > 0 && ownerDropoffMs > ownerPickupMs) {
            // Renter's selected pickup must be at or after owner's start
            // Renter's selected dropoff must NOT exceed owner's mandatory return deadline
            if (reqPickupMs < ownerPickupMs || reqDropoffMs > ownerDropoffMs) {
              return false;
            }
          }

          // Overlap check with existing bookings
          const hasOverlap = dataStore.checkVehicleOverlap(
            v.id,
            activeSearch.pickupTime,
            activeSearch.dropoffTime
          );
          if (hasOverlap) return false;
        }
      }

      // Text search
      if (
        search &&
        !v.name.toLowerCase().includes(search.toLowerCase()) &&
        !v.model.toLowerCase().includes(search.toLowerCase()) &&
        !v.locationHub.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      // Duration filter
      const d = getVehicleDurationHours(v);
      if (durationFilter === "up_to_1" && d > 1) return false;
      if (durationFilter === "1_to_2" && (d <= 1 || d > 2)) return false;
      if (durationFilter === "2_to_3" && (d <= 2 || d > 3)) return false;
      if (durationFilter === "more_than_3" && d <= 3) return false;

      return true;
    });
  }, [allVehicles, activeSearch, category, search, durationFilter]);

  // 2. Sort by Owner-Defined Rental Duration
  const sortedVehicles = [...filtered].sort((a, b) => {
    const durA = getVehicleDurationHours(a);
    const durB = getVehicleDurationHours(b);
    if (durationSort === "shortest") return durA - durB;
    if (durationSort === "longest") return durB - durA;
    return 0;
  });

  const handleOpenDetails = (v: StoredVehicle) => {
    setSelectedVehicle(v);
    setActiveImageIndex(0);
  };

  const handleBook = (v: StoredVehicle) => {
    if (!user) {
      toast.error("Please log in to submit a booking request.");
      return;
    }

    const duration = getVehicleDurationHours(v);
    const totalAmount = calculateRentalAmount(duration);

    if (!v.isAvailable) {
      toast.error(`${v.name} is currently occupied or unavailable.`);
      return;
    }

    const hasOverlap = dataStore.checkVehicleOverlap(v.id, v.availableFrom, v.mustReturnBy);
    if (hasOverlap) {
      toast.error(`A booking for ${v.name} is already pending or active for this time slot.`);
      return;
    }

    setIsBooking(true);

    dataStore.createBooking({
      vehicle: v,
      renter: user,
      pickupTime: v.availableFrom || "Today, 9:00 AM",
      dropoffTime: v.mustReturnBy || "Today, 12:00 PM",
      durationHours: duration,
      campusHub: v.locationHub,
      mandatoryReturnDeadline: v.mustReturnBy,
    });

    toast.success(
      `Booking request for ${v.name} submitted! Duration: ${duration}h • Total: ₹${totalAmount}. Return by: ${v.mustReturnBy || "Scheduled deadline"}`
    );
    setSelectedVehicle(null);
    setIsBooking(false);
  };

  const handleInspectHostStudentId = (v: StoredVehicle) => {
    const hostUser = dataStore.getUserById(v.ownerId);
    setInspectParticipant({
      name: v.ownerName,
      avatar: v.ownerAvatar,
      campus: v.campus,
      role: "owner",
      studentIdNumber: hostUser?.studentIdNumber || "SID-UCB-2023-HOST88",
      studentIdUrl: hostUser?.studentIdCardUrl || "/student_id_proof.svg",
      studentVerified: hostUser?.studentVerified ?? true,
      vehicleName: v.name,
    });
  };

  const hasActiveFilters =
    search !== "" || category !== "All" || durationFilter !== "all" || durationSort !== "default" || activeSearch !== null;

  const resetAllFilters = () => {
    setSearch("");
    setCategory("All");
    setDurationFilter("all");
    setDurationSort("default");
    handleClearSearch();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Campus Ride Marketplace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Find a Ride</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Verified student-owned rides near{" "}
            <span className="font-semibold text-gray-800">{user?.campus || "UC Berkeley Hub"}</span>.
            Fixed rate: <span className="font-bold text-emerald-800 font-mono">₹{STANDARD_HOURLY_RATE}/hour</span>.
            Rental duration is defined by the vehicle owner.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {sortedVehicles.length} Rides Available
          </span>
        </div>
      </div>

      {/* ── PART 1: COMPACT VEHICLE SEARCH & FILTER BAR ── */}
      {/* Dark navy container with emerald green labels and button, matching screenshot */}
      <div className="bg-[#0b1a2e] rounded-2xl shadow-lg border border-white/[0.08] p-3 sm:p-4 transition-all">
        {searchError && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span>{searchError}</span>
          </div>
        )}

        <form onSubmit={handleFindRide}>
          {/* Responsive 6-column desktop / 3-column tablet / 1-column mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 items-stretch">

            {/* 1. Vehicle Type */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Bike className="w-3 h-3" />
                Vehicle Type
              </label>
              <select
                value={searchVehicleType}
                onChange={(e) => setSearchVehicleType(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0b1a2e]">All Rides</option>
                <option value="Bike" className="bg-[#0b1a2e]">Bikes &amp; Cycles</option>
                <option value="Scooter" className="bg-[#0b1a2e]">Scooters</option>
              </select>
            </div>

            {/* 2. Pickup Date */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Pickup Date
              </label>
              <input
                type="date"
                value={searchPickupDate}
                min={today}
                onChange={(e) => setSearchPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 3. Pickup Time */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pickup Time
              </label>
              <input
                type="time"
                value={searchPickupTime}
                onChange={(e) => setSearchPickupTime(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 4. Drop-off Date */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Drop-off Date
              </label>
              <input
                type="date"
                value={searchDropoffDate}
                min={searchPickupDate || today}
                onChange={(e) => setSearchDropoffDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 5. Drop-off Time */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9.5px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Drop-off Time
              </label>
              <input
                type="time"
                value={searchDropoffTime}
                onChange={(e) => setSearchDropoffTime(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 6. Find a Ride Button */}
            <div className="flex items-stretch">
              <button
                type="submit"
                className="w-full min-h-[44px] py-2 px-4 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 hover:shadow-[0_0_24px_rgba(52,211,153,0.4)] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-emerald-400/20"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Find a Ride</span>
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* ── Active Search Criteria Pill Bar ── */}
      {activeSearch && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-900">
                Active Search Schedule:{" "}
                <span className="font-semibold text-emerald-800">
                  {activeSearch.vehicleType === "All" ? "All Rides" : activeSearch.vehicleType + "s"}
                </span>
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {activeSearch.pickupDate} {activeSearch.pickupTime} → {activeSearch.dropoffDate} {activeSearch.dropoffTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg">
              {sortedVehicles.length} available
            </span>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Secondary Filters & Sorting ── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs space-y-3.5">
        {/* Row 1: Search text & Category pills */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by model (Xiaomi, Trek, Activa, Hunter), hub name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl shrink-0">
            {(["All", "Scooter", "Bike"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  category === cat
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {cat === "All" ? "All Rides" : cat === "Scooter" ? "⚡ Scooters" : "🚲 Bikes"}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Sort by Duration & Duration Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown size={13} className="text-emerald-700 shrink-0" />
              <label htmlFor="duration-sort-select" className="text-xs font-semibold text-gray-700 shrink-0">
                Sort Duration:
              </label>
              <select
                id="duration-sort-select"
                aria-label="Sort by Rental Duration"
                value={durationSort}
                onChange={(e) => setDurationSort(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-emerald-900 outline-none cursor-pointer pr-1"
              >
                <option value="default">Default / Recommended</option>
                <option value="shortest">Shortest Duration First (1h → 8h)</option>
                <option value="longest">Longest Duration First (8h → 1h)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <Filter size={13} className="text-emerald-700 shrink-0" />
              <label htmlFor="duration-filter-select" className="text-xs font-semibold text-gray-700 shrink-0">
                Duration:
              </label>
              <select
                id="duration-filter-select"
                aria-label="Filter by Rental Duration"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-emerald-900 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Durations</option>
                <option value="up_to_1">Up to 1 Hour</option>
                <option value="1_to_2">1–2 Hours</option>
                <option value="2_to_3">2–3 Hours</option>
                <option value="more_than_3">More than 3 Hours</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[11px] font-semibold text-gray-500 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              Fixed Rate: <strong className="text-emerald-800 font-bold">₹{STANDARD_HOURLY_RATE}/hr</strong> · Host-set duration
            </span>
          </div>
        </div>
      </div>

      {/* ── Vehicle Cards Grid ── */}
      {sortedVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedVehicles.map((v) => {
            const duration = getVehicleDurationHours(v);
            const totalCost = calculateRentalAmount(duration);

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Vehicle Image */}
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-emerald-900 shadow-sm border border-emerald-200/60">
                      ₹{STANDARD_HOURLY_RATE} / hour
                    </div>
                    <div className="absolute top-3 left-3 bg-[#0A1F1A]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold tracking-wide uppercase">
                      {v.vehicleType}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-1 font-medium">
                      <MapPin size={10} className="text-emerald-400" />
                      <span>{v.locationHub}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {v.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{v.model}</p>
                      </div>
                      {v.rating > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{v.rating}</span>
                          {v.reviewCount > 0 && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({v.reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Owner-Defined Duration & Cost */}
                    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-emerald-700 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            Available Duration
                          </p>
                          <p className="text-xs font-black text-emerald-950">
                            {duration} {duration === 1 ? "Hour" : "Hours"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                          Total Rental Cost
                        </p>
                        <p className="text-sm font-black text-emerald-900">
                          ₹{totalCost}
                        </p>
                      </div>
                    </div>

                    {/* Availability Window */}
                    {v.availableFrom && (
                      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-2 text-xs">
                        <CalendarDays size={13} className="text-emerald-700 shrink-0" />
                        <div className="truncate">
                          <span className="text-gray-500 text-[11px]">Available From: </span>
                          <span className="font-semibold text-gray-800 text-[11px]">
                            {v.availableFrom}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mandatory Return Deadline */}
                    {v.mustReturnBy && (
                      <div className="flex items-center gap-2 bg-rose-50/80 border border-rose-200/70 rounded-xl px-3 py-2 text-xs">
                        <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                        <div className="truncate">
                          <span className="text-rose-600 font-bold text-[11px]">Must Return By: </span>
                          <span className="font-bold text-rose-800 text-[11px]">
                            {v.mustReturnBy}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Host Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={v.ownerAvatar}
                          alt={v.ownerName}
                          className="w-5 h-5 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                        <span className="text-gray-600 text-xs truncate">Host: {v.ownerName}</span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                        <ShieldCheck size={11} className="text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 sm:p-5 pt-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(v)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBook(v)}
                    disabled={isBooking}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>Book Now (₹{totalCost})</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Bike className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {activeSearch ? "No Rides Match Your Selected Schedule" : "No Rides Found"}
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {activeSearch
              ? `No vehicles are available for your requested time window (${activeSearch.pickupDate} ${activeSearch.pickupTime} → ${activeSearch.dropoffDate} ${activeSearch.dropoffTime}). Try adjusting your dates or clearing the schedule filter.`
              : "No campus rides match your current filters. Try resetting the filters or selecting another category."}
          </p>
          <div className="mt-5 flex justify-center gap-2.5">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Reset Schedule &amp; Filters
            </button>
          </div>
        </div>
      )}

      {/* ── Vehicle Specifications & Booking Details Modal ── */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[95vw] rounded-3xl bg-white p-0 overflow-hidden max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 font-sans">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-gray-900">Vehicle Specifications &amp; Booking</h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                Fixed Rate: ₹{STANDARD_HOURLY_RATE}/hr
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-6 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                {/* Left Column: Images */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs">
                    <img
                      src={
                        activeImageIndex === 0
                          ? selectedVehicle.imageUrl
                          : activeImageIndex === 1
                          ? "/card_return.jpg"
                          : "/bike_hunter.jpg"
                      }
                      alt={selectedVehicle.name}
                      className="w-full h-full object-cover transition-all duration-200"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-emerald-900 shadow-xs border border-emerald-100">
                      ₹{STANDARD_HOURLY_RATE} / hour
                    </div>
                    <div className="absolute top-3 left-3 bg-[#0A1F1A]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold uppercase tracking-wider">
                      {selectedVehicle.vehicleType}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Multi-Angle Preview
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Main Exterior", url: selectedVehicle.imageUrl },
                        { label: "Hub Parking", url: "/card_return.jpg" },
                        { label: "Cockpit & Controls", url: "/bike_hunter.jpg" },
                      ].map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            activeImageIndex === idx
                              ? "border-emerald-600 ring-2 ring-emerald-100"
                              : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-medium truncate px-1">
                            {img.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-700" />
                      <span>Included Safety &amp; Gear</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVehicle.features.map((feature, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs"
                        >
                          <Check size={11} className="text-emerald-600" />
                          <span>{feature}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Details & Locked Terms */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedVehicle.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck size={11} className="text-emerald-600" />
                        Campus Verified
                      </span>
                      {selectedVehicle.rating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {selectedVehicle.rating} ({selectedVehicle.reviewCount} reviews)
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      {selectedVehicle.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedVehicle.model}</p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                        Standard Platform Rental Rate
                      </p>
                      <p className="text-2xl font-black text-emerald-950 mt-0.5">
                        ₹{STANDARD_HOURLY_RATE}{" "}
                        <span className="text-xs font-semibold text-emerald-700">/ hour</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        Zero Security Deposit
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1">No hidden surcharges</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Vehicle Overview
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {getVehicleDescription(selectedVehicle)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                    <MapPin size={15} className="text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-gray-400">Pickup &amp; Return Location</p>
                      <p className="font-semibold text-gray-900 truncate">{selectedVehicle.locationHub}</p>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedVehicle.ownerAvatar}
                        alt={selectedVehicle.ownerName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-900">{selectedVehicle.ownerName}</p>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={10} className="text-emerald-600" />
                            Student Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {selectedVehicle.ownerCollege || selectedVehicle.campus}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInspectHostStudentId(selectedVehicle)}
                      className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <GraduationCap size={13} className="text-emerald-600" />
                      <span>View Host Student ID</span>
                    </button>
                  </div>

                  {/* Owner-Defined Locked Duration Box */}
                  {(() => {
                    const dur = getVehicleDurationHours(selectedVehicle);
                    const totalAmt = calculateRentalAmount(dur);

                    return (
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={14} className="text-emerald-700" />
                            <span>Owner-Defined Rental Duration</span>
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900">
                            Fixed by Host
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-2xs">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">
                              Rental Duration
                            </p>
                            <p className="text-base font-black text-gray-900 mt-0.5">
                              {dur} {dur === 1 ? "Hour" : "Hours"}
                            </p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-2xs">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">
                              Hourly Rate
                            </p>
                            <p className="text-base font-black text-gray-900 mt-0.5">
                              ₹{STANDARD_HOURLY_RATE}
                              <span className="text-[10px] font-normal text-gray-500">/hr</span>
                            </p>
                          </div>
                          <div className="bg-emerald-900 text-white rounded-xl p-3 shadow-2xs">
                            <p className="text-[10px] text-emerald-300 font-semibold uppercase">
                              Total Cost
                            </p>
                            <p className="text-base font-black text-white mt-0.5">
                              ₹{totalAmt}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                            <div className="flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                              <CalendarDays size={12} className="text-emerald-700" />
                              <span>Available From</span>
                            </div>
                            <p className="font-bold text-gray-900 text-xs">
                              {selectedVehicle.availableFrom || "28 October 2026, 9:00 AM"}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-0.5">
                            <div className="flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                              <AlertTriangle size={12} className="text-rose-600" />
                              <span>Must Return By</span>
                            </div>
                            <p className="font-black text-rose-800 text-xs">
                              {selectedVehicle.mustReturnBy || "28 October 2026, 12:00 PM"}
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-emerald-800 leading-normal">
                          ℹ️ The host defined a fixed session of {dur} hours. Booking reserves this vehicle
                          for the full availability period. Renter cannot alter or shorten this duration.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {(() => {
              const dur = getVehicleDurationHours(selectedVehicle);
              const totalAmt = calculateRentalAmount(dur);

              return (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-xs text-gray-500 hidden sm:block">
                    <span>Total Rental Amount: </span>
                    <strong className="text-emerald-800 text-sm font-black">
                      ₹{totalAmt}
                    </strong>{" "}
                    ({dur} {dur === 1 ? "hour" : "hours"} owner-defined session)
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBook(selectedVehicle)}
                      disabled={isBooking}
                      className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>Confirm Booking Request • ₹{totalAmt}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* Host Student ID Preview Modal */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}

/** Exported page wraps the inner component in Suspense */
export default function RenterBrowsePage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        <div className="h-20 bg-[#0b1a2e] rounded-2xl" />
        <div className="h-16 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    }>
      <RenterBrowseContent />
    </Suspense>
  );
}
