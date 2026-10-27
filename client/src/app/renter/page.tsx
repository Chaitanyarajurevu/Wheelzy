"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Compass,
  Search,
  BookOpen,
  Activity,
  CreditCard,
  RotateCcw,
  AlertTriangle,
  Calendar,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Star,
  Sparkles,
  ArrowRight,
  Upload,
  Check,
  Zap,
  ChevronRight,
  Phone,
} from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";
import { dataStore, StoredVehicle, StoredBooking } from "@/lib/dataStore";
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
import { ActiveRideCard } from "@/components/ActiveRideCard";
import { InPlatformCallModal } from "@/components/InPlatformCallModal";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";

export default function RenterDashboardPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";

  const [stats, setStats] = useState(dataStore.getRenterStats(renterId));
  const [myBookings, setMyBookings] = useState(dataStore.getRenterBookings(renterId));
  const [availableVehicles, setAvailableVehicles] = useState(
    dataStore.getApprovedAvailableVehicles(user?.campus)
  );

  // Calling & KYC Inspection Dialogs
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Bike" | "Scooter">("All");

  // Return Photo Upload Modal
  const [returnModalBooking, setReturnModalBooking] = useState<StoredBooking | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [returnPhotoPreview, setReturnPhotoPreview] = useState("/card_return.jpg");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Vehicle Details Modal
  const [selectedVehicle, setSelectedVehicle] = useState<StoredVehicle | null>(null);

  // Report Issue Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<any>("Vehicle Damage");
  const [reportDescription, setReportDescription] = useState("");

  const reloadData = () => {
    setStats(dataStore.getRenterStats(renterId));
    setMyBookings(dataStore.getRenterBookings(renterId));
    setAvailableVehicles(dataStore.getApprovedAvailableVehicles(user?.campus));
  };

  useEffect(() => {
    const handleUpdate = () => reloadData();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [renterId, user?.campus]);

  const activeRentals = myBookings.filter((b) => b.status === "active");
  const upcomingBookings = myBookings.filter((b) => b.status === "approved" || b.status === "pending");

  // Handle Return Photo Upload
  const handleSubmitReturnPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalBooking) return;

    setIsSubmittingReturn(true);
    setTimeout(() => {
      dataStore.submitReturnPhoto(
        returnModalBooking.id,
        returnPhotoPreview,
        returnNotes || "Vehicle safely parked and locked at campus hub."
      );
      toast.success("Return photo submitted! Booking updated to RETURNED.");
      setIsSubmittingReturn(false);
      setReturnModalBooking(null);
      setReturnNotes("");
      reloadData();
    }, 600);
  };

  // Handle Instant Booking
  const handleInstantBook = (vehicle: StoredVehicle) => {
    if (!user) {
      toast.error("Please login to book a ride");
      return;
    }
    dataStore.createBooking({
      vehicle,
      renter: user,
      pickupTime: "Today, 3:00 PM",
      dropoffTime: "Today, 6:00 PM",
      durationHours: 3,
      campusHub: vehicle.locationHub,
    });
    toast.success(`Booking request sent to ${vehicle.ownerName}!`);
    setSelectedVehicle(null);
    reloadData();
  };

  // Handle Issue Report
  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription) {
      toast.error("Please enter issue details");
      return;
    }
    dataStore.createReport({
      reporterId: renterId,
      reporterName: user?.name || "Priya Nair",
      reporterRole: "renter",
      targetType: "vehicle",
      targetId: activeRentals[0]?.vehicleId || "Campus Fleet",
      category: reportCategory,
      description: reportDescription,
    });
    toast.success("Issue report filed with campus support.");
    setIsReportOpen(false);
    setReportDescription("");
  };

  // Filtered available vehicles
  const filteredVehicles = availableVehicles.filter((v) => {
    if (selectedCategory !== "All" && v.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !v.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.model.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !v.locationHub.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">

      {/* 1. Student Renter Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#047857] text-white p-7 sm:p-9 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-white/15">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>STUDENT RENTER DASHBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome Back, {user?.name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Rent bikes and scooters near your campus quads, track your live digital unlock codes, and upload return inspection photos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/renter/browse"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 shadow-md transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>Browse All Campus Rides</span>
            </Link>
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold text-xs hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-emerald-300" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Mandatory Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Bookings"
          value={stats.upcomingBookings}
          icon={Clock}
          trend="Confirmed reservations"
          color="#059669"
          bg="#ECFDF5"
          highlight={stats.upcomingBookings > 0}
        />
        <StatCard
          label="Active Rentals"
          value={stats.activeRentals}
          icon={Activity}
          trend="Live ride in progress"
          color="#6EE7B7"
          bg="#ECFDF5"
          highlight={stats.activeRentals > 0}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon={BookOpen}
          trend="Awaiting host approval"
          color="#D97706"
          bg="#FFFBEB"
        />
        <StatCard
          label="Returned Rentals"
          value={stats.returnedRentals}
          icon={RotateCcw}
          trend="Photos submitted"
          color="#10B981"
          bg="#ECFDF5"
        />
      </div>

      {/* 3. Prominent Active Ride Highlight Card */}
      {activeRentals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                <span>My Active Ride</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Session
                </span>
              </h2>
            </div>
            <Link
              href="/renter/active-rides"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Full Ride Controls</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {activeRentals.map((rental) => (
              <ActiveRideCard
                key={rental.id}
                booking={rental}
                viewerRole="renter"
                onInitiateCall={(b) => setCallModalBooking(b)}
                onViewStudentId={(p) => setInspectParticipant(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Upcoming Bookings & Status Cards */}
      {upcomingBookings.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Upcoming Campus Reservations</h2>
            <Link href="/renter/booking" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={b.vehicleImage} alt="" className="w-10 h-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{b.vehicleName}</h4>
                      <p className="text-[11px] text-gray-500">{b.campusHub}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-200/50">
                  <span>Slot: {b.pickupTime}</span>
                  <span className="font-bold text-gray-900">${b.totalCost.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Vehicle Search & Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
              <Sparkles size={12} className="text-emerald-500" />
              <span>Approved Campus Rides</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Rent a Ride Near Your Quad
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Only verified student vehicles ready for instant booking at {user?.campus || "UC Berkeley"}.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl w-fit">
            {(["All", "Scooter", "Bike"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {cat === "All" ? "All Rides" : cat === "Scooter" ? "Scooters" : "Bikes"}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ride model (Xiaomi, Trek, Honda Activa), hub, or specification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-emerald-900 shadow-sm">
                    ${v.hourlyPrice.toFixed(2)}/hr
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-white flex items-center gap-1 font-medium">
                    <MapPin size={10} className="text-emerald-400" /> {v.locationHub}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {v.name}
                      </h3>
                      <p className="text-xs text-gray-500">{v.model}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                      <Star size={12} className="fill-amber-400" />
                      <span>{v.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <img src={v.ownerAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-[11px] text-gray-600 truncate">Host: {v.ownerName}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedVehicle(v)}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-700 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Details & Book</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return Photo Upload Modal */}
      {returnModalBooking && (
        <Dialog open={!!returnModalBooking} onOpenChange={() => setReturnModalBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-7">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Return Vehicle & Inspection Photo
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Take a clear photo showing the vehicle safely locked at the campus hub.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitReturnPhoto} className="space-y-4 my-2">
              <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-gray-50 max-h-56">
                <img src={returnPhotoPreview} alt="Return inspection" className="w-full h-56 object-cover" />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <p><strong>Ride:</strong> {returnModalBooking.vehicleName}</p>
                <p><strong>Designated Dropoff Hub:</strong> {returnModalBooking.campusHub}</p>
                <p className="text-[10px] text-emerald-800 font-mono">
                  MinIO Key: minio://wheelzy-media/returns/ret_{returnModalBooking.id.toLowerCase()}.webp
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hub Parking Notes
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Locked securely at Bay 3 bike stand. Key placed in drop-box."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <DialogFooter className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalBooking(null)}
                  className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold shadow-md hover:from-emerald-700 hover:to-green-700 flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>{isSubmittingReturn ? "Submitting..." : "Complete Return"}</span>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Vehicle Details & Instant Book Modal */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {selectedVehicle.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {selectedVehicle.vehicleType} · {selectedVehicle.campus}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-52">
                <img src={selectedVehicle.imageUrl} alt="" className="w-full h-52 object-cover" />
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Hourly Price:</span>
                  <span className="font-bold text-emerald-900">${selectedVehicle.hourlyPrice.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup Hub:</span>
                  <span className="font-semibold text-gray-800">{selectedVehicle.locationHub}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified Host:</span>
                  <span className="font-semibold text-gray-800">{selectedVehicle.ownerName}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-700 mb-1.5">Features & Included Gear:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVehicle.features.map((f, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => handleInstantBook(selectedVehicle)}
                className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
              >
                Request Instant Booking
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Issue Modal */}
      {isReportOpen && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Report a Ride Issue
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Submit a complaint or maintenance defect to campus operations.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendReport} className="space-y-3 my-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="Vehicle Damage">Vehicle Damage / Loose Part</option>
                  <option value="Late Return">Late Return Dispute</option>
                  <option value="Billing Dispute">Billing Dispute</option>
                  <option value="Safety Concern">Safety Concern / Brakes</option>
                  <option value="Hub Facility">Campus Hub Scanner Defect</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Explain what happened..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="py-2 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Submit Report
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* In-Platform Voice Calling Modal (Call Owner) */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="renter"
      />

      {/* Host Student ID Preview Modal (Zero Aadhaar) */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />

    </div>
  );
}
