"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, MapPin, ShieldCheck, ArrowLeft, ArrowRight, Check, Clock, CalendarDays, AlertTriangle } from "lucide-react";
import { dataStore, STANDARD_HOURLY_RATE, calculateRentalAmount, getVehicleDurationHours } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function VehicleDetailsPage() {
  const { user } = useAuth();
  const vehicles = dataStore.getVehicles();
  const [selectedVehicle] = useState(vehicles[0]);

  const duration = getVehicleDurationHours(selectedVehicle);
  const totalCost = calculateRentalAmount(duration);

  const handleBook = () => {
    if (!user) {
      toast.error("Please login to request a booking");
      return;
    }
    dataStore.createBooking({
      vehicle: selectedVehicle,
      renter: user,
      pickupTime: selectedVehicle.availableFrom || "Today, 9:00 AM",
      dropoffTime: selectedVehicle.mustReturnBy || "Today, 12:00 PM",
      durationHours: duration,
      campusHub: selectedVehicle.locationHub,
      mandatoryReturnDeadline: selectedVehicle.mustReturnBy,
    });
    toast.success(
      `Booking request submitted for ${selectedVehicle.name}! Duration: ${duration}h • Total: ₹${totalCost}.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans">
      <div className="flex items-center gap-3">
        <Link
          href="/renter/browse"
          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vehicle Specifications & Handover Hub</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified hardware details, campus pickup zones, and owner-defined rental schedule.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="h-72 w-full bg-gray-100 relative">
            <img src={selectedVehicle.imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-emerald-900 shadow-sm border border-emerald-100">
              ₹{STANDARD_HOURLY_RATE}/hr
            </div>
            <div className="absolute top-4 left-4 bg-[#0A1F1A]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold uppercase tracking-wider">
              {selectedVehicle.vehicleType}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedVehicle.name}</h2>
                <p className="text-xs text-gray-500">{selectedVehicle.model}</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star size={14} className="fill-amber-400" />
                <span>{selectedVehicle.rating}</span>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Authorized Quad Hub:</span>
                <span className="font-bold text-emerald-900">{selectedVehicle.locationHub}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle Type:</span>
                <span className="font-semibold text-gray-800">{selectedVehicle.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Verified Host:</span>
                <span className="font-semibold text-gray-800">{selectedVehicle.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rental Rate:</span>
                <span className="font-bold text-emerald-800">₹{STANDARD_HOURLY_RATE}/hour (Fixed)</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-700 mb-2">Included Safety & Security Equipment</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedVehicle.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                    <Check size={12} className="text-emerald-600" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Owner-Defined Reservation</h3>
            <p className="text-xs text-gray-500">
              The rental period and duration are set by host {selectedVehicle.ownerName}.
            </p>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-emerald-700" />
                  <span>Rental Duration:</span>
                </span>
                <span className="font-black text-emerald-950">
                  {duration} {duration === 1 ? "Hour" : "Hours"}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Hourly Rate:</span>
                <span className="font-bold text-gray-800">₹{STANDARD_HOURLY_RATE}/hr</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1 border-t border-emerald-100">
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} className="text-emerald-700" />
                  <span>Available From:</span>
                </span>
                <span className="font-semibold text-gray-800">
                  {selectedVehicle.availableFrom || "Today, 9:00 AM"}
                </span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span className="flex items-center gap-1 font-semibold">
                  <AlertTriangle size={12} className="text-rose-600" />
                  <span>Must Return By:</span>
                </span>
                <span className="font-black">
                  {selectedVehicle.mustReturnBy || "Today, 12:00 PM"}
                </span>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-2 text-emerald-900 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-base font-black">₹{totalCost}</span>
              </div>
            </div>

            <button
              onClick={handleBook}
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Confirm Booking (₹{totalCost})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-[#052e16] text-white rounded-3xl p-6 shadow-md space-y-2 text-xs">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Campus Safety Guarantee
            </h4>
            <p className="text-emerald-200 text-[11px] leading-relaxed">
              Every vehicle on Wheelzy undergoes mandatory student RC validation and pre-ride brake inspection before release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
