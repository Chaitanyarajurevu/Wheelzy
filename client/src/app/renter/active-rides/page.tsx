"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  CheckCircle2,
  Compass,
  Phone,
  Camera,
  RotateCcw,
  GraduationCap,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  History,
  BadgeCheck,
  Eye,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
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

export default function RenterActiveRidesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const renterId = user && user.role === "renter" ? user.id : "usr-renter-priya";

  const [allRenterBookings, setAllRenterBookings] = useState<StoredBooking[]>(
    dataStore.getRenterBookings(renterId)
  );

  // Modals
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<StoredBooking | null>(null);
  const [inspectReturnBooking, setInspectReturnBooking] = useState<StoredBooking | null>(null);

  const reload = () => {
    setAllRenterBookings(dataStore.getRenterBookings(renterId));
  };

  const handleResetActiveRide = () => {
    dataStore.resetRenterActiveRide(renterId);
    reload();
    toast.success("Active ride BK-8021 reset to in-progress!");
  };

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [renterId]);

  // Display only currently active rental sessions (active, overdue, or return submitted awaiting verification)
  const activeRides = allRenterBookings.filter(
    (b) => b.status === "active" || b.status === "overdue" || b.status === "returned"
  );
  const confirmedRides = allRenterBookings.filter((b) => b.status === "confirmed");
  const completedRides = allRenterBookings.filter((b) => b.status === "completed");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* ── Page Header (Compact, No oversized container) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase">
              Live Rental Session
            </span>
            {activeRides.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {activeRides.length} {activeRides.length === 1 ? "Active Ride" : "Active Rides"}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Active Ride</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your current rental, contact the vehicle owner, and complete your return.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleResetActiveRide}
            title="Reset active booking BK-8021 back to in-progress"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw size={13} className="text-gray-500" />
            <span>Reset Active Ride</span>
          </button>

          <Link
            href={
              activeRides.length > 0
                ? `/renter/return?bookingId=${activeRides[0].id}`
                : `/renter/return`
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Return Vehicle</span>
          </Link>
        </div>
      </div>

      {/* ── Approved & Confirmed Reservations Awaiting Start ── */}
      {confirmedRides.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-emerald-700" />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">
              Approved & Confirmed Reservations ({confirmedRides.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {confirmedRides.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-emerald-200 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={b.vehicleImage || "/scooter_xiaomi.jpg"}
                    alt=""
                    className="w-16 h-14 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{b.vehicleName}</h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                        Approved by Host
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{b.campusHub}</p>
                    <p className="text-[11px] text-gray-700 font-semibold mt-0.5">
                      Pickup: {b.pickupTime} · Return Deadline: {b.mandatoryReturnDeadline || b.dropoffTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 block font-mono">
                      ₹{b.totalCost || b.durationHours * 100}
                    </span>
                    <span className="text-[10px] text-gray-400">{b.durationHours} hrs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      dataStore.startRide(b.id);
                      toast.success(`Ride started! Digital unlock code generated.`);
                      reload();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={13} />
                    <span>Start Ride / Unlock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Rides List (or Clean Empty State) ── */}
      {activeRides.length > 0 ? (
        <div className="space-y-6">
          {activeRides.map((booking, idx) => {
            const isReturned = booking.status === "returned";
            const isOverdue = booking.status === "overdue";
            const vehicle = dataStore.getVehicleById(booking.vehicleId);
            const regNumber =
              booking.vehicleRegistrationNumber ||
              vehicle?.documents?.rcNumber ||
              `RC-CA-${booking.vehicleId.toUpperCase()}`;

            return (
              <div
                key={`${booking.id}-${idx}`}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden font-sans"
              >
                {/* ── Top Header Status Bar ── */}
                <div className="px-5 py-3.5 bg-[#064E3B] text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Status Pill */}
                    {isReturned ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-200 border border-teal-400/30 uppercase tracking-wider">
                        <CheckCircle2 size={12} className="text-teal-300" />
                        <span>RETURN SUBMITTED</span>
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/25 text-rose-200 border border-rose-400/40 uppercase tracking-wider animate-pulse">
                        <AlertTriangle size={12} className="text-rose-300" />
                        <span>OVERDUE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ACTIVE</span>
                      </span>
                    )}

                    {/* Booking ID */}
                    <span className="font-mono text-xs font-extrabold text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                      {booking.id}
                    </span>

                    {/* Digital Smart Lock Code */}
                    {booking.digitalUnlockCode && !isReturned && (
                      <span className="text-xs text-white/90 bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-300">
                          Unlock Code:
                        </span>
                        <span className="font-mono font-black text-white">
                          {booking.digitalUnlockCode}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Timer Strip */}
                  <div className="flex items-center gap-2 text-xs">
                    <Clock size={14} className="text-emerald-300 shrink-0" />
                    <span className="font-bold text-emerald-100">
                      {isReturned
                        ? "Awaiting Host Inspection"
                        : isOverdue
                        ? "Overdue Return"
                        : "2h 45m remaining"}
                    </span>
                    {booking.mandatoryReturnDeadline && (
                      <span className="hidden sm:inline text-[11px] text-amber-200 bg-black/25 px-2 py-0.5 rounded-md border border-white/10">
                        Must Return By: {booking.mandatoryReturnDeadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Active Session */}
                {!isReturned && (
                  <div className="w-full bg-emerald-950/20 h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverdue
                          ? "bg-rose-500 w-full"
                          : "bg-gradient-to-r from-emerald-500 to-green-400 w-2/5"
                      }`}
                    />
                  </div>
                )}

                {/* ── Balanced Two-Column Main Content ── */}
                <div className="p-5 sm:p-6 lg:p-7 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ── LEFT COLUMN: Vehicle Details & Owner Information ── */}
                    <div className="lg:col-span-6 space-y-5">
                      {/* Vehicle Image & Overview */}
                      <div className="space-y-3">
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                          <img
                            src={booking.vehicleImage || "/bike_hunter.jpg"}
                            alt={booking.vehicleName}
                            className="w-full h-full object-cover"
                          />
                          {/* Category Badge */}
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#064E3B]/90 text-white uppercase tracking-wider shadow-xs">
                            {booking.category || "Bike"}
                          </span>
                          {/* Registration Plate */}
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-black bg-black/75 text-white tracking-wider border border-white/20 shadow-xs">
                            {regNumber}
                          </span>
                          {/* Hub Location Badge */}
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xs text-white text-xs flex items-center gap-1.5 truncate">
                            <MapPin size={12} className="text-emerald-400 shrink-0" />
                            <span className="truncate font-semibold">{booking.campusHub}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                              {booking.vehicleType || "Campus Ride"}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            {booking.vehicleName}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {booking.vehicleModel}
                          </p>
                        </div>
                      </div>

                      {/* Owner Details Card (Student ID Only, Never Aadhaar) */}
                      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-white border-2 border-emerald-300 shrink-0 shadow-2xs">
                              <img
                                src={booking.ownerAvatar}
                                alt={booking.ownerName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                  {booking.ownerName}
                                </h3>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <ShieldCheck size={10} className="text-emerald-600" />
                                  Student Verified
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 truncate">
                                Vehicle Owner · {booking.campusHub}
                              </p>
                            </div>
                          </div>

                          {/* View Host Student ID (Zero Aadhaar) */}
                          <button
                            type="button"
                            onClick={() => {
                              const hostUser = dataStore.getUserById(booking.ownerId);
                              setInspectParticipant({
                                name: booking.ownerName,
                                avatar: booking.ownerAvatar,
                                campus: booking.campusHub,
                                role: "owner",
                                studentIdNumber: hostUser?.studentIdNumber || "SID-HOST-9912",
                                studentIdUrl: hostUser?.studentIdCardUrl || "/student_id_proof.svg",
                                studentVerified: true,
                                vehicleName: booking.vehicleName,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                          >
                            <GraduationCap size={13} className="text-emerald-600" />
                            <span>View Host Student ID</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── RIGHT COLUMN: Rental Session Details & Pricing ── */}
                    <div className="lg:col-span-6 space-y-5">
                      {/* Rental Session Times */}
                      <div className="bg-gray-50/90 rounded-2xl border border-gray-200/90 p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                            Rental Session Details
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {booking.durationHours || 4} Hours Total
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          {/* Booking Start */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-gray-400">
                              Booking Start Date &amp; Time
                            </span>
                            <p className="font-bold text-gray-900 text-xs sm:text-sm">
                              {booking.actualStartTime || booking.pickupTime}
                            </p>
                            <p className="text-[11px] text-gray-500">Trip Unlocked</p>
                          </div>

                          {/* Scheduled Return Deadline */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-rose-500">
                              Mandatory Return Deadline
                            </span>
                            <p className="font-extrabold text-rose-900 text-xs sm:text-sm">
                              {booking.mandatoryReturnDeadline || booking.dropoffTime}
                            </p>
                            <p className="text-[11px] text-rose-700/80 font-medium">
                              Must return by deadline
                            </p>
                          </div>

                          {/* Rental Duration */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-gray-400">
                              Rental Duration
                            </span>
                            <p className="font-bold text-gray-900 text-xs sm:text-sm">
                              {booking.durationHours || 4} Hours
                            </p>
                            <p className="text-[11px] text-gray-500">Owner-Defined Schedule</p>
                          </div>

                          {/* Remaining Session Time */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-emerald-700">
                              Remaining Session Time
                            </span>
                            <p className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                              {isReturned
                                ? "Session Concluded"
                                : isOverdue
                                ? "0 Mins (Overdue)"
                                : "2 Hours 15 Mins"}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              {isReturned ? "Awaiting inspection" : "Live Session Countdown"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                            Pricing Breakdown
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            Fixed Hourly Rental
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Standard Rental Rate:</span>
                            <span className="font-semibold text-gray-900">₹100 / hour</span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Rental Duration:</span>
                            <span className="font-semibold text-gray-900">
                              {booking.durationHours || 4} Hours
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Campus Quad &amp; Insurance Fee:</span>
                            <span className="font-semibold text-emerald-800">Included (Free)</span>
                          </div>
                          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">
                              Total Rental Cost:
                            </span>
                            <span className="text-lg font-black text-emerald-950">
                              ₹{booking.totalCost}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Overdue Warning Alert */}
                      {isOverdue && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-1.5">
                          <div className="flex items-center gap-2 text-rose-800 font-bold">
                            <AlertTriangle size={16} className="text-rose-600 shrink-0 animate-bounce" />
                            <span>Overdue Return Warning</span>
                          </div>
                          <p className="text-[11px] text-rose-800/90 leading-relaxed">
                            Your scheduled return deadline of{" "}
                            {booking.mandatoryReturnDeadline || booking.dropoffTime} has passed. Please return the vehicle immediately to {booking.campusHub} to avoid late billing.
                          </p>
                        </div>
                      )}

                      {/* Approaching Deadline Reminder */}
                      {!isOverdue && !isReturned && (
                        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                            <Clock size={14} className="text-amber-600 shrink-0" />
                            <span>Campus Return Reminder</span>
                          </div>
                          <p className="text-[11px] text-amber-800/90 leading-tight">
                            Please return the vehicle to <strong>{booking.campusHub}</strong> before{" "}
                            {booking.mandatoryReturnDeadline || booking.dropoffTime}.
                          </p>
                        </div>
                      )}

                      {/* Return Submitted Notification */}
                      {isReturned && (
                        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-950 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                            <span>Return Inspection Submitted</span>
                          </div>
                          <p className="text-[11px] text-teal-800/90 leading-relaxed">
                            Your return photo and quad verification have been logged. Host {booking.ownerName} will complete final handover inspection.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── RETURN OPTION CALLOUT BANNER ── */}
                  <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <RotateCcw size={20} className="text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                          {isReturned
                            ? "Return Process Completed & Submitted"
                            : "Vehicle Return & Checkout Workflow"}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
                          {isReturned
                            ? "Your return verification photos are awaiting owner inspection. Need to test or submit again?"
                            : `Return vehicle to ${booking.campusHub} and complete the 5-step return verification.`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto flex-wrap">
                      <Link
                        href={`/renter/return?bookingId=${booking.id}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>{isReturned ? "View Return Details" : "Start Return Workflow"}</span>
                      </Link>
                      {isReturned && (
                        <button
                          type="button"
                          onClick={handleResetActiveRide}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          <span>Reset to Active</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── ACTION BUTTONS ROW ── */}
                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Call Owner */}
                    <div className="w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={isReturned}
                        onClick={() => setCallModalBooking(booking)}
                        className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          !isReturned
                            ? "bg-[#064E3B] hover:bg-[#053F30] text-white shadow-xs cursor-pointer"
                            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <Phone size={14} />
                        <span>Call Owner</span>
                      </button>
                      {isReturned && (
                        <span className="text-[10px] text-gray-400 mt-1 block text-center sm:text-left">
                          Calling disabled after return
                        </span>
                      )}
                    </div>

                    {/* Renter Actions: Cancel Booking, Reset, Upload Return Photo, Return Vehicle */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
                      {/* Cancel Booking */}
                      {!isReturned && (
                        <button
                          type="button"
                          onClick={() => setCancelModalBooking(booking)}
                          className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <XCircle size={14} className="inline mr-1" />
                          <span>Cancel Booking</span>
                        </button>
                      )}

                      {/* Reset Ride to Active (if already marked returned) */}
                      {isReturned && (
                        <button
                          type="button"
                          onClick={handleResetActiveRide}
                          className="flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw size={13} />
                          <span>Reset to Active</span>
                        </button>
                      )}

                      {/* Upload Return Photo */}
                      <Link
                        href={`/renter/return?bookingId=${booking.id}&step=3`}
                        className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Camera size={14} className="text-emerald-700" />
                        <span>Upload Return Photo</span>
                      </Link>

                      {/* Return Vehicle / Return Bike */}
                      <Link
                        href={`/renter/return?bookingId=${booking.id}`}
                        className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>{isReturned ? "View Return Details" : "Return Vehicle"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Clean Empty State (With 1-Click Reset to Active Ride) ── */
        <div className="bg-white rounded-3xl border border-gray-200/90 p-10 sm:p-14 text-center max-w-md mx-auto shadow-2xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <Zap size={26} className="text-emerald-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">No Active Rides</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              You don&apos;t have an ongoing rental right now. Click below to restore your active ride session or find a new ride.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleResetActiveRide}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Reset Active Ride (BK-8021)</span>
            </button>
            <Link
              href="/renter/browse"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
            >
              <Compass size={15} />
              <span>Find a Ride</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Completed Rental History ── */}
      {completedRides.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History size={16} className="text-emerald-700" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Completed Ride History ({completedRides.length})
              </h2>
            </div>
            <Link
              href="/renter/booking?tab=completed"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Past Bookings</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedRides.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-5 space-y-4 font-sans"
              >
                {/* Header with status and ID */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <BadgeCheck size={12} className="text-emerald-600" />
                    <span>Completed & Returned</span>
                  </span>
                  <span className="font-mono text-xs text-gray-400 font-bold">{b.id}</span>
                </div>

                {/* Vehicle & Host Info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={b.vehicleImage || "/scooter_xiaomi.jpg"}
                    alt={b.vehicleName}
                    className="w-16 h-14 rounded-2xl object-cover shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 truncate">{b.vehicleName}</h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      Host: <strong className="text-gray-700">{b.ownerName}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                      <MapPin size={11} />
                      {b.campusHub}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black font-mono text-gray-900 block">
                      ₹{b.totalCost || b.durationHours * 100}
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

                {/* Return photo preview if present */}
                {b.returnPhotoUrl && (
                  <div
                    onClick={() => setInspectReturnBooking(b)}
                    className="relative rounded-2xl overflow-hidden border border-gray-200 group cursor-pointer h-28 bg-black"
                  >
                    <img
                      src={b.returnPhotoUrl}
                      alt="Return proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye size={14} /> Click to Inspect Return Photo
                    </div>
                  </div>
                )}

                {/* Actions: Host ID & Details / Review */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectParticipant({
                        role: "owner",
                        name: b.ownerName,
                        campus: b.campusHub || "Campus Host",
                        avatar: b.ownerAvatar || "/default_avatar.jpg",
                        studentVerified: true,
                        studentIdNumber: "HOST-VERIFIED",
                      });
                    }}
                    className="py-1.5 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors cursor-pointer"
                  >
                    Host Details
                  </button>

                  <Link
                    href={`/renter/booking?tab=completed`}
                    className="py-1.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Trip Receipt</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CONFIRMATION DIALOG: CANCEL BOOKING                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!cancelModalBooking} onOpenChange={() => setCancelModalBooking(null)}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-5 sm:p-6 font-sans">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Cancellation Policy</span>
            </div>
            <DialogTitle className="text-base font-bold text-gray-900">
              Cancel Active Booking Reservation?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Booking {cancelModalBooking?.id} · {cancelModalBooking?.vehicleName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            {cancelModalBooking?.status === "active" || cancelModalBooking?.status === "overdue" ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-800">
                  <XCircle size={14} className="shrink-0" />
                  Active Handover in Progress
                </p>
                <p className="text-[11px] leading-relaxed text-rose-800/90">
                  The vehicle keys and smart lock have already been checked out for this rental session. Under Wheelzy campus safety regulations, an active vehicle cannot bypass physical return through cancellation.
                </p>
                <p className="text-[11px] font-semibold text-rose-900">
                  To conclude your rental and stop billing, please use the <strong>End Ride</strong> button to complete the multi-step return protocol.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 space-y-1">
                <p className="font-bold">Wheelzy Student Refund Guarantee</p>
                <p className="text-[11px] text-emerald-800">
                  Pre-trip reservations can be cancelled at any time before vehicle unlock for a 100% full refund to your student wallet.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalBooking(null)}
              className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            {cancelModalBooking?.status === "active" || cancelModalBooking?.status === "overdue" ? (
              <Link
                href={`/renter/return?bookingId=${cancelModalBooking?.id}`}
                className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center"
              >
                Proceed to End Ride
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (cancelModalBooking) {
                    dataStore.cancelBooking(
                      cancelModalBooking.id,
                      "Cancelled by student renter before start."
                    );
                    toast.success(
                      `Booking ${cancelModalBooking.id} cancelled. 100% full refund returned.`
                    );
                    setCancelModalBooking(null);
                    reload();
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* IN-PLATFORM CALL MODAL (Zero Mobile Number Exposure)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="renter"
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* RETURN PHOTO INSPECTION MODAL                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!inspectReturnBooking} onOpenChange={() => setInspectReturnBooking(null)}>
        <DialogContent className="max-w-xl rounded-3xl bg-white p-5 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              Return Inspection Evidence · {inspectReturnBooking?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Photographic proof of safe parking and physical handover at campus hub.
            </DialogDescription>
          </DialogHeader>
          {inspectReturnBooking?.returnPhotoUrl && (
            <div className="relative rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center my-2">
              <img
                src={inspectReturnBooking.returnPhotoUrl}
                alt="Return photo"
                className="max-h-[55vh] w-auto object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setInspectReturnBooking(null)}
              className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* HOST STUDENT ID PREVIEW MODAL (Strictly Zero Aadhaar)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}
