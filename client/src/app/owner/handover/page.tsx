"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HandshakeIcon, Key, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";

export default function OwnerHandoverPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";
  const activeRentals = dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "active");

  const [inspectedParticipant, setInspectedParticipant] = useState<StudentIdParticipant | null>(null);

  const handleInspectKyc = (b: StoredBooking) => {
    const renterUser = dataStore.getUserById(b.renterId);
    setInspectedParticipant({
      name: b.renterName,
      avatar: b.renterAvatar,
      campus: b.renterCampus,
      role: "renter",
      studentIdNumber: b.renterStudentIdNumber || renterUser?.studentIdNumber || "SID-UCB-2024-99214",
      studentIdUrl: b.renterStudentIdUrl || renterUser?.studentIdCardUrl || "/student_id_proof.svg",
      studentVerified: b.renterStudentVerified ?? renterUser?.studentVerified ?? true,
      bookingId: b.id,
      vehicleName: b.vehicleName,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Digital Handover Protocol</h1>
        <p className="text-xs text-gray-500 mt-1">
          Campus secure lock procedures, smart unlock codes, and safe drop-off guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Key size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">1. Digital Smart Lock Passcodes</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            When you accept a student reservation, a dynamic 4-character one-time passcode (e.g. <strong className="text-emerald-700 font-mono">WHZ-9281</strong>) is generated. The renter enters this code to open the physical lock box.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">2. Geofenced Quad Hub Returns</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Renters must take and upload a return photo at the designated campus quad hub before billing terminates. The GPS coordinates and photo timestamp are verified automatically.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Current Live Handovers ({activeRentals.length})</h3>
        {activeRentals.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-900">{r.vehicleName} · {r.renterName}</p>
              <p className="text-[11px] text-gray-500">Pickup Hub: {r.campusHub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                Code: {r.digitalUnlockCode || "WHZ-9281"}
              </span>
              <button
                type="button"
                onClick={() => handleInspectKyc(r)}
                className="text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>Verify Student ID</span>
              </button>
              <Link
                href="/owner/active-rides"
                className="text-xs font-bold text-emerald-700 hover:underline px-2 py-1"
              >
                Track Live
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Student ID Proof Preview Modal (Zero Aadhaar) */}
      <StudentIdPreviewModal
        isOpen={Boolean(inspectedParticipant)}
        onClose={() => setInspectedParticipant(null)}
        participant={inspectedParticipant}
      />
    </div>
  );
}
