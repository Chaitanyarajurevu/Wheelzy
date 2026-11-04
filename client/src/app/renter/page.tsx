"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Compass,
  Search,
  Activity,
  RotateCcw,
  AlertTriangle,
  Clock,
  Star,
  ArrowRight,
  Upload,
  ChevronRight,
  Inbox,
  MapPin,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";
import {
  dataStore,
  StoredVehicle,
  StoredBooking,
  IncidentReport,
  STANDARD_HOURLY_RATE,
  calculateRentalAmount,
  getVehicleDurationHours,
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

  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Bike" | "Scooter">("All");
  const [returnModalBooking, setReturnModalBooking] = useState<StoredBooking | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [returnPhotoPreview] = useState("/card_return.jpg");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<StoredVehicle | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<IncidentReport["category"]>("Vehicle Damage");
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

  const handleInstantBook = (vehicle: StoredVehicle) => {
    if (!user) {
      toast.error("Please login to book a ride");
      return;
    }
    const duration = getVehicleDurationHours(vehicle);
    const totalAmount = calculateRentalAmount(duration);
    dataStore.createBooking({
      vehicle,
      renter: user,
      pickupTime: vehicle.availableFrom || "Today, 9:00 AM",
      dropoffTime: vehicle.mustReturnBy || "Today, 12:00 PM",
      durationHours: duration,
      campusHub: vehicle.locationHub,
      mandatoryReturnDeadline: vehicle.mustReturnBy,
    });
    toast.success(`Booking request sent to ${vehicle.ownerName}! Duration: ${duration}h • Total: ₹${totalAmount}.`);
    setSelectedVehicle(null);
    reloadData();
  };

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
    <div className="max-w-7xl mx-auto pb-12 space-y-6 font-sans">

      {/* Page Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Your bookings, active rides and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/renter/browse"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            <Compass size={13} />
            <span>Find a Ride</span>
          </Link>
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <AlertTriangle size={13} />
            <span className="hidden sm:inline">Report Issue</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Upcoming Bookings"
          value={stats.upcomingBookings}
          icon={Clock}
          trend="Confirmed"
          color="#059669"
          bg="#ECFDF5"
          highlight={stats.upcomingBookings > 0}
        />
        <StatCard
          label="Active Rides"
          value={stats.activeRentals}
          icon={Activity}
          trend="Live session"
          color="#10B981"
          bg="#D1FAE5"
          highlight={stats.activeRentals > 0}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon={Inbox}
          trend="Awaiting approval"
          color="#D97706"
          bg="#FFFBEB"
        />
        <StatCard
          label="Returned Rentals"
          value={stats.returnedRentals}
          icon={RotateCcw}
          trend="Photos submitted"
          color="#059669"
          bg="#ECFDF5"
        />
      </div>

      {/* Active Ride Section — most prominent */}
      {activeRentals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900">My Active Ride</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Session
              </span>
            </div>
            <Link
              href="/renter/active-rides"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              Full Controls
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
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

      {/* Booking Requests — immediately below active ride */}
      {upcomingBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Inbox size={15} className="text-amber-500" />
              <h2 className="text-sm font-bold text-gray-900">Booking Requests</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {upcomingBookings.length} Pending
              </span>
            </div>
            <Link
              href="/renter/booking-requests"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              All Requests
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-2">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4 hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={b.vehicleImage}
                    alt=""
                    className="w-11 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{b.vehicleName}</h4>
                    <p className="text-[11px] text-gray-500 truncate">{b.campusHub}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Pickup: <span className="font-medium text-gray-800">{b.pickupTime}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {b.mandatoryReturnDeadline && (
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                      <AlertTriangle size={10} />
                      <span>Return: {b.mandatoryReturnDeadline}</span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{b.totalCost}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Vehicles */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={13} className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">Approved Campus Rides</span>
            </div>
            <h2 className="text-sm font-bold text-gray-900">
              Available Near {user?.campus || "Your Campus"}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category pills */}
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              {(["All", "Scooter", "Bike"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {cat === "All" ? "All" : cat === "Scooter" ? "Scooters" : "Bikes"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search rides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-44"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map((v) => {
            const duration = getVehicleDurationHours(v);
            const totalCost = calculateRentalAmount(duration);

            return (
              <div
                key={v.id}
                className="bg-white rounded-xl border border-gray-100 hover:border-emerald-200 shadow-none hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-900 border border-emerald-100 shadow-2xs">
                    ₹100/hr
                  </div>
                  <div className="absolute bottom-2 left-2.5 bg-black/55 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] text-white flex items-center gap-1">
                    <MapPin size={9} className="text-emerald-400" />
                    {v.locationHub}
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {v.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate">{v.model}</p>
                    </div>
                    {v.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 shrink-0">
                        <Star size={11} className="fill-amber-400" />
                        <span>{v.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Owner-Defined Duration & Cost */}
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-emerald-700" />
                      <span className="text-[11px] font-bold text-emerald-950">
                        {duration} {duration === 1 ? "Hour" : "Hours"}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-900">
                      ₹{totalCost} total
                    </span>
                  </div>

                  {v.mustReturnBy && (
                    <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1 text-[10px] mb-2">
                      <AlertTriangle size={9} className="text-red-500 shrink-0" />
                      <span className="text-red-600 font-semibold truncate">Return by: {v.mustReturnBy}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mb-3">
                    <img src={v.ownerAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-[11px] text-gray-500 truncate">Host: {v.ownerName}</span>
                  </div>

                  <button
                    onClick={() => setSelectedVehicle(v)}
                    className="mt-auto w-full py-2 px-3 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-700 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View & Book (₹{totalCost})</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Car size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">No vehicles found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Return Photo Upload Modal */}
      {returnModalBooking && (
        <Dialog open={!!returnModalBooking} onOpenChange={() => setReturnModalBooking(null)}>
          <DialogContent className="max-w-md rounded-2xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Return Vehicle & Inspection Photo
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Take a clear photo showing the vehicle safely locked at the campus hub.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitReturnPhoto} className="space-y-4 my-2">
              <div className="rounded-xl overflow-hidden border border-emerald-200 bg-gray-50 max-h-56">
                <img src={returnPhotoPreview} alt="Return inspection" className="w-full h-56 object-cover" />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <p><strong>Ride:</strong> {returnModalBooking.vehicleName}</p>
                <p><strong>Dropoff Hub:</strong> {returnModalBooking.campusHub}</p>
                <p className="text-[10px] text-emerald-800 font-mono">
                  MinIO Key: minio://wheelzy-media/returns/ret_{returnModalBooking.id.toLowerCase()}.webp
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hub Parking Notes</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Locked securely at Bay 3 bike stand."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <DialogFooter className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalBooking(null)}
                  className="py-2 px-4 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="py-2 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload size={13} />
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
          <DialogContent className="max-w-md rounded-2xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {selectedVehicle.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {selectedVehicle.vehicleType} · {selectedVehicle.campus}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="rounded-xl overflow-hidden border border-gray-200 max-h-52">
                <img src={selectedVehicle.imageUrl} alt="" className="w-full h-52 object-cover" />
              </div>

              {(() => {
                const dur = getVehicleDurationHours(selectedVehicle);
                const totalAmt = calculateRentalAmount(dur);

                return (
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-2">
                    <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
                      <span className="text-gray-600 font-medium">Owner-Defined Duration:</span>
                      <span className="font-black text-emerald-950">
                        {dur} {dur === 1 ? "Hour" : "Hours"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Rental Rate:</span>
                      <span className="font-bold text-gray-900">₹{STANDARD_HOURLY_RATE}/hr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Rental Amount:</span>
                      <span className="font-black text-emerald-900 text-sm">₹{totalAmt}</span>
                    </div>
                    {selectedVehicle.mustReturnBy && (
                      <div className="flex justify-between items-center pt-1 border-t border-emerald-100 text-rose-700">
                        <span className="font-semibold text-[11px]">Must Return By:</span>
                        <span className="font-black text-[11px]">{selectedVehicle.mustReturnBy}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
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
                <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Features & Gear:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVehicle.features.map((f, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="py-2 px-4 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleInstantBook(selectedVehicle)}
                className="py-2 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                Request Booking (₹{calculateRentalAmount(getVehicleDurationHours(selectedVehicle))})
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Issue Modal */}
      {isReportOpen && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-md rounded-2xl bg-white p-6">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as IncidentReport["category"])}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Explain what happened..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="py-2 px-3 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Submit Report
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* In-Platform Voice Calling Modal */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="renter"
      />

      {/* Student ID Preview Modal */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}
