"use client";

import React, { useState } from "react";
import { FileCheck, Upload, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RenterDrivingLicensePage() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Driving license uploaded to MinIO! Submitted for administrator approval.");
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Driving License Verification</h1>
        <p className="text-xs text-gray-500 mt-1">
          Required before renting motorized scooters or motorcycles per campus transit safety regulations.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Government DMV License</h3>
              <p className="text-xs text-gray-500">2-Wheeler / Motor Scooter Endorsement</p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
            user?.licenseVerified
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}>
            {user?.licenseVerified ? "VERIFIED DL ✓" : "SUBMISSION REQUIRED"}
          </span>
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">License Number</label>
              <input
                type="text"
                defaultValue="DL-CA-9921448"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">State & Expiration</label>
              <input
                type="text"
                defaultValue="California · Exp 2028-09-12"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center bg-emerald-50/20">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-800">Upload DMV Driving License</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Encrypted in MinIO S3 bucket (<span className="font-mono text-emerald-700">minio://wheelzy-docs/licenses/</span>)</p>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-md cursor-pointer transition-all"
          >
            {isUploading ? "Uploading..." : "Submit License for Approval"}
          </button>
        </form>
      </div>
    </div>
  );
}
