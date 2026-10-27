"use client";

import React, { useState, useEffect } from "react";
import { Inbox, Check, X, CheckCircle2, Clock, MapPin, UserCheck, ShieldCheck } from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";

export default function OwnerBookingRequestsPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";
  const [requests, setRequests] = useState<StoredBooking[]>(
    dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "pending")
  );

  const [inspectedParticipant, setInspectedParticipant] = useState<StudentIdParticipant | null>(null);

  const reload = () => {
    setRequests(dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "pending"));
  };

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

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  const handleAccept = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "active");
    toast.success(`Booking ${booking.id} accepted! Ride is active on campus.`);
    reload();
  };

  const handleReject = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "cancelled");
    toast.error(`Booking request ${booking.id} declined.`);
    reload();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking Requests</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review and approve pending student reservations for your campus fleet.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          Pending: {requests.length}
        </span>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-white border border-gray-100 hover:border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3.5">
                  <img src={req.renterAvatar} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-100" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{req.renterName}</h3>
                    <p className="text-xs text-gray-500">{req.renterCampus}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
                  <div>
                    <span className="text-gray-400">Ride:</span>{" "}
                    <strong className="text-gray-900">{req.vehicleName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Hub:</span>{" "}
                    <strong className="text-emerald-700">{req.campusHub}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Time Slot:</span>{" "}
                    <strong className="text-gray-800">{req.pickupTime} – {req.dropoffTime} ({req.durationHours} hrs)</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Payout:</span>{" "}
                    <strong className="text-emerald-700 font-bold">${req.totalCost.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInspectKyc(req)}
                  className="py-2.5 px-3.5 rounded-xl border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Inspect College Student ID Proof"
                >
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>View Student ID</span>
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="py-2.5 px-3.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(req)}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check size={14} />
                  <span>Accept Booking</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Pending Requests</h3>
          <p className="text-xs text-gray-500 mt-1">
            You have responded to all student reservations. New requests will appear here instantly.
          </p>
        </div>
      )}

      {/* Student ID Proof Preview Modal (Privacy-First) */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectedParticipant)}
        onClose={() => setInspectedParticipant(null)}
        participant={inspectedParticipant}
      />
    </div>
  );
}
