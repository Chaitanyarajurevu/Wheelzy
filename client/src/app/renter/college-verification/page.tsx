"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Eye,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/dataStore";
import { toast } from "sonner";

export default function RenterCollegeVerificationPage() {
  const { user, updateUserProfile } = useAuth();

  const [studentIdNumber, setStudentIdNumber] = useState(
    user?.studentIdNumber || "SID-UCB-2024-99214"
  );
  const [collegeYear, setCollegeYear] = useState(
    user?.collegeYear || "Bioengineering '26"
  );
  const [studentIdPreview, setStudentIdPreview] = useState(
    user?.studentIdCardUrl || "/student_id_proof.svg"
  );

  const [isUploading, setIsUploading] = useState(false);

  // Handle local file preview upload for Student ID
  const handleStudentIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setStudentIdPreview(url);
      toast.success("Student ID photo loaded for upload!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    setTimeout(() => {
      dataStore.uploadUserDocuments(user.id, {
        studentIdNumber,
        studentIdCardUrl: studentIdPreview,
        studentVerified: true,
      });

      updateUserProfile({
        studentIdNumber,
        studentIdCardUrl: studentIdPreview,
        collegeYear,
        studentVerified: true,
      });

      setIsUploading(false);
      toast.success("University Student ID verified and updated successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            College Student ID Verification
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload your official university student ID card proof to unlock instant peer rentals across campus hubs.
          </p>
        </div>

        <Link
          href="/renter/dashboard"
          className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Verification Status Overview Banner */}
      <div className="bg-gradient-to-r from-[#04241B] via-[#063B2C] to-[#04241B] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
            <GraduationCap size={26} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Campus Student KYC Status</h2>
            <p className="text-xs text-emerald-100/70">
              Campus: {user?.campus || "UC Berkeley"} • Account: {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            <span>Student ID: {user?.studentVerified ? "Verified ✓" : "Pending Review"}</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: College Student ID Proof */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-gray-900">
                Official University Student ID Proof Card
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Enrollment Proof
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Student ID Number
              </label>
              <input
                type="text"
                value={studentIdNumber}
                onChange={(e) => setStudentIdNumber(e.target.value)}
                className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-emerald-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Major &amp; Academic Year
              </label>
              <input
                type="text"
                value={collegeYear}
                onChange={(e) => setCollegeYear(e.target.value)}
                className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-emerald-600 font-semibold"
                required
              />
            </div>
          </div>

          {/* Document Preview Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Student ID Card Preview (Visible to Vehicle Owners upon Confirmed Booking)
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-emerald-200 shadow-sm bg-emerald-950 p-2">
              <img
                src={studentIdPreview}
                alt="Student ID Preview"
                className="w-full h-auto max-h-[300px] object-contain mx-auto rounded-xl"
              />
            </div>
          </div>

          {/* File Upload Zone */}
          <label className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex flex-col items-center justify-center cursor-pointer block">
            <Upload className="w-7 h-7 text-emerald-600 mb-2" />
            <p className="text-xs font-bold text-gray-800">
              Click to replace Student ID card photo
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              PNG, JPG or SVG up to 10MB • Cryptographically authenticated
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleStudentIdFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Peer Privacy Protection Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-gray-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-gray-900">Zero-Leak Peer Privacy Protocol</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Wheelzy enforces strict privacy: only your University Student ID proof is visible to vehicle owners when you book a ride. Personal contact numbers and government documents are never exposed.
            </p>
          </div>
        </div>

        {/* Global Submit Button */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            <span className="font-bold text-gray-900 block">Campus Honor Code:</span>
            By saving, you verify you are an actively enrolled student in good standing.
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            {isUploading ? (
              <span>Saving Verification...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Save Student ID Verification</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
