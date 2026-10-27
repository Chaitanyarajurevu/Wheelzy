"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  GraduationCap,
  Eye,
  FileCheck2,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Camera,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function OwnerDocumentsPage() {
  const { user, updateUserProfile } = useAuth();
  const ownerId = user && user.role === "owner" ? user.id : "usr-owner-marcus";
  const vehicles = dataStore.getOwnerVehicles(ownerId);

  // Host Student ID State
  const [studentIdNumber, setStudentIdNumber] = useState(
    user?.studentIdNumber || "SID-UCB-2023-HOST88"
  );
  const [studentIdPreview, setStudentIdPreview] = useState(
    user?.studentIdCardUrl || "/student_id_proof.svg"
  );

  const [isSavingKyc, setIsSavingKyc] = useState(false);
  const [uploadingVehicleId, setUploadingVehicleId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Sync state if user data loads or updates
  useEffect(() => {
    if (user?.studentIdNumber) setStudentIdNumber(user.studentIdNumber);
    if (user?.studentIdCardUrl) setStudentIdPreview(user.studentIdCardUrl);
  }, [user]);

  // Handle local file preview for Host Student ID
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setStudentIdPreview(url);
      toast.success("Host Student ID proof photo loaded for upload!");
    }
  };

  // Save KYC documents
  const handleSaveKycDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKyc(true);

    setTimeout(() => {
      // 1. Update dataStore
      dataStore.uploadUserDocuments(ownerId, {
        studentIdCardUrl: studentIdPreview,
        studentIdNumber,
        studentVerified: true,
      });

      // 2. Update user profile in AuthContext
      updateUserProfile({
        studentIdCardUrl: studentIdPreview,
        studentIdNumber,
        studentVerified: true,
      });

      setIsSavingKyc(false);
      toast.success("Host University Student ID updated and verified!");
    }, 600);
  };

  const handleSimulateVehicleUpload = (vehicleId: string, vehicleName: string) => {
    setUploadingVehicleId(vehicleId);
    setTimeout(() => {
      setUploadingVehicleId(null);
      toast.success(`Insurance document for ${vehicleName} uploaded to MinIO storage.`);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Host Verification &amp; Fleet Compliance
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload your personal Student ID proof, plus vehicle Registration Certificates (RC) and insurance.
          </p>
        </div>
        <Link
          href="/owner/dashboard"
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* SECTION 1: HOST PERSONAL KYC (STUDENT ID PROOF) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#022C22] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
              <ShieldCheck size={12} /> Host Mandatory Verification
            </div>
            <h2 className="text-lg font-black tracking-tight">
              Host University Student ID Proof
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              As an authorized campus vehicle host, Wheelzy requires you to verify your active University Student ID to list vehicles on campus quad hubs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-200 block font-semibold">
                Student ID
              </span>
              <span className="text-xs font-black text-white flex items-center gap-1 justify-center">
                <CheckCircle2 size={12} className="text-emerald-400" /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Content: Student ID Proof */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Host Student ID Preview
              </label>
              <button
                type="button"
                onClick={() => setFullscreenImage(studentIdPreview)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Eye size={13} /> View Full Card
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-md bg-emerald-950 group aspect-[1.58/1] p-2 flex items-center justify-center">
              <img
                src={studentIdPreview}
                alt="Host Student ID Proof"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute top-4 right-4 bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
                <CheckCircle2 size={11} /> Campus Verified
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                To protect student privacy, only this verified University Student ID proof is visible to student renters during booking. Personal contact numbers and government documents are never exposed.
              </span>
            </div>
          </div>

          {/* Right: Upload controls */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Host University Student ID Number
              </label>
              <input
                type="text"
                value={studentIdNumber}
                onChange={(e) => setStudentIdNumber(e.target.value)}
                placeholder="e.g. SID-UCB-2023-HOST88"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Upload / Replace Student ID Photo
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl bg-gray-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer">
                <Camera className="w-8 h-8 text-emerald-600 mb-2" />
                <span className="text-xs font-bold text-gray-800">
                  Click to upload new Student ID image
                </span>
                <span className="text-[10px] text-gray-400 mt-1">
                  PNG, JPG or SVG up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStudentIdChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveKycDocuments}
              disabled={isSavingKyc}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Check size={14} />
              <span>{isSavingKyc ? "Saving Documents..." : "Save Host Student ID"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: FLEET VEHICLE REGISTRATION (RC) & INSURANCE DOCUMENTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">
              Fleet Vehicle Documents (RC &amp; Insurance)
            </h2>
            <p className="text-xs text-gray-500">
              Each listed campus scooter or bike requires a valid Registration Certificate (RC) and active liability insurance.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-gray-100 text-gray-700">
            {vehicles.length} Fleet Registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="w-12 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{v.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">
                      RC: {v.documents?.rcNumber || `RC-${v.id}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.documents?.verified
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {v.documents?.verified ? "RC VERIFIED ✓" : "RC PENDING"}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Insurance Expiry:</span>
                  <span className="font-semibold text-gray-800">
                    {v.documents?.insuranceExpiry || "2027-12-31"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Storage Storage:</span>
                  <span className="font-mono text-[10px] text-emerald-700 truncate max-w-[170px]">
                    {v.documents?.rcMinioKey || `minio://docs/rc_${v.id}.pdf`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulateVehicleUpload(v.id, v.name)}
                disabled={uploadingVehicleId === v.id}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:border-emerald-400 bg-white hover:bg-emerald-50 text-xs font-bold text-gray-700 hover:text-emerald-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload size={13} />
                <span>
                  {uploadingVehicleId === v.id
                    ? "Uploading RC to MinIO..."
                    : "Update Insurance Policy Document"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Document Zoom Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImage}
              alt="Zoomed document"
              className="w-full h-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
              aria-label="Close zoom"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
