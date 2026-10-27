"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Filter,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { ActiveRideCard } from "@/components/ActiveRideCard";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";
import { InPlatformCallModal } from "@/components/InPlatformCallModal";

export default function OwnerActiveRidesPage() {
  const { user } = useAuth();
  const ownerId = user && user.role === "owner" ? user.id : "usr-owner-marcus";

  const [filterTab, setFilterTab] = useState<"active" | "all" | "returned">("active");
  const [allOwnerBookings, setAllOwnerBookings] = useState<StoredBooking[]>(
    dataStore.getOwnerBookings(ownerId)
  );

  // Calling & Inspection Modals
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);

  const reload = () => {
    setAllOwnerBookings(dataStore.getOwnerBookings(ownerId));
  };

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  const activeRides = allOwnerBookings.filter((b) => b.status === "active");
  const returnedRides = allOwnerBookings.filter(
    (b) => b.status === "returned" || b.status === "completed"
  );

  const displayRides =
    filterTab === "active"
      ? activeRides
      : filterTab === "returned"
      ? returnedRides
      : allOwnerBookings;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Fleet Live Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Active Rides Control Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
            Live campus ride tracking with verified student ID inspection and encrypted in-platform calling. Mobile numbers remain strictly confidential.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/owner/dashboard"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>
          <span className="px-3 py-2 rounded-xl bg-emerald-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-800">
            {activeRides.length} Active On-Campus
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterTab === "active"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Zap size={14} className={filterTab === "active" ? "text-emerald-300 fill-emerald-300/40" : ""} />
            <span>Live Active ({activeRides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("returned")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterTab === "returned"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Returned ({returnedRides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              filterTab === "all"
                ? "bg-[#064E3B] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>All Bookings ({allOwnerBookings.length})</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Peer Privacy Guaranteed</span>
        </div>
      </div>

      {/* Active Rides List */}
      {displayRides.length > 0 ? (
        <div className="space-y-6">
          {displayRides.map((booking) => (
            <ActiveRideCard
              key={booking.id}
              booking={booking}
              viewerRole="owner"
              onInitiateCall={(b) => setCallModalBooking(b)}
              onViewStudentId={(participant) => setInspectParticipant(participant)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Zap size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {filterTab === "active" ? "No Active Rides Right Now" : "No Bookings Found"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {filterTab === "active"
              ? "All your campus vehicles are currently parked at hubs or pending student checkouts."
              : "No reservation matches this filter."}
          </p>
        </div>
      )}

      {/* In-Platform Calling Modal */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="owner"
      />

      {/* Privacy-Preserving Student ID Preview Modal (Zero Aadhaar) */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}
