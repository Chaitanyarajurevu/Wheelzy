"use client";

import React, { useState } from "react";
import { XCircle, AlertCircle, Shield, CheckCircle2 } from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RenterCancellationPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";
  const [pendingBookings, setPendingBookings] = useState<StoredBooking[]>(
    dataStore.getRenterBookings(renterId).filter((b) => b.status === "pending" || b.status === "approved")
  );

  const handleCancel = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "cancelled");
    toast.success(`Booking ${booking.id} cancelled. 100% full refund initiated.`);
    setPendingBookings((prev) => prev.filter((b) => b.id !== booking.id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking Cancellation Policy</h1>
        <p className="text-xs text-gray-500 mt-1">
          Cancel reserved rides prior to pickup with zero penalty fees.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Campus Fair Cancellation Policy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">Up to 30 mins before:</span>
            <span className="text-gray-600">100% full refund, no questions asked.</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">Host Cancellation:</span>
            <span className="text-gray-600">Immediate priority re-booking credit granted.</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="font-bold text-emerald-900 block mb-1">Inclement Weather:</span>
            <span className="text-gray-600">Campus storm waivers apply automatically.</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Eligible Bookings for Cancellation</h3>

        {pendingBookings.length > 0 ? (
          pendingBookings.map((b) => (
            <div key={b.id} className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={b.vehicleImage} alt="" className="w-12 h-10 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{b.vehicleName}</h4>
                  <p className="text-[11px] text-gray-500">Scheduled: {b.pickupTime} · ${b.totalCost.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={() => handleCancel(b)}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel Reservation
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-xs text-gray-400">
            No upcoming cancellable bookings at this time.
          </div>
        )}
      </div>
    </div>
  );
}
