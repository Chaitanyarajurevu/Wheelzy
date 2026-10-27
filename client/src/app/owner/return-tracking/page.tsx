"use client";

import React, { useState, useEffect } from "react";
import { RotateCcw, Check, CheckCircle2, Eye, ShieldCheck, MapPin, Camera } from "lucide-react";
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

export default function OwnerReturnTrackingPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";

  const [returnedBookings, setReturnedBookings] = useState<StoredBooking[]>(
    dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "returned")
  );
  const [completedBookings, setCompletedBookings] = useState<StoredBooking[]>(
    dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "completed")
  );
  const [selectedPhoto, setSelectedPhoto] = useState<StoredBooking | null>(null);

  const reload = () => {
    setReturnedBookings(dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "returned"));
    setCompletedBookings(dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "completed"));
  };

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  const handleApproveReturn = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "completed");
    toast.success(`Return verified for ${booking.vehicleName}. Vehicle is back in service!`);
    setSelectedPhoto(null);
    reload();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Return Photo Tracking</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review student-submitted parking photos, lock verification timestamps, and approve completed handovers.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          Pending Inspection: {returnedBookings.length}
        </span>
      </div>

      {/* Pending Return Inspections */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-900">Awaiting Host Inspection</h2>

        {returnedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {returnedBookings.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-md shadow-emerald-900/5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                    RETURN PHOTO READY
                  </span>
                  <span className="text-xs font-mono text-gray-400">{b.id}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">{b.vehicleName}</h3>
                  <p className="text-xs text-gray-500">Returned by {b.renterName} at {b.campusHub}</p>
                </div>

                {b.returnPhotoUrl && (
                  <div className="rounded-2xl overflow-hidden border border-emerald-100 relative group cursor-pointer" onClick={() => setSelectedPhoto(b)}>
                    <img src={b.returnPhotoUrl} alt="" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye size={16} /> Click to Inspect
                    </div>
                  </div>
                )}

                {b.returnNotes && (
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/60 text-xs text-gray-700 italic">
                    &quot;{b.returnNotes}&quot;
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedPhoto(b)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApproveReturn(b)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Confirm Return</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-gray-100 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-800">All Student Returns Verified</p>
            <p className="text-[11px] text-gray-400 mt-0.5">When students finish a ride and upload photos, they appear here.</p>
          </div>
        )}
      </div>

      {/* Previously Completed Handover History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-gray-900">Completed Return History</h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {completedBookings.map((cb) => (
            <div key={cb.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={cb.vehicleImage} alt="" className="w-10 h-8 rounded-lg object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{cb.vehicleName}</h4>
                  <p className="text-[11px] text-gray-500">Rented by {cb.renterName} · {cb.pickupTime}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Inspected & Payout Released (${cb.totalCost.toFixed(2)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Large Photo Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Return Photo Verification
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {selectedPhoto.vehicleName} · {selectedPhoto.campusHub}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
                <img src={selectedPhoto.returnPhotoUrl} alt="" className="w-full max-h-80 object-contain" />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <p><strong>Renter:</strong> {selectedPhoto.renterName}</p>
                <p><strong>Hub Dropoff:</strong> {selectedPhoto.campusHub}</p>
                <p><strong>Student Note:</strong> {selectedPhoto.returnNotes}</p>
                <p className="font-mono text-[10px] text-gray-500">{selectedPhoto.returnPhotoMinioKey}</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => handleApproveReturn(selectedPhoto)}
                className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
              >
                Approve & Mark Completed
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
