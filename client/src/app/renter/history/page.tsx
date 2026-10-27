"use client";

import React, { useState } from "react";
import { History, Download, Star, MapPin, CheckCircle2 } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RenterHistoryPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";
  const pastBookings = dataStore
    .getRenterBookings(renterId)
    .filter((b) => b.status === "completed" || b.status === "returned");

  const handleDownloadReceipt = (id: string) => {
    toast.success(`Digital receipt for ${id} generated!`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking History</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review your past campus bike and scooter rentals, download receipts, and rate hosts.
        </p>
      </div>

      <div className="space-y-4">
        {pastBookings.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <img src={b.vehicleImage} alt="" className="w-16 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">{b.vehicleName}</h3>
                <p className="text-xs text-gray-500">{b.campusHub} · {b.pickupTime}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Host: {b.ownerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-between sm:justify-end">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900">${b.totalCost.toFixed(2)}</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  COMPLETED
                </span>
              </div>

              <button
                onClick={() => handleDownloadReceipt(b.id)}
                className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Receipt</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
