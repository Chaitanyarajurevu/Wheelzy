"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Activity,
  Clock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Key,
  MapPin,
  Phone,
  GraduationCap,
  Zap,
} from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { ActiveRideCard } from "@/components/ActiveRideCard";
import { InPlatformCallModal } from "@/components/InPlatformCallModal";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";

export default function RenterBookingsPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";
  const [bookings, setBookings] = useState<StoredBooking[]>(dataStore.getRenterBookings(renterId));

  // Modals
  const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);
  const [inspectParticipant, setInspectParticipant] = useState<StudentIdParticipant | null>(null);

  const reload = () => setBookings(dataStore.getRenterBookings(renterId));

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [renterId]);

  const activeBookings = bookings.filter((b) => b.status === "active");
  const otherBookings = bookings.filter((b) => b.status !== "active");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            My Bookings &amp; Live Trip Status
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track active rides, smart unlock passcodes, in-platform voice communication, and return photo receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeBookings.length > 0 && (
            <Link
              href="/renter/active-rides"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-sm flex items-center gap-2"
            >
              <Zap size={14} className="animate-pulse" />
              <span>Active Ride Controls</span>
            </Link>
          )}
          <Link
            href="/renter/return"
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs shadow-2xs flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Return Hub</span>
          </Link>
        </div>
      </div>

      {/* ACTIVE RIDES (FEATURED PROMINENTLY) */}
      {activeBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Current Active Trip ({activeBookings.length})</span>
          </div>

          <div className="space-y-4">
            {activeBookings.map((b) => (
              <ActiveRideCard
                key={b.id}
                booking={b}
                viewerRole="renter"
                onInitiateCall={(item) => setCallModalBooking(item)}
                onViewStudentId={(participant) => setInspectParticipant(participant)}
              />
            ))}
          </div>
        </div>
      )}

      {/* OTHER BOOKINGS (CONFIRMED / COMPLETED / RETURNED) */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Booking Records &amp; History ({otherBookings.length})
        </h2>

        <div className="space-y-4">
          {otherBookings.map((b) => (
            <ActiveRideCard
              key={b.id}
              booking={b}
              viewerRole="renter"
              onInitiateCall={(item) => setCallModalBooking(item)}
              onViewStudentId={(participant) => setInspectParticipant(participant)}
            />
          ))}
        </div>
      </div>

      {/* In-Platform Voice Calling Modal */}
      <InPlatformCallModal
        isOpen={Boolean(callModalBooking)}
        onClose={() => setCallModalBooking(null)}
        booking={callModalBooking}
        callerRole="renter"
      />

      {/* Host Student ID Preview Modal */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectParticipant)}
        onClose={() => setInspectParticipant(null)}
        participant={inspectParticipant}
      />
    </div>
  );
}
