"use client";

import React, { useState } from "react";
import { CreditCard, Calculator, ShieldCheck, Sparkles, DollarSign } from "lucide-react";

export default function RentalCostPage() {
  const [hours, setHours] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(4.0);

  const baseCost = hours * hourlyRate;
  const insuranceFee = 2.0;
  const studentDiscount = 1.5;
  const total = (baseCost + insuranceFee - studentDiscount).toFixed(2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Rental Cost & Pricing Calculator</h1>
        <p className="text-xs text-gray-500 mt-1">
          Transparent peer-to-peer student rates. Zero hidden fees, student discounts applied automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Estimator Form */}
        <div className="md:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Calculator size={18} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Fare Estimator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ride Duration ({hours} Hours)</label>
              <input
                type="range"
                min="1"
                max="12"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1 hr</span>
                <span>6 hrs</span>
                <span>12 hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Rate ($/hr)</label>
              <select
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="3.5">Xiaomi Electric Scooter ($3.50/hr)</option>
                <option value="4.0">TVS Jupiter 125 ($4.00/hr)</option>
                <option value="4.5">Honda Activa 6G ($4.50/hr)</option>
                <option value="5.0">Trek FX 2 Commuter Bike ($5.00/hr)</option>
                <option value="8.0">Royal Enfield Hunter 350 ($8.00/hr)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Receipt */}
        <div className="md:col-span-6 bg-gradient-to-br from-[#022C22] to-[#064E3B] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-300">Itemized Fare Breakdown</h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-emerald-200">
              <span>Ride Base Time ({hours} hrs @ ${hourlyRate.toFixed(2)}/hr):</span>
              <span className="font-mono text-white">${baseCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-200">
              <span>Campus Geofence Insurance:</span>
              <span className="font-mono text-white">+${insuranceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>Verified Student Discount (.edu):</span>
              <span className="font-mono">-${studentDiscount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-white/20 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Estimated Fare:</span>
              <span className="text-xl font-black text-emerald-300 font-mono">${total}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-emerald-300/80 bg-white/5 p-3 rounded-xl border border-white/10">
            * Future phase: Payment gateway integration will support campus student cards and UPI/credit without cash handoffs.
          </div>
        </div>
      </div>
    </div>
  );
}
