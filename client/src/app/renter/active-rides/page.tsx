"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  ArrowLeft,
  Camera,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { ActiveRideCard } from "@/components/ActiveRideCard";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";
import { InPlatformCallModal } from "@/components/InPlatformCallModal";

export default function RenterActiveRidesPage() {
  const { user } = useAuth();
  const renterId = user && user.role === "renter" ? user.id : "usr-renter-priya";

  const [allRenterBookings, setAllRenterBookings] = useState<StoredBooking[]>(
    dataStore.getRenterBookings(renterId)
  );

  // Calling & Inspection Modals
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);

  const reload = () => {
    setAllRenterBookings(dataStore.getRenterBookings(renterId));
  };

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [renterId]);

  const activeRides = allRenterBookings.filter((b) => b.status === "active");
  const pastRides = allRenterBookings.filter(
    (b) => b.status === "returned" || b.status === "completed"
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Active Trip Navigation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            My Active Ride
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
            Live ride controls, remaining session timer, encrypted in-platform host voice calling, and quad return verification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/renter/dashboard"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>
          {activeRides.length > 0 && (
            <Link
              href="/renter/return"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center gap-2"
            >
              <Camera size={14} />
              <span>Return Vehicle</span>
            </Link>
          )}
        </div>
      </div>

      {/* SECTION 1: LIVE ACTIVE RIDES */}
      {activeRides.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <Zap size={16} className="text-emerald-600 fill-emerald-500" />
              <span>Current Ride in Session ({activeRides.length})</span>
            </h2>
            <span className="text-xs text-gray-500">
              Calling available during active rental session
            </span>
          </div>

          <div className="space-y-6">
            {activeRides.map((booking) => (
              <ActiveRideCard
                key={booking.id}
                booking={booking}
                viewerRole="renter"
                onInitiateCall={(b) => setCallModalBooking(b)}
                onViewStudentId={(participant) => setInspectParticipant(participant)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-100 p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Zap size={30} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-900">
              No Active Ride in Progress
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              You don&apos;t have any live rentals checked out right now. Find an electric scooter or campus bicycle nearby to get moving!
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/renter/browse"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 flex items-center gap-2"
            >
              <Compass size={14} />
              <span>Browse Campus Fleet</span>
            </Link>
            <Link
              href="/renter/booking"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs"
            >
              All My Bookings
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 2: RECENTLY RETURNED RIDES */}
      {pastRides.length > 0 && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Recently Returned Rides</span>
            </h3>
            <span className="text-xs text-gray-400">
              Calling disabled after vehicle return
            </span>
          </div>

          <div className="space-y-4">
            {pastRides.slice(0, 3).map((booking) => (
              <ActiveRideCard
                key={booking.id}
                booking={booking}
                viewerRole="renter"
                onInitiateCall={(b) => setCallModalBooking(b)}
                onViewStudentId={(participant) => setInspectParticipant(participant)}
              />
            ))}
          </div>
        </div>
      )}

      {/* In-Platform Calling Modal (Call Owner) */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="renter"
      />

      {/* Host Student ID Preview Modal (Zero Aadhaar) */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}
