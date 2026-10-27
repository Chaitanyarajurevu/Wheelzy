"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  GraduationCap,
  Eye,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export interface StudentIdParticipant {
  name: string;
  avatar?: string;
  campus: string;
  role: "renter" | "owner";
  studentIdNumber?: string;
  studentIdUrl?: string;
  studentVerified?: boolean;
  bookingId?: string;
  vehicleName?: string;
}

interface StudentIdPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: StudentIdParticipant | null;
}

export function StudentIdPreviewModal({
  isOpen,
  onClose,
  participant,
}: StudentIdPreviewModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fullscreenDoc, setFullscreenDoc] = useState<string | null>(null);

  if (!isOpen || !participant) return null;

  const studentIdNumber = participant.studentIdNumber || "SID-UCB-2024-99214";
  const studentIdUrl = participant.studentIdUrl || "/student_id_proof.svg";
  const isVerified = participant.studentVerified ?? true;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Dialog Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] font-sans">
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#04241B] via-[#063B2C] to-[#04241B] text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 overflow-hidden flex items-center justify-center text-emerald-300 font-bold shrink-0">
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {participant.name}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  {participant.role === "renter" ? "🎓 Student Renter" : "🚲 Vehicle Host"}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {participant.campus}{" "}
                {participant.vehicleName ? `• ${participant.vehicleName}` : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="Close dialog"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Pill Bar */}
        <div className="px-5 sm:px-6 py-3 bg-gray-50 border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Student Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock size={13} className="text-amber-600" />
                <span>Verification Pending</span>
              </span>
            )}
            <span className="text-xs text-gray-500 hidden sm:inline">
              University Campus Honor System
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Lock size={12} className="text-emerald-700" />
            <span>Strict Privacy: Student ID Only</span>
          </div>
        </div>

        {/* Scrollable Document Display Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Student ID Number Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Official College Student ID Number
              </span>
              <span className="text-sm font-mono font-black text-gray-900">
                {studentIdNumber}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(studentIdNumber, "Student ID Number")}
              className="p-2 rounded-xl hover:bg-emerald-100/70 text-gray-600 hover:text-emerald-800 transition-colors"
              title="Copy Student ID"
            >
              {copiedField === "Student ID Number" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* College Student ID Card Proof View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>College Student ID Proof Card</span>
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                CAMPUS ENROLLED ✓
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm group bg-[#022C22] p-2">
              <img
                src={studentIdUrl}
                alt="Student ID Proof"
                className="w-full h-auto max-h-[360px] object-contain mx-auto rounded-xl"
              />
              <button
                onClick={() => setFullscreenDoc(studentIdUrl)}
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Enlarge Student ID</span>
              </button>
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-gray-800">
                Wheelzy Peer-to-Peer Identity Privacy
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                To guarantee student privacy, only verified university student ID proofs are visible between rental participants. Government documents (Aadhaar) and personal phone numbers are strictly protected and never revealed to peer participants.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Close Student ID Preview
          </button>
        </div>
      </div>

      {/* Fullscreen Document Zoom Modal */}
      {fullscreenDoc && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setFullscreenDoc(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenDoc}
              alt="Student ID Document Zoom"
              className="w-full h-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setFullscreenDoc(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
              aria-label="Close zoom"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Backward-compatible alias for existing imports
export type InspectedRenter = StudentIdParticipant;
export const RenterIdInspectionModal = function RenterIdInspectionModalWrapper({
  isOpen,
  onClose,
  renter,
}: {
  isOpen: boolean;
  onClose: () => void;
  renter: StudentIdParticipant | null;
}) {
  return (
    <StudentIdPreviewModal
      isOpen={isOpen}
      onClose={onClose}
      participant={renter ? { ...renter, role: "renter" } : null}
    />
  );
};
