"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  RotateCcw,
  GraduationCap,
  AlertTriangle,
  XCircle,
  Flag,
} from "lucide-react";
import { StoredBooking, dataStore } from "@/lib/dataStore";
import { StudentIdParticipant } from "@/components/StudentIdPreviewModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
}: ActiveRideCardProps) {
  const router = useRouter();

  // Confirmation Modals State
  const [showEndRideModal, setShowEndRideModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Session time remaining calculation
  const [timeRemainingText, setTimeRemainingText] = useState("In Progress");
  const [progressPercent, setProgressPercent] = useState(65);

  useEffect(() => {
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

  // Vehicle registration
  const vehicle = dataStore.getVehicleById(booking.vehicleId);
  const rcNumber =
    vehicle?.documents?.rcNumber || `RC-CA-${booking.vehicleId.toUpperCase()}`;

  // Counterparty details
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
  const isCancellable =
    booking.status === "pending" ||
    booking.status === "approved" ||
    booking.status === "confirmed";

  const handleConfirmCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      dataStore.updateBookingStatus(booking.id, "cancelled");
      toast.success(`Booking ${booking.id} cancelled. 100% full refund initiated.`);
      setIsCancelling(false);
      setShowCancelModal(false);
    }, 500);
  };

  const handleProceedToEndRide = () => {
    setShowEndRideModal(false);
    router.push(`/renter/return?bookingId=${booking.id}`);
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200/80 shadow-xs overflow-hidden transition-all duration-200 hover:border-emerald-300 font-sans">
      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-[#0A1F1A] text-white flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          {booking.status === "active" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ACTIVE
            </span>
          )}
          {(booking.status === "approved" || booking.status === "confirmed" || booking.status === "pending") && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
              <Clock size={11} />
              {booking.status === "pending" ? "PENDING" : "CONFIRMED"}
            </span>
          )}
          {(booking.status === "returned" || booking.status === "completed") && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
              <CheckCircle2 size={11} />
              {booking.status.toUpperCase()}
            </span>
          )}
          {booking.status === "cancelled" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/20 text-gray-300 border border-gray-400/40 uppercase tracking-wider">
              <XCircle size={11} />
              CANCELLED
            </span>
          )}

          <span className="font-mono text-xs font-semibold text-emerald-300">
            {booking.id}
          </span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-xs text-gray-300 hidden sm:inline truncate max-w-[200px]">
            {booking.vehicleModel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-200">
          <Clock size={13} className="text-emerald-400 shrink-0" />
          <span className="font-medium text-[11px]">{timeRemainingText}</span>
          {booking.mandatoryReturnDeadline && (
            <span className="text-[10px] text-amber-300/90 font-medium px-2 py-0.5 rounded bg-white/10 border border-white/10 hidden md:inline">
              Deadline: {booking.mandatoryReturnDeadline}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar for Active Rides */}
      {booking.status === "active" && (
        <div className="w-full bg-emerald-950/20 h-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Row 1: Vehicle & Schedule Overview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-18 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              <img
                src={booking.vehicleImage}
                alt={booking.vehicleName}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1 rounded text-[9px] font-bold bg-black/70 text-white uppercase">
                {booking.category}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {booking.vehicleName}
              </h3>
              <p className="text-xs text-gray-500 truncate">{booking.vehicleModel}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                  {rcNumber}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={10} className="text-emerald-600 shrink-0" />
                  {booking.campusHub}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule & Cost */}
          <div className="bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-200 text-left sm:text-right shrink-0 w-full sm:w-auto">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Schedule</p>
            <p className="text-xs font-semibold text-gray-800">
              {booking.pickupTime} → {booking.dropoffTime}
            </p>
            <p className="text-xs font-bold text-emerald-800 mt-0.5">
              ₹{booking.totalCost} Total ({booking.durationHours} {booking.durationHours === 1 ? "hr" : "hrs"})
            </p>
          </div>
        </div>

        {/* Row 2: Counterparty Info (Student ID Only, No Aadhaar) */}
        <div className="bg-emerald-50/50 p-3 sm:p-3.5 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-emerald-200 shrink-0 flex items-center justify-center">
              {counterpartyAvatar ? (
                <img
                  src={counterpartyAvatar}
                  alt={counterpartyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GraduationCap className="w-5 h-5 text-emerald-700" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-gray-900 truncate">{counterpartyName}</p>
                {isStudentVerified ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck size={10} className="text-emerald-600" />
                    Student Verified
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                {viewerRole === "owner" ? "Student Renter" : "Vehicle Host"} • {counterpartyCampus}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenStudentIdModal}
            className="self-start sm:self-auto px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <GraduationCap size={13} className="text-emerald-600" />
            <span>{viewerRole === "owner" ? "View Renter Student ID" : "View Host Student ID"}</span>
          </button>
        </div>

        {/* Return Proof Details (if returned) */}
        {booking.status === "returned" && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={booking.returnPhotoUrl || "/card_return.jpg"}
                alt="Return Photo"
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Return Submitted
                </p>
                <p className="font-semibold text-gray-800">{booking.campusHub}</p>
                <p className="text-[11px] text-gray-500">
                  Logged: {booking.returnTimestamp || "Today"}
                  {booking.returnGpsLatitude && (
                    <span className="ml-1 text-emerald-700 font-semibold">• GPS Verified ✓</span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
              Awaiting Host Inspection
            </span>
          </div>
        )}

        {/* Actions Row */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Call Owner / Calling Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isCallEnabled}
              onClick={() => onInitiateCall(booking)}
              className={`py-2 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isCallEnabled
                  ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
            >
              <Phone size={13} className={isCallEnabled ? "text-emerald-100" : ""} />
              <span>{viewerRole === "owner" ? "Call Renter" : "Call Owner"}</span>
            </button>
            {!isCallEnabled && (
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                {booking.status === "returned" || booking.status === "completed"
                  ? "Session ended"
                  : "Available during active session"}
              </span>
            )}
          </div>

          {/* Right: Renter Actions (End Ride, Upload Return Photo, Cancel Booking) */}
          {viewerRole === "renter" && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Cancel Booking Action (Only for eligible states) */}
              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="py-2 px-3 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel Booking
                </button>
              )}

              {/* Upload Return Photo */}
              {booking.status === "active" && (
                <Link
                  href={`/renter/return?bookingId=${booking.id}`}
                  className="py-2 px-3 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Camera size={13} className="text-emerald-600" />
                  <span>Upload Return Photo</span>
                </Link>
              )}

              {/* End Ride Action */}
              {booking.status === "active" && (
                <button
                  type="button"
                  onClick={() => setShowEndRideModal(true)}
                  className="py-2 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw size={13} />
                  <span>End Ride</span>
                </button>
              )}
            </div>
          )}

          {/* Owner specific action */}
          {viewerRole === "owner" && booking.status === "active" && (
            <Link
              href="/owner/my-vehicles?tab=returns"
              className="py-2 px-3.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={13} className="text-gray-500" />
              <span>Return Tracking</span>
            </Link>
          )}
        </div>
      </div>

      {/* Confirmation Dialog: End Ride */}
      <Dialog open={showEndRideModal} onOpenChange={setShowEndRideModal}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-5 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <RotateCcw className="text-emerald-600" size={18} />
              Confirm Ending Ride
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Ending your ride requires completing the return verification at {booking.campusHub}.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-2 my-2">
            <p className="text-gray-800 font-semibold">Before ending your session:</p>
            <ul className="list-disc pl-4 space-y-1 text-gray-600 text-[11px]">
              <li>Park and lock the vehicle securely at {booking.campusHub}.</li>
              <li>You will be directed to upload a return photo with GPS location evidence.</li>
              <li>The booking remains active until the return photo verification is submitted.</li>
            </ul>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEndRideModal(false)}
              className="py-2 px-3.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
            >
              Keep Riding
            </button>
            <button
              type="button"
              onClick={handleProceedToEndRide}
              className="py-2 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
            >
              Proceed to Return Inspection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Cancel Booking */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-5 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-rose-600" size={18} />
              Cancel Booking Reservation?
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Are you sure you want to cancel booking #{booking.id} for {booking.vehicleName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-800 text-[11px] space-y-1">
              <p className="font-semibold">Cancellation Policy:</p>
              <p>100% full refund is initiated automatically for reservations cancelled prior to pickup.</p>
              <p className="text-rose-900 font-medium">Cancellation cannot be used to return a handed-over vehicle.</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule changed, booked another ride"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="py-2 px-3.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
            >
              Keep Booking
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
