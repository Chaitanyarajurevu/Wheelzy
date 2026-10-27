"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Key,
  MapPin,
  Calendar,
  AlertCircle,
  Camera,
  RotateCcw,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import { StoredBooking, dataStore } from "@/lib/dataStore";
import { StudentIdParticipant } from "@/components/StudentIdPreviewModal";

interface ActiveRideCardProps {
  booking: StoredBooking;
  viewerRole: "owner" | "renter";
  onInitiateCall: (booking: StoredBooking) => void;
  onViewStudentId: (participant: StudentIdParticipant) => void;
  onReturnRide?: (booking: StoredBooking) => void;
}

export function ActiveRideCard({
  booking,
  viewerRole,
  onInitiateCall,
  onViewStudentId,
  onReturnRide,
}: ActiveRideCardProps) {
  // Session time remaining calculation
  const [timeRemainingText, setTimeRemainingText] = useState("In Progress");
  const [progressPercent, setProgressPercent] = useState(65);

  useEffect(() => {
    // Generate a realistic session progress and remaining time display
    if (booking.status === "active") {
      setTimeRemainingText("2h 15m remaining");
      setProgressPercent(55);
    } else if (booking.status === "returned" || booking.status === "completed") {
      setTimeRemainingText("Session Completed");
      setProgressPercent(100);
    } else {
      setTimeRemainingText("Starts at " + booking.pickupTime);
      setProgressPercent(0);
    }
  }, [booking]);

  // Lookup vehicle registration details
  const vehicle = dataStore.getVehicleById(booking.vehicleId);
  const rcNumber =
    vehicle?.documents?.rcNumber || `RC-CA-${booking.vehicleId.toUpperCase()}-2026`;

  // Lookup counterparty user details
  const counterpartyUser =
    viewerRole === "owner"
      ? dataStore.getUserById(booking.renterId)
      : dataStore.getUserById(booking.ownerId);

  const counterpartyName =
    viewerRole === "owner" ? booking.renterName : booking.ownerName;
  const counterpartyAvatar =
    viewerRole === "owner" ? booking.renterAvatar : booking.ownerAvatar;
  const counterpartyCampus =
    viewerRole === "owner"
      ? booking.renterCampus || counterpartyUser?.campus || "UC Berkeley"
      : `${booking.campusHub} Verified Host`;

  const isStudentVerified =
    viewerRole === "owner"
      ? booking.renterStudentVerified ?? counterpartyUser?.studentVerified ?? true
      : counterpartyUser?.studentVerified ?? true;

  const studentIdNumber =
    viewerRole === "owner"
      ? booking.renterStudentIdNumber || counterpartyUser?.studentIdNumber || "SID-UCB-2024-99214"
      : counterpartyUser?.studentIdNumber || "SID-UCB-2023-HOST88";

  const studentIdUrl =
    viewerRole === "owner"
      ? booking.renterStudentIdUrl || counterpartyUser?.studentIdCardUrl || "/student_id_proof.svg"
      : counterpartyUser?.studentIdCardUrl || "/student_id_proof.svg";

  const handleOpenStudentIdModal = () => {
    onViewStudentId({
      name: counterpartyName,
      avatar: counterpartyAvatar,
      campus: counterpartyCampus,
      role: viewerRole === "owner" ? "renter" : "owner",
      studentIdNumber,
      studentIdUrl,
      studentVerified: isStudentVerified,
      bookingId: booking.id,
      vehicleName: booking.vehicleName,
    });
  };

  const isCallEnabled = booking.status === "active";

  return (
    <div className="relative rounded-3xl bg-white border border-gray-100 shadow-lg shadow-emerald-950/5 overflow-hidden transition-all duration-200 hover:shadow-xl font-sans">

      {/* Top Highlight Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#031E18] via-[#053328] to-[#031E18] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {booking.status === "active" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE
            </span>
          )}
          {booking.status === "approved" || booking.status === "pending" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 uppercase tracking-wider">
              <Clock size={12} />
              CONFIRMED
            </span>
          ) : null}
          {booking.status === "returned" || booking.status === "completed" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
              <CheckCircle2 size={12} />
              RETURNED
            </span>
          ) : null}

          {/* Booking ID & Vehicle Model */}
          <span className="font-mono text-xs font-bold text-emerald-200">
            {booking.id}
          </span>
          <span className="text-white/40 hidden md:inline">•</span>
          <span className="text-xs text-emerald-100/80 hidden md:inline truncate max-w-[220px]">
            {booking.vehicleModel}
          </span>
        </div>

        {/* Session Remaining Time Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <Clock size={14} className="text-emerald-400 shrink-0" />
          <span className="text-emerald-100 font-semibold">{timeRemainingText}</span>
          <span className="text-[10px] text-emerald-300/80 font-mono px-2 py-0.5 rounded-md bg-white/10 border border-white/10">
            Due {booking.dropoffTime}
          </span>
        </div>
      </div>

      {/* Session Progress Bar */}
      {booking.status === "active" && (
        <div className="w-full bg-emerald-950/20 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Main Body Grid */}
      <div className="p-5 sm:p-6 space-y-6">

        {/* Row 1: Vehicle Details & Key Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-16 sm:w-24 sm:h-18 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm">
              <img
                src={booking.vehicleImage}
                alt={booking.vehicleName}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white uppercase backdrop-blur-xs">
                {booking.category}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  {booking.vehicleName}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {booking.vehicleModel}
              </p>

              {/* Registration Identifier */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                  Reg: {rcNumber}
                </span>
                <span className="text-[11px] text-gray-400">•</span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <MapPin size={11} className="text-emerald-600" />
                  {booking.campusHub}
                </span>
              </div>
            </div>
          </div>

          {/* Time Slot & Cost Pill */}
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 self-stretch sm:self-auto text-left sm:text-right space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
              Session Schedule
            </span>
            <div className="text-xs font-bold text-gray-800">
              {booking.pickupTime} → {booking.dropoffTime}
            </div>
            <div className="text-xs font-black text-emerald-800">
              ${booking.totalCost.toFixed(2)} Total ({booking.durationHours} hrs)
            </div>
          </div>
        </div>

        {/* Row 2: Peer Participant Card (Privacy-Guaranteed, Student ID Only, No Phone, No Aadhaar) */}
        <div className="bg-gradient-to-r from-emerald-50/60 via-emerald-50/30 to-green-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white border border-emerald-200 shrink-0 shadow-xs flex items-center justify-center">
              {counterpartyAvatar ? (
                <img
                  src={counterpartyAvatar}
                  alt={counterpartyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-emerald-700" />
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                {viewerRole === "owner" ? "Student Renter" : "Vehicle Host"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {counterpartyName}
                </span>
                {isStudentVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck size={11} className="text-emerald-600" />
                    Student Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    <Clock size={11} />
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {counterpartyCampus}
              </p>
            </div>
          </div>

          {/* Student ID Proof Viewing Action */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleOpenStudentIdModal}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap size={14} className="text-emerald-600" />
              <span>
                {viewerRole === "owner" ? "View Renter Student ID" : "View Host Student ID"}
              </span>
            </button>
          </div>
        </div>

        {/* Digital Unlock Passcode (if active) */}
        {booking.status === "active" && (
          <div className="bg-emerald-950 p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Key size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Smart Lock Keypad Code
                </p>
                <p className="text-xs text-emerald-100/80">
                  Use this passcode to unlock the vehicle at {booking.campusHub}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-emerald-300 bg-black/40 px-3.5 py-1.5 rounded-xl border border-emerald-400/40 tracking-widest shadow-xs">
                {booking.digitalUnlockCode || "WHZ-9281"}
              </span>
            </div>
          </div>
        )}

        {/* Return Photo & Timestamp Details (if returned) */}
        {booking.status === "returned" && (
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={booking.returnPhotoUrl || "/card_return.jpg"}
                alt="Return Photo"
                className="w-14 h-14 rounded-xl object-cover border border-emerald-200 shadow-2xs"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Verified Return Proof
                </span>
                <p className="text-xs font-bold text-gray-900">
                  Logged at {booking.campusHub}
                </p>
                <p className="text-[11px] text-gray-500">
                  Timestamp: {booking.returnTimestamp || "Today, 5:02 PM"}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
              ✓ Quad Hub Inspected
            </span>
          </div>
        )}

        {/* Row 3: Action Buttons (Call Action + Return Action) */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

          {/* In-Platform Call Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button
              type="button"
              disabled={!isCallEnabled}
              onClick={() => onInitiateCall(booking)}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${isCallEnabled
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-75"
                }`}
              title={
                isCallEnabled
                  ? `Initiate in-platform voice call with ${counterpartyName}`
                  : "Calling becomes available when your ride starts"
              }
            >
              <Phone size={15} className={isCallEnabled ? "text-emerald-100 animate-pulse" : ""} />
              <span>
                {viewerRole === "owner" ? "Call Renter" : "Call Owner"}
              </span>
            </button>

            {!isCallEnabled && (
              <span className="text-[11px] text-gray-400 italic">
                {booking.status === "returned" || booking.status === "completed"
                  ? "Session ended"
                  : "Calling becomes available when your ride starts"}
              </span>
            )}
          </div>

          {/* Contextual Second Action */}
          <div className="flex items-center gap-2">
            {viewerRole === "renter" && booking.status === "active" && (
              <Link
                href="/renter/return"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Camera size={14} className="text-emerald-700" />
                <span>End Ride &amp; Upload Photo</span>
              </Link>
            )}

            {viewerRole === "owner" && booking.status === "active" && (
              <Link
                href="/owner/return-tracking"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} className="text-gray-500" />
                <span>Return Tracking</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
