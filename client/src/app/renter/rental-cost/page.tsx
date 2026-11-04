"use client";

import React, { useState } from "react";
import { Calculator, ShieldCheck, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { STANDARD_HOURLY_RATE, calculateRentalAmount } from "@/lib/dataStore";

export default function RentalCostPage() {
  const [hours, setHours] = useState(3);
  const totalAmount = calculateRentalAmount(hours);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Rental Cost & Pricing Calculator</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Fixed platform rate: <span className="font-bold text-emerald-800">₹{STANDARD_HOURLY_RATE} per hour</span> for all campus bikes and scooters. Zero hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Estimator Form */}
        <div className="md:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Calculator size={18} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Duration & Fare Estimator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">Ride Duration</label>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {hours} {hours === 1 ? "Hour" : "Hours"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1 hr</span>
                <span>3 hrs</span>
                <span>6 hrs</span>
                <span>9 hrs</span>
                <span>12 hrs</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs space-y-1">
              <p className="font-bold text-emerald-900">Standard Wheelzy Pricing Policy</p>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Formula: <span className="font-mono font-bold">Rental Amount = Duration (Hours) × ₹{STANDARD_HOURLY_RATE}</span>
              </p>
              <p className="text-[10px] text-gray-500">
                All approved bikes, e-scooters, and motorcycles rent at the same uniform student rate.
              </p>
            </div>

            {/* Quick Duration Table */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Standard Rates Reference
              </p>
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {[1, 2, 3, 4, 5].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(h)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      hours === h
                        ? "bg-emerald-700 text-white font-bold border-emerald-700 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <p className="text-[10px] text-gray-400 font-normal">{h}h</p>
                    <p className="font-bold">₹{calculateRentalAmount(h)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Receipt */}
        <div className="md:col-span-6 bg-gradient-to-br from-[#022C22] to-[#064E3B] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-emerald-300">Itemized Fare Breakdown</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Transparent Pricing
              </span>
            </div>

            <div className="space-y-3 text-xs pt-3">
              <div className="flex justify-between text-emerald-200">
                <span>Rental Duration:</span>
                <span className="font-mono text-white font-semibold">
                  {hours} {hours === 1 ? "hour" : "hours"}
                </span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Platform Fixed Hourly Rate:</span>
                <span className="font-mono text-white font-semibold">₹{STANDARD_HOURLY_RATE}/hr</span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Security Deposit:</span>
                <span className="font-mono text-emerald-300 font-semibold">₹0 (Waived for Verified Students)</span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Cancellation Protection:</span>
                <span className="font-mono text-emerald-300 font-semibold">100% Full Refund Eligible</span>
              </div>

              <div className="pt-3 border-t border-white/20 flex justify-between items-center text-sm font-bold text-white">
                <span>Total Estimated Fare:</span>
                <span className="text-2xl font-black text-emerald-300 font-mono">
                  ₹{totalAmount}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/80 bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <p className="font-semibold text-white">Payment Gateway Notice</p>
            <p>
              Payment gateway integration is planned for a future release. Fare estimates are calculated at ₹{STANDARD_HOURLY_RATE}/hour without online payment transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
