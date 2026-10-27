"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle, Star, MapPin, Shield, Zap, X, Clock, Calendar, Check, AlertCircle } from "lucide-react";
import { Vehicle } from "@/data/mockVehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
  onBook: (vehicle: Vehicle) => void;
  onViewDetails: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onBook, onViewDetails }: VehicleCardProps) {
  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <Image
          src={vehicle.imageUrl}
          alt={vehicle.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Verified Student Owner Badge (Overlaid on top left matching reference) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
          <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>Verified Student Owner</span>
        </div>

        {/* Category Pill on top right */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white uppercase tracking-wider">
          {vehicle.category}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Vehicle Name and Owner Avatar */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] leading-snug group-hover:text-[#064E3B] transition-colors">
                {vehicle.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{vehicle.model}</p>
            </div>

            {/* Small Owner Avatar */}
            <div className="relative shrink-0" title={`Owned by ${vehicle.owner.name} (${vehicle.owner.college})`}>
              <div className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 overflow-hidden relative shadow-sm">
                <Image
                  src={vehicle.owner.avatarUrl}
                  alt={vehicle.owner.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          </div>

          {/* Location & Rating meta */}
          <div className="mt-3 flex items-center gap-3 text-xs text-[#64748B]">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {vehicle.distance}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-gray-900">{vehicle.rating}</span>
              <span className="text-gray-400 font-normal">({vehicle.reviewCount} reviews)</span>
            </span>
          </div>

          {/* Feature chips */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {vehicle.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100/80 px-2 py-0.5 rounded-md"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing and Action Button */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                ${vehicle.hourlyPrice.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-gray-500">/hr</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Instant campus unlock</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(vehicle)}
              className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onBook(vehicle)}
              className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#043D2F] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/10 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal for viewing vehicle details & fast booking confirmation
export function VehicleBookingModal({
  vehicle,
  isOpen,
  onClose,
  initialMode = "details",
}: {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "details" | "book";
}) {
  const [mode, setMode] = useState<"details" | "book" | "confirmed">(initialMode);
  const [durationHours, setDurationHours] = useState(3);
  const [pickupTime, setPickupTime] = useState("Today, 2:00 PM");

  if (!isOpen || !vehicle) return null;

  const totalCost = (vehicle.hourlyPrice * durationHours).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="relative aspect-[16/9] w-full bg-gray-100">
          <Image src={vehicle.imageUrl} alt={vehicle.name} fill className="object-cover" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow">
            {vehicle.campus} · {vehicle.distance}
          </div>
        </div>

        <div className="p-6">
          {mode === "confirmed" ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Ride Reserved!</h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                You reserved <span className="font-semibold">{vehicle.name}</span> for {durationHours} hours (${totalCost}).
                Owner <span className="font-semibold">{vehicle.owner.name}</span> will meet you at the campus hub.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#064E3B] text-white font-semibold rounded-xl text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : mode === "book" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
                  <p className="text-xs text-gray-500">{vehicle.name} · {vehicle.category}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-800">${vehicle.hourlyPrice}/hr</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Pick-up Location</span>
                  <span className="font-semibold text-gray-800">{vehicle.campus} Student Hub</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Duration</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDurationHours(Math.max(1, durationHours - 1))}
                      className="w-6 h-6 rounded bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-900">{durationHours} hrs</span>
                    <button
                      onClick={() => setDurationHours(durationHours + 1)}
                      className="w-6 h-6 rounded bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total Estimate</span>
                  <span className="text-lg font-black text-emerald-700">${totalCost}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>Protected by Wheelzy Student Guarantee. Full photo return inspection check included.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode("details")}
                  className="flex-1 py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setMode("confirmed")}
                  className="flex-1 py-3 text-sm font-bold bg-[#064E3B] hover:bg-[#043D2F] text-white rounded-xl shadow"
                >
                  Confirm & Reserve
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{vehicle.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{vehicle.model}</p>
              </div>

              {/* Owner info card */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0">
                  <Image src={vehicle.owner.avatarUrl} alt={vehicle.owner.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{vehicle.owner.name}</span>
                    <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      ✓ Student Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{vehicle.owner.college}</p>
                </div>
              </div>

              {/* Specs */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Features Included</h4>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-2xl font-black text-gray-900">${vehicle.hourlyPrice.toFixed(2)}</span>
                  <span className="text-xs text-gray-500 font-semibold"> / hour</span>
                </div>
                <button
                  onClick={() => setMode("book")}
                  className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#043D2F] text-white font-bold rounded-xl text-sm shadow hover:shadow-lg transition-all"
                >
                  Proceed to Book
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
