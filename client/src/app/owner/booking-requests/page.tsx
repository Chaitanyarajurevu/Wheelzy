"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  Check,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Eye,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Car,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { dataStore, StoredBooking, STANDARD_HOURLY_RATE } from "@/lib/dataStore";
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

export default function OwnerBookingRequestsPage() {
  const { user } = useAuth();
  const ownerId = user && user.role === "owner" ? user.id : "usr-owner-marcus";

  const [requests, setRequests] = useState<StoredBooking[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<StoredBooking | null>(null);
  const [inspectedParticipant, setInspectedParticipant] = useState<StudentIdParticipant | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<StoredBooking | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const reload = () => {
    const pending = dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "pending");
    setRequests(pending);
  };

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  const handleInspectKyc = (req: StoredBooking) => {
    const renterUser = dataStore.getUserById(req.renterId);
    setInspectedParticipant({
      name: req.renterName,
      avatar: req.renterAvatar,
      campus: req.renterCampus,
      role: "renter",
      studentIdNumber: req.renterStudentIdNumber || renterUser?.studentIdNumber || "SID-UCB-2024-99214",
      studentIdUrl: req.renterStudentIdUrl || renterUser?.studentIdCardUrl || "/student_id_proof.svg",
      studentVerified: req.renterStudentVerified ?? renterUser?.studentVerified ?? true,
      bookingId: req.id,
      vehicleName: req.vehicleName,
    });
  };

  const handleApprove = (booking: StoredBooking) => {
    const result = dataStore.approveBooking(booking.id);
    if (result.success) {
      toast.success(
        `Booking ${booking.id} approved! Reserved for ${booking.renterName}. It now appears in Active & Confirmed Rides.`
      );
      if (selectedRequest?.id === booking.id) {
        setSelectedRequest(null);
      }
      reload();
    } else {
      toast.error(result.error || "Failed to approve booking request.");
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingBooking) return;
    const result = dataStore.rejectBooking(rejectingBooking.id, rejectReason.trim() || undefined);
    if (result.success) {
      toast.error(`Booking request ${rejectingBooking.id} rejected.`);
      setRejectingBooking(null);
      setRejectReason("");
      if (selectedRequest?.id === rejectingBooking.id) {
        setSelectedRequest(null);
      }
      reload();
    } else {
      toast.error(result.error || "Failed to reject booking request.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
              Reservation Approvals
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Booking Requests
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">
            Review incoming student ride requests, verify campus student IDs, and approve reservations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/owner/active-rides"
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors shadow-2xs"
          >
            View Active Rides
          </Link>
          <span className="text-xs font-black px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
            Pending: {requests.length}
          </span>
        </div>
      </div>

      {/* ── Zero Aadhaar Privacy Assurance Banner ── */}
      <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900">
        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
        <span>
          <strong>Zero Aadhaar Exposure:</strong> In compliance with Wheelzy Student Privacy Standards, student Aadhaar credentials are kept strictly encrypted and concealed from peer hosts.
        </span>
      </div>

      {/* ── Requests List ── */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-white border border-gray-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-3 flex-1">
                {/* Renter Header */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={req.renterAvatar || "/default_avatar.jpg"}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{req.renterName}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ✓ Verified Student
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{req.renterCampus}</p>
                  </div>
                </div>

                {/* Trip & Vehicle Metadata Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Vehicle</span>
                    <strong className="text-gray-900 font-bold truncate block">{req.vehicleName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Campus Hub</span>
                    <strong className="text-emerald-700 font-bold truncate block">{req.campusHub}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Schedule Window</span>
                    <strong className="text-gray-800 font-semibold block">
                      {req.pickupTime} → {req.dropoffTime}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Rental Payout</span>
                    <strong className="text-emerald-700 font-black font-mono block">
                      ₹{req.totalCost || req.durationHours * STANDARD_HOURLY_RATE} ({req.durationHours}h)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View Request, Approve Request, Reject Request */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(req)}
                  className="py-2.5 px-3.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="View full booking request details"
                >
                  <Eye size={14} className="text-gray-500" />
                  <span>View Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRejectingBooking(req)}
                  className="py-2.5 px-3.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X size={14} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(req)}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Check size={14} />
                  <span>Approve Request</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No Pending Requests</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            You have responded to all student reservations. When a student requests your bike or scooter, it will appear here for review.
          </p>
        </div>
      )}

      {/* ── MODAL 1: VIEW REQUEST DETAILS ── */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg rounded-3xl bg-white p-6 sm:p-7 font-sans">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Pending Request #{selectedRequest.id}
                </span>
              </div>
              <DialogTitle className="text-lg font-black text-gray-900 mt-1">
                Booking Request Details
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Review complete renter profile and requested ride itinerary before confirming.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Renter Profile Box */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedRequest.renterAvatar || "/default_avatar.jpg"}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{selectedRequest.renterName}</h4>
                    <p className="text-xs text-gray-500">{selectedRequest.renterCampus}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                      ✓ Student ID Verified
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleInspectKyc(selectedRequest)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <GraduationCap size={13} className="text-emerald-600" />
                  <span>Inspect ID</span>
                </button>
              </div>

              {/* Vehicle & Schedule Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Requested Vehicle</span>
                  <span className="font-bold text-gray-900">{selectedRequest.vehicleName}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Designated Hub</span>
                  <span className="font-bold text-emerald-700">{selectedRequest.campusHub}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Pickup Schedule</span>
                  <span className="font-bold text-gray-900">{selectedRequest.pickupTime}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Mandatory Return Deadline</span>
                  <span className="font-bold text-rose-700">
                    {selectedRequest.mandatoryReturnDeadline || selectedRequest.dropoffTime}
                  </span>
                </div>
              </div>

              {/* Rate & Total Payout */}
              <div className="p-4 bg-[#0A1F1A] text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    Duration & Flat Rate
                  </span>
                  <span className="text-xs text-gray-300">
                    {selectedRequest.durationHours} Hours · ₹{STANDARD_HOURLY_RATE}/hr
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Payout</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    ₹{selectedRequest.totalCost || selectedRequest.durationHours * STANDARD_HOURLY_RATE}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                Approving this request reserves the vehicle time slot and notifies the renter. The rental will appear in your <strong>Active Rides</strong> dashboard when in progress.
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectingBooking(selectedRequest);
                }}
                className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedRequest)}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Approve Request</span>
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 2: REJECT CONFIRMATION ── */}
      {rejectingBooking && (
        <Dialog open={!!rejectingBooking} onOpenChange={() => setRejectingBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>Decline Booking Request?</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Are you sure you want to decline the reservation for <strong>{rejectingBooking.renterName}</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              <label className="text-xs font-bold text-gray-700 block">
                Decline Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Personal emergency, vehicle undergoing maintenance..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingBooking(null)}
                className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Decline
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 3: STUDENT ID PROOF PREVIEW (ZERO AADHAAR) ── */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectedParticipant)}
        onClose={() => setInspectedParticipant(null)}
        participant={inspectedParticipant}
      />
    </div>
  );
}
