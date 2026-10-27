"use client";

import React, { useState } from "react";
import { Settings, Shield, Sliders, MapPin, DollarSign, Bell, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [eduMandatory, setEduMandatory] = useState(true);
  const [dlMandatory, setDlMandatory] = useState(true);
  const [platformCommission, setPlatformCommission] = useState("10");
  const [insuranceFee, setInsuranceFee] = useState("2.00");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (510) 555-CAMPUS");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Platform settings saved and deployed to campus nodes!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure verification enforcement, peer commission rates, and campus security parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Policy Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-4">
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
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Platform Fees & Insurance Rates</h2>
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Campus Ride Insurance Per Booking ($)</label>
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
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Emergency & Campus Helpline</h2>
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
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Save size={14} />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
}
