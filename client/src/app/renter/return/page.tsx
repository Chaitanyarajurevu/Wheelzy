"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Camera, Upload, CheckCircle2, MapPin, Key, ShieldCheck, AlertCircle } from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

export default function RenterReturnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";

  const [activeBookings, setActiveBookings] = useState<StoredBooking[]>(
    dataStore.getRenterBookings(renterId).filter((b) => b.status === "active")
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [returnNotes, setReturnNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState("/card_return.jpg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const list = dataStore.getRenterBookings(renterId).filter((b) => b.status === "active");
    setActiveBookings(list);
    if (list.length > 0 && !selectedBookingId) {
      setSelectedBookingId(list[0].id);
    }
  }, [renterId, selectedBookingId]);

  const activeBooking = activeBookings.find((b) => b.id === selectedBookingId) || activeBookings[0];

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) {
      toast.error("No active booking selected");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const minioKey = `minio://wheelzy-media/returns/ret_${activeBooking.id.toLowerCase()}_${Date.now()}.webp`;

      // Uploading return photo updates status to RETURNED
      dataStore.submitReturnPhoto(
        activeBooking.id,
        photoPreview,
        returnNotes || "Vehicle safely parked and locked at campus hub.",
        minioKey
      );

      setIsSubmitting(false);
      setIsDone(true);
      toast.success("Return photo uploaded to MinIO! Status changed to RETURNED.");
    }, 700);
  };

  if (isDone) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Vehicle Return Submitted!</h2>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
          Your return photo has been cryptographically logged in MinIO object storage. The vehicle owner has been notified to inspect and confirm the return.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/renter/booking"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-md"
          >
            View Booking Status
          </Link>
          <Link
            href="/renter/dashboard"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Return Vehicle & Upload Photo</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Per platform rules, uploading a verified return photo safely locks the ride and marks the booking as <span className="font-bold text-emerald-700">RETURNED</span>.
        </p>
      </div>

      {activeBooking ? (
        <form onSubmit={handleReturn} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Active Booking Summary */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={activeBooking.vehicleImage} alt="" className="w-14 h-11 rounded-xl object-cover" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">{activeBooking.vehicleName}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{activeBooking.campusHub}</p>
                <p className="text-[11px] text-gray-500">Host: {activeBooking.ownerName}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
              <p className="text-xs font-mono font-bold text-emerald-900 mt-1">{activeBooking.id}</p>
            </div>
          </div>

          {/* Photo Preview & Upload Box */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. Take / Attach Return Photo at Hub
            </label>

            <div className="rounded-2xl overflow-hidden border-2 border-dashed border-emerald-200 p-2 bg-gray-50 text-center relative group">
              <img src={photoPreview} alt="Return photo preview" className="w-full max-h-64 object-cover rounded-xl" />
              <div className="p-3 text-xs text-gray-500 flex items-center justify-center gap-2">
                <Camera size={16} className="text-emerald-600" />
                <span>Vehicle parked at authorized rack with U-Lock secured.</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">MinIO Key Destination:</span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 truncate">
                minio://wheelzy-media/returns/ret_{activeBooking.id.toLowerCase()}.webp
              </span>
            </div>
          </div>

          {/* Parking Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              2. Campus Hub Notes & Lock Confirmation
            </label>
            <textarea
              rows={3}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Parked in Bay B bike stall. Helmet safely returned to underseat storage compartment."
              className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Upload size={16} />
            <span>{isSubmitting ? "Uploading to MinIO..." : "Submit Photo & End Ride (Set to RETURNED)"}</span>
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Active Ride Found</h3>
          <p className="text-xs text-gray-500">
            You do not currently have any checked-out vehicles to return.
          </p>
          <div className="pt-2">
            <Link
              href="/renter/browse"
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
            >
              Browse Campus Rides
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
