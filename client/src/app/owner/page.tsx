"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  PlusCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Activity,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Camera,
  MapPin,
  Eye,
  Key,
  Sparkles,
  Zap,
  Check,
  X,
  RotateCcw,
  User,
  Phone,
  GraduationCap,
  List,
} from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";
import { dataStore, StoredVehicle, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import { ActiveRideCard } from "@/components/ActiveRideCard";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";

  const [stats, setStats] = useState(dataStore.getOwnerStats(ownerId));
  const [vehicles, setVehicles] = useState(dataStore.getOwnerVehicles(ownerId));
  const [bookings, setBookings] = useState(dataStore.getOwnerBookings(ownerId));

  // Dialogs
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [inspectBooking, setInspectBooking] = useState<StoredBooking | null>(null);
  const [inspectedParticipant, setInspectedParticipant] = useState<StudentIdParticipant | null>(null);
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);

  const handleInspectKyc = (b: StoredBooking) => {
    const renterUser = dataStore.getUserById(b.renterId);
    setInspectedParticipant({
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

  // New vehicle form state
  const [newName, setNewName] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newCategory, setNewCategory] = useState<"Bike" | "Scooter">("Scooter");
  const [newType, setNewType] = useState<StoredVehicle["vehicleType"]>("Electric Scooter");
  const [newCampus, setNewCampus] = useState(user?.campus || "UC Berkeley");
  const [newHub, setNewHub] = useState("Sproul Plaza Hub");
  const [newPrice, setNewPrice] = useState("4.00");
  const [newRcNumber, setNewRcNumber] = useState("");

  // Mandatory Availability and Return Schedule fields
  const [newAvailableFromDate, setNewAvailableFromDate] = useState("2026-10-28");
  const [newAvailableFromTime, setNewAvailableFromTime] = useState("10:00 AM");
  const [newReturnDate, setNewReturnDate] = useState("2026-10-28");
  const [newReturnTime, setNewReturnTime] = useState("01:00 PM");

  const reloadData = () => {
    setStats(dataStore.getOwnerStats(ownerId));
    setVehicles(dataStore.getOwnerVehicles(ownerId));
    setBookings(dataStore.getOwnerBookings(ownerId));
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  // Actions
  const handleAcceptRequest = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "active");
    toast.success(`Booking ${booking.id} accepted! Ride is now active.`);
    reloadData();
  };

  const handleRejectRequest = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "cancelled");
    toast.error(`Booking request ${booking.id} declined.`);
    reloadData();
  };

  const handleConfirmReturnInspection = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "completed");
    toast.success(`Return verified! ${booking.vehicleName} is back in your available fleet.`);
    setInspectBooking(null);
    reloadData();
  };

  // Validation for schedule
  const scheduleValidation = useMemo(() => {
    if (!newAvailableFromDate || !newAvailableFromTime || !newReturnDate || !newReturnTime) {
      return {
        isValid: false,
        message: "All 4 availability start and mandatory return fields are required.",
      };
    }

    const parseToTime = (timeStr: string) => {
      const isPM = /pm/i.test(timeStr);
      const isAM = /am/i.test(timeStr);
      const cleaned = timeStr.replace(/[^\d:]/g, "");
      const parts = cleaned.split(":");
      let h = parseInt(parts[0] || "0", 10);
      const m = parseInt(parts[1] || "0", 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return { h, m };
    };

    const startT = parseToTime(newAvailableFromTime);
    const returnT = parseToTime(newReturnTime);

    const startObj = new Date(newAvailableFromDate);
    startObj.setHours(startT.h, startT.m, 0, 0);

    const returnObj = new Date(newReturnDate);
    returnObj.setHours(returnT.h, returnT.m, 0, 0);

    if (returnObj.getTime() <= startObj.getTime()) {
      return {
        isValid: false,
        message: "Mandatory return date and time must be later than availability start date and time.",
      };
    }

    return { isValid: true, message: "" };
  }, [newAvailableFromDate, newAvailableFromTime, newReturnDate, newReturnTime]);

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newModel || !newPrice) {
      toast.error("Please fill in all vehicle specifications.");
      return;
    }

    if (!scheduleValidation.isValid) {
      toast.error(scheduleValidation.message);
      return;
    }

    const formatDateText = (dStr: string) => {
      const d = new Date(dStr);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    };

    const fromFormatted = `${formatDateText(newAvailableFromDate)}, ${newAvailableFromTime}`;
    const returnFormatted = `${formatDateText(newReturnDate)}, ${newReturnTime}`;

    dataStore.addVehicle({
      name: newName,
      model: newModel,
      category: newCategory,
      vehicleType: newType,
      campus: newCampus,
      locationHub: newHub,
      hourlyPrice: parseFloat(newPrice),
      imageUrl: newCategory === "Scooter" ? "/scooter_activa.jpg" : "/bike_trek.jpg",
      isAvailable: true,
      status: "pending_approval",
      ownerId,
      ownerName: user?.name || "Marcus Vance",
      ownerCollege: user?.campus || "UC Berkeley",
      ownerAvatar: user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      features: ["Campus verified", "Helmet included", "Pre-ride checked"],
      availableFromDate: newAvailableFromDate,
      availableFromTime: newAvailableFromTime,
      returnDate: newReturnDate,
      returnTime: newReturnTime,
      availableFrom: fromFormatted,
      mustReturnBy: returnFormatted,
      documents: {
        rcNumber: newRcNumber || `RC-${Math.floor(10000 + Math.random() * 90000)}`,
        insuranceExpiry: "2027-10-20",
        verified: false,
      },
    });

    toast.success(`${newName} submitted for admin verification! Return deadline: ${returnFormatted}.`);
    setIsAddVehicleOpen(false);
    setNewName("");
    setNewModel("");
    reloadData();
  };

  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const activeRentals = bookings.filter((b) => b.status === "active" || b.status === "overdue");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Header with Direct Links */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#031E18] via-[#053328] to-[#04261E] text-white p-7 sm:p-9 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-white/15">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>VEHICLE OWNER DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name?.split(" ")[0] || "Host"}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
              Manage your student rental fleet at {user?.campus || "UC Berkeley"}. Keep track of active campus rides, review peer requests, and set mandatory return deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-xs hover:from-emerald-600 hover:to-green-600 shadow-md shadow-emerald-950/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
            <Link
              href="/owner/listings"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2"
            >
              <List className="w-4 h-4 text-emerald-300" />
              <span>Fleet Listings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Total Vehicles"
          value={stats.totalVehicles}
          icon={Car}
          trend="In your fleet"
          color="#059669"
          bg="#ECFDF5"
        />
        <StatCard
          label="Available"
          value={stats.availableVehicles}
          icon={CheckCircle2}
          trend="Ready to rent"
          color="#10B981"
          bg="#ECFDF5"
        />
        <StatCard
          label="Pending Approval"
          value={stats.pendingApproval}
          icon={Clock}
          trend="Admin RC check"
          color="#D97706"
          bg="#FFFBEB"
          highlight={stats.pendingApproval > 0}
        />
        <StatCard
          label="Booking Requests"
          value={stats.bookingRequests}
          icon={Inbox}
          trend="Needs response"
          color="#059669"
          bg="#ECFDF5"
          highlight={stats.bookingRequests > 0}
        />
        <StatCard
          label="Active Rentals"
          value={stats.activeRentals}
          icon={Activity}
          trend="Live on campus"
          color="#10B981"
          bg="#D1FAE5"
          highlight={stats.activeRentals > 0}
        />
        <StatCard
          label="Returned / Done"
          value={stats.completedReturnedRentals}
          icon={RotateCcw}
          trend="Inspected"
          color="#059669"
          bg="#ECFDF5"
        />
      </div>

      {/* 3. PROMINENT ACTIVE RIDES SECTION */}
      {activeRentals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                <span>Active Campus Rides ({activeRentals.length})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live on Campus
                </span>
              </h2>
            </div>
            <Link
              href="/owner/active-rides"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Manage in Active Rides Hub</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {activeRentals.map((rental) => (
              <ActiveRideCard
                key={rental.id}
                booking={rental}
                viewerRole="owner"
                onInitiateCall={(b) => setCallModalBooking(b)}
                onViewStudentId={(p) => setInspectedParticipant(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Booking Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-base font-black text-amber-950">
                Pending Booking Requests ({pendingRequests.length})
              </h2>
            </div>
            <Link
              href="/owner/booking-requests"
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-amber-200/60 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{req.id}</span>
                    <h3 className="text-sm font-bold text-gray-900">{req.vehicleName}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Renter: <strong>{req.renterName}</strong> ({req.renterCampus.split("·")[0]})
                    </p>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      {req.pickupTime} → {req.dropoffTime} ({req.durationHours} hrs)
                    </p>
                    {req.mandatoryReturnDeadline && (
                      <p className="text-[11px] font-bold text-amber-800 mt-0.5">
                        Must Return By: {req.mandatoryReturnDeadline}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-black text-gray-900 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                    ${req.totalCost.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleInspectKyc(req)}
                    className="py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <GraduationCap size={13} className="text-emerald-600" />
                    <span>View Student ID</span>
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex-1 cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req)}
                    className="py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
          <DialogContent className="max-w-lg rounded-3xl bg-white p-6 max-h-[90vh] overflow-y-auto font-sans">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                List a Student Vehicle
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Specify hardware specifications and the mandatory return deadline before publishing your listing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateVehicle} className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand &amp; Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda Activa 6G"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Model Trim / Specs</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 110cc Smart Key Edition"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Scooter">Scooter</option>
                    <option value="Bike">Bike / Motorcycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Motor Scooter">Motor Scooter</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Hybrid Bicycle">Hybrid Bicycle</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Price ($/hr)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Designated Pickup Hub</label>
                  <input
                    type="text"
                    value={newHub}
                    onChange={(e) => setNewHub(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Mandatory Return Schedule Fields */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Mandatory Vehicle Return Schedule (Required)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Available From</label>
                    <input
                      type="date"
                      required
                      value={newAvailableFromDate}
                      onChange={(e) => setNewAvailableFromDate(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Available From Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM"
                      value={newAvailableFromTime}
                      onChange={(e) => setNewAvailableFromTime(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Must Return By</label>
                    <input
                      type="date"
                      required
                      value={newReturnDate}
                      onChange={(e) => setNewReturnDate(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-[11px]">Return Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1:00 PM"
                      value={newReturnTime}
                      onChange={(e) => setNewReturnTime(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {!scheduleValidation.isValid ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{scheduleValidation.message}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Schedule confirmed: Must return by {newReturnDate}, {newReturnTime}.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">RC / Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. CA-EBIKE-92812"
                  value={newRcNumber}
                  onChange={(e) => setNewRcNumber(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!scheduleValidation.isValid}
                  className={`py-2.5 px-5 rounded-xl text-white font-bold text-xs shadow-md ${
                    scheduleValidation.isValid
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Submit Listing
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Return Photo Inspection Modal */}
      {inspectBooking && (
        <Dialog open={!!inspectBooking} onOpenChange={() => setInspectBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Return Photo Inspection
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {inspectBooking.vehicleName} · Returned by {inspectBooking.renterName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-3">
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
                <img src={inspectBooking.returnPhotoUrl} alt="Return photo" className="w-full max-h-72 object-contain" />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <p><strong>Campus Hub:</strong> {inspectBooking.campusHub}</p>
                <p><strong>Return Notes:</strong> {inspectBooking.returnNotes}</p>
                <p className="font-mono text-[10px] text-gray-500">{inspectBooking.returnPhotoMinioKey}</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setInspectBooking(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleConfirmReturnInspection(inspectBooking)}
                className="py-2.5 px-5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
              >
                Approve &amp; Mark Completed
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* In-Platform Voice Calling Modal */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="owner"
      />

      {/* Student ID Proof Preview Modal */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectedParticipant)}
        onClose={() => setInspectedParticipant(null)}
        participant={inspectedParticipant}
      />
    </div>
  );
}
