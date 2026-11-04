"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  PlusCircle,
  DollarSign,
  Activity,
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Camera,
  Eye,
  RotateCcw,
  GraduationCap,
  X,
  Check,
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

  // Add vehicle form state
  const [newName, setNewName] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newCategory, setNewCategory] = useState<"Bike" | "Scooter">("Scooter");
  const [newType, setNewType] = useState<StoredVehicle["vehicleType"]>("Electric Scooter");  const [newCampus, setNewCampus] = useState(user?.campus || "UC Berkeley");
  const [newHub, setNewHub] = useState("Sproul Plaza Hub");
  const [newPrice, setNewPrice] = useState("4.00");
  const [newRcNumber, setNewRcNumber] = useState("");
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

  const handleAcceptRequest = (booking: StoredBooking) => {
    const res = dataStore.approveBooking(booking.id);
    if (res.success) {
      toast.success(`Booking ${booking.id} approved! Reserved for ${booking.renterName}.`);
      reloadData();
    } else {
      toast.error(res.error || "Failed to approve booking.");
    }
  };

  const handleRejectRequest = (booking: StoredBooking) => {
    const res = dataStore.rejectBooking(booking.id);
    if (res.success) {
      toast.error(`Booking request ${booking.id} declined.`);
      reloadData();
    } else {
      toast.error(res.error || "Failed to decline booking.");
    }
  };

  const handleConfirmReturnInspection = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "completed");
    toast.success(`Return verified! ${booking.vehicleName} completed. Set a new availability schedule in My Vehicle before listing again.`);
    setInspectBooking(null);
    reloadData();
  };

  const scheduleValidation = useMemo(() => {
    if (!newAvailableFromDate || !newAvailableFromTime || !newReturnDate || !newReturnTime) {
      return { isValid: false, message: "All 4 availability start and mandatory return fields are required." };
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
      return { isValid: false, message: "Mandatory return date/time must be later than availability start." };
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
    <div className="max-w-7xl mx-auto pb-12 space-y-6 font-sans">

      {/* Page Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your vehicles and rental activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {vehicles.length === 0 && (
            <button
              onClick={() => setIsAddVehicleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <PlusCircle size={13} />
              <span>Add Vehicle</span>
            </button>
          )}
          <Link
            href="/owner/my-vehicles"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <Car size={13} />
            <span className="hidden sm:inline">My Vehicle</span>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
          bg="#D1FAE5"
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
          label="Returned"
          value={stats.completedReturnedRentals}
          icon={RotateCcw}
          trend="Inspected"
          color="#059669"
          bg="#ECFDF5"
        />
      </div>

      {/* Active Rides Section */}
      {activeRentals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900">
                Active Campus Rides
                <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeRentals.length} Live
                </span>
              </h2>
            </div>
            <Link
              href="/owner/active-rides"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              Manage All
              <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
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

      {/* Pending Booking Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-sm font-bold text-gray-900">
                Pending Booking Requests
                <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingRequests.length} New
                </span>
              </h2>
            </div>
            <Link
              href="/owner/booking-requests"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              View All
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-amber-100 hover:border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={req.renterAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-emerald-100"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900">{req.renterName}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ✓ Student
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 truncate">
                      {req.vehicleName} · {req.pickupTime} → {req.dropoffTime}
                    </p>
                    {req.mandatoryReturnDeadline && (
                      <p className="text-[10px] font-semibold text-amber-700 mt-0.5">
                        Must return by: {req.mandatoryReturnDeadline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-gray-900 hidden sm:block">
                    ₹{req.totalCost || req.durationHours * 100}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 hidden lg:block">{req.id}</span>
                  <button
                    onClick={() => handleInspectKyc(req)}
                    className="py-1.5 px-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <GraduationCap size={12} className="text-emerald-600" />
                    <span className="hidden sm:inline">Student ID</span>
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Check size={12} />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req)}
                    className="py-1.5 px-2.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Vehicles Table */}
      {vehicles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">My Registered Vehicle</h2>
            <Link
              href="/owner/my-vehicles"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              Manage Vehicle
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/60">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-gray-500">Vehicle</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 hidden sm:table-cell">Price</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 hidden md:table-cell">Return Deadline</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.slice(0, 5).map((v) => (
                  <TableRow key={v.id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={v.imageUrl}
                          alt=""
                          className="w-10 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{v.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{v.model}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs font-semibold text-gray-800">₹{v.hourlyPrice || 100}/hr</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {v.mustReturnBy ? (
                        <span className="text-[11px] text-amber-700 font-medium">{v.mustReturnBy}</span>
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : v.status === "pending_approval"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {v.status === "pending_approval" ? "Pending" : v.status === "approved" ? "Active" : v.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href="/owner/my-vehicles"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        Manage
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
          <DialogContent className="max-w-lg rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                List a Student Vehicle
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Specify hardware specifications and the mandatory return deadline before publishing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateVehicle} className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Brand & Model Name</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Model Trim / Specs</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 110cc Smart Key"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hourly Price ($/hr)</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Hub</label>
                  <input
                    type="text"
                    value={newHub}
                    onChange={(e) => setNewHub(e.target.value)}
                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Mandatory Return Schedule */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Mandatory Return Schedule
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Available From</label>
                    <input
                      type="date"
                      required
                      value={newAvailableFromDate}
                      onChange={(e) => setNewAvailableFromDate(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">From Time</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 AM"
                      value={newAvailableFromTime}
                      onChange={(e) => setNewAvailableFromTime(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Must Return By</label>
                    <input
                      type="date"
                      required
                      value={newReturnDate}
                      onChange={(e) => setNewReturnDate(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Return Time</label>
                    <input
                      type="text"
                      required
                      placeholder="1:00 PM"
                      value={newReturnTime}
                      onChange={(e) => setNewReturnTime(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {!scheduleValidation.isValid ? (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{scheduleValidation.message}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Return confirmed: {newReturnDate}, {newReturnTime}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">RC / Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. CA-EBIKE-92812"
                  value={newRcNumber}
                  onChange={(e) => setNewRcNumber(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <DialogFooter className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="py-2 px-4 rounded-lg border border-gray-200 text-gray-600 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!scheduleValidation.isValid}
                  className={`py-2 px-5 rounded-lg text-white font-semibold text-xs ${
                    scheduleValidation.isValid
                      ? "bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
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
          <DialogContent className="max-w-md rounded-2xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Return Photo Inspection
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {inspectBooking.vehicleName} · Returned by {inspectBooking.renterName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-3">
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
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
                className="py-2 px-4 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleConfirmReturnInspection(inspectBooking)}
                className="py-2 px-5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800"
              >
                Approve & Mark Completed
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
