"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { dataStore, VerificationRequest } from "@/lib/dataStore";
import { toast } from "sonner";
import { AdminUserProfileModal } from "@/components/AdminUserProfileModal";

export default function LicenseVerificationPage() {
  const [verifs, setVerifs] = useState(dataStore.getVerifications("driving_license"));
  const [search, setSearch] = useState("");
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

  const reload = () => setVerifs(dataStore.getVerifications("driving_license"));

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  const handleApprove = (v: VerificationRequest) => {
    dataStore.reviewVerification(v.id, "approved");
    toast.success(`Approved Driving License & KYC for ${v.userName}`);
    reload();
  };

  const handleReject = (v: VerificationRequest) => {
    dataStore.reviewVerification(v.id, "rejected", "License expired or state DMV mismatch.");
    toast.error(`Rejected Driving License for ${v.userName}`);
    reload();
  };

  const filtered = verifs.filter(
    (v) =>
      v.userName.toLowerCase().includes(search.toLowerCase()) ||
      v.campus.toLowerCase().includes(search.toLowerCase()) ||
      v.idNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Driving License Verification</h1>
          <p className="text-xs text-gray-500 mt-1">
            Mandatory DMV license verification for motorized scooter and motorcycle rentals, bound to student ID and Aadhaar proofs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Pending Queue: {verifs.filter((v) => v.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Search and count bar */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by driver name, DL number, campus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <span className="text-xs text-gray-400 hidden sm:inline">
          Showing {filtered.length} license requests
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v) => {
          const userObj = dataStore.getUserById(v.userId);
          const dlProofUrl = v.drivingLicenseUrl || v.documentUrl || "/driving_license_proof.svg";
          const studentProofUrl = v.studentIdUrl || userObj?.studentIdCardUrl || "/student_id_proof.svg";
          const aadhaarProofUrl = v.aadhaarUrl || userObj?.aadhaarCardUrl || "/aadhaar_card_proof.svg";

          return (
            <div
              key={v.id}
              className="p-5 rounded-3xl bg-white border border-gray-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* User Info Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.userAvatar}
                      alt=""
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-gray-900">{v.userName}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                          {v.userRole || userObj?.role || "RENTER"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{v.campus}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : v.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {v.status.toUpperCase()}
                  </span>
                </div>

                {/* Primary Driving License Image Preview */}
                <div
                  onClick={() => setProfileModalUserId(v.userId)}
                  className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer aspect-[1.58/1]"
                >
                  <img
                    src={dlProofUrl}
                    alt="Driver License"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                    <Eye size={14} /> Click to Inspect License
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">DMV License #:</span>
                    <span className="font-mono font-bold text-emerald-950">{v.idNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Class:</span>
                    <span className="font-bold text-gray-800">MCWG / LMV (Motor Scooter)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Associated Student ID:</span>
                    <span className="font-mono text-gray-800">{v.studentIdNumber || userObj?.studentIdNumber || "SID-STAN-4481"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Aadhaar Card:</span>
                    <span className="font-mono text-emerald-800 font-bold">{v.aadhaarNumber || userObj?.aadhaarNumber || "XXXX-XXXX-1144"} ✓</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProfileModalUserId(v.userId)}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Inspect Profile &amp; All Documents</span>
                </button>

                {v.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(v)}
                      className="flex-1 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <X size={13} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(v)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold hover:from-emerald-700 hover:to-green-700 shadow-sm flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Approve</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-1 text-xs text-gray-400 font-medium">
                    Reviewed · Status: <span className="font-bold capitalize text-emerald-700">{v.status}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Modal */}
      <AdminUserProfileModal
        isOpen={!!profileModalUserId}
        onClose={() => setProfileModalUserId(null)}
        userId={profileModalUserId}
        onUserUpdated={reload}
      />
    </div>
  );
}
