"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  Copy,
  Sparkles,
} from "lucide-react";
import { dataStore, VerificationRequest } from "@/lib/dataStore";
import { toast } from "sonner";
import { AdminUserProfileModal } from "@/components/AdminUserProfileModal";

export default function StudentVerificationPage() {
  const [verifs, setVerifs] = useState(dataStore.getVerifications("student_id"));
  const [search, setSearch] = useState("");
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);

  const reload = () => setVerifs(dataStore.getVerifications("student_id"));

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  const handleApprove = (v: VerificationRequest) => {
    dataStore.reviewVerification(v.id, "approved");
    toast.success(`Approved Student & Aadhaar Verification for ${v.userName}`);
    reload();
  };

  const handleReject = (v: VerificationRequest) => {
    dataStore.reviewVerification(v.id, "rejected", "ID card expired or photo blurry");
    toast.error(`Rejected Student Verification for ${v.userName}`);
    reload();
  };

  const filtered = verifs.filter(
    (v) =>
      v.userName.toLowerCase().includes(search.toLowerCase()) ||
      v.campus.toLowerCase().includes(search.toLowerCase()) ||
      v.idNumber.toLowerCase().includes(search.toLowerCase()) ||
      (v.aadhaarNumber && v.aadhaarNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Student ID &amp; Aadhaar Verification</h1>
          <p className="text-xs text-gray-500 mt-1">
            Mandatory enrollment and government Aadhaar verification for college student renters and peer hosts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Pending Queue: {verifs.filter((v) => v.status === "pending").length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student/host name, SID, Aadhaar or campus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <span className="text-xs text-gray-400 hidden sm:inline">
          Showing {filtered.length} verification requests
        </span>
      </div>

      {/* Grid of Student ID & Aadhaar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v) => {
          const userObj = dataStore.getUserById(v.userId);
          const studentProofUrl = v.studentIdUrl || v.documentUrl || "/student_id_proof.svg";
          const aadhaarProofUrl = v.aadhaarUrl || userObj?.aadhaarCardUrl || "/aadhaar_card_proof.svg";
          const aadhaarNum = v.aadhaarNumber || userObj?.aadhaarNumber || "XXXX-XXXX-9021";

          return (
            <div
              key={v.id}
              className="p-5 rounded-3xl bg-white border border-gray-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: User avatar, Name, Role badge, and Status */}
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

                {/* Dual Proof Visual Preview (Student ID and Aadhaar Card) */}
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setProfileModalUserId(v.userId)}
                    className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer aspect-[1.4/1]"
                  >
                    <img src={studentProofUrl} alt="Student ID" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Student ID
                    </span>
                  </div>

                  <div
                    onClick={() => setProfileModalUserId(v.userId)}
                    className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group cursor-pointer aspect-[1.4/1]"
                  >
                    <img src={aadhaarProofUrl} alt="Aadhaar" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Aadhaar Card
                    </span>
                  </div>
                </div>

                {/* Identity Number Details Box */}
                <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Student ID #:</span>
                    <span className="font-mono font-bold text-emerald-950">{v.idNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Aadhaar Card #:</span>
                    <span className="font-mono font-bold text-emerald-950">{aadhaarNum}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Verified Email:</span>
                    <span className="font-mono text-[11px] text-gray-700">{v.userEmail}</span>
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

      {/* Universal User Profile & All Documents Inspector Modal */}
      <AdminUserProfileModal
        isOpen={!!profileModalUserId}
        onClose={() => setProfileModalUserId(null)}
        userId={profileModalUserId}
        onUserUpdated={reload}
      />
    </div>
  );
}
