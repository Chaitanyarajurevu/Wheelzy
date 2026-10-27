"use client";

import React, { useState } from "react";
import { AlertTriangle, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RenterReportPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";

  const [category, setCategory] = useState<any>("Vehicle Damage");
  const [description, setDescription] = useState("");
  const [vehicleName, setVehicleName] = useState("Royal Enfield Hunter 350");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      toast.error("Please enter a description of the issue.");
      return;
    }

    dataStore.createReport({
      reporterId: renterId,
      reporterName: user?.name || "Priya Nair",
      reporterRole: "renter",
      targetType: "vehicle",
      targetId: vehicleName,
      category,
      description,
    });

    toast.success("Issue submitted to platform administrators.");
    setIsSent(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Report an Issue</h1>
        <p className="text-xs text-gray-500 mt-1">
          Submit safety concerns, mechanical faults, or billing disputes directly to campus operations.
        </p>
      </div>

      {isSent ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Issue Ticket Logged</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Our campus fleet team has received your ticket and will inspect the vehicle before its next reservation.
          </p>
          <button
            onClick={() => {
              setIsSent(false);
              setDescription("");
            }}
            className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Issue Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            >
              <option value="Vehicle Damage">Vehicle Damage / Brakes / Scratches</option>
              <option value="Late Return">Late Return / Host Dispute</option>
              <option value="Billing Dispute">Billing Dispute / Deposit Refund</option>
              <option value="Safety Concern">Safety Concern / Missing Helmet</option>
              <option value="Hub Facility">Campus Hub Geofence Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle / Booking Involved</label>
            <input
              type="text"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description of Issue</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, exact location on campus, and any photos you took..."
              className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={14} />
            <span>Submit Ticket to Support</span>
          </button>
        </form>
      )}
    </div>
  );
}
