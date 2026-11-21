"use client";

import React, { useState } from "react";
import { Settings, Shield, Sliders, MapPin, IndianRupee, Bell, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [eduMandatory, setEduMandatory] = useState(true);
  const [dlMandatory, setDlMandatory] = useState(true);
  const [platformCommission, setPlatformCommission] = useState("10");
  const [insuranceFee, setInsuranceFee] = useState("0");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (510) 555-CAMPUS");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings saved and deployed to campus nodes!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Configuration &amp; Guardrails
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure verification enforcement, peer commission rates, and campus security parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Policy Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Verification & Safety Policy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-gray-900">Mandatory College .edu Verification</p>
                <p className="text-[11px] text-gray-500">Require active university enrollment before booking or listing vehicles.</p>
              </div>
              <input
                type="checkbox"
                checked={eduMandatory}
                onChange={(e) => setEduMandatory(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-gray-900">Driving License Check for Motorized Rides</p>
                <p className="text-[11px] text-gray-500">Require approved Class M2 / 2-wheeler license before unlocking motor scooters.</p>
              </div>
              <input
                type="checkbox"
                checked={dlMandatory}
                onChange={(e) => setDlMandatory(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Economic & Fee Configuration */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Platform Fees &amp; Insurance Rates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Wheelzy Platform Fee (%)</label>
              <input
                type="number"
                value={platformCommission}
                onChange={(e) => setPlatformCommission(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
              <span className="text-[10px] text-gray-400">Deducted from owner rental payout</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Campus Ride Insurance Per Booking (₹)</label>
              <input
                type="text"
                value={insuranceFee}
                onChange={(e) => setInsuranceFee(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
              <span className="text-[10px] text-gray-400">Covers incidental scratches and locked parking guarantee</span>
            </div>
          </div>
        </div>

        {/* Emergency Assistance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Emergency &amp; Campus Helpline</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">24/7 Rapid Response Helpline</label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            />
            <span className="text-[10px] text-gray-400">Directly routed to campus safety and mobile repair teams</span>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Save size={14} />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
