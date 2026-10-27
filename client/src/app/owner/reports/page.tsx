"use client";

import React from "react";
import { BarChart3, TrendingUp, DollarSign, Calendar, Star } from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";

export default function OwnerReportsPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";
  const bookings = dataStore.getOwnerBookings(ownerId);
  const completed = bookings.filter((b) => b.status === "completed" || b.status === "returned");

  const totalEarned = completed.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Earnings & Rental Reports</h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed metrics on student reservations, fleet utilization, and host ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${totalEarned.toFixed(2)}`}
          icon={DollarSign}
          trend="Released to college bank node"
          color="#10B981"
          bg="#ECFDF5"
        />
        <StatCard
          label="Total Rides Completed"
          value={completed.length}
          icon={BarChart3}
          trend="Successful handovers"
          color="#059669"
          bg="#ECFDF5"
        />
        <StatCard
          label="Host Quality Score"
          value="4.9 ★"
          icon={Star}
          trend="Based on student reviews"
          color="#D97706"
          bg="#FFFBEB"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Recent Rental Revenue Breakdown</h3>
        <div className="divide-y divide-gray-50">
          {completed.map((b) => (
            <div key={b.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">{b.vehicleName}</p>
                <p className="text-[11px] text-gray-500">Rented by {b.renterName} · {b.durationHours} hrs ({b.pickupTime})</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                +${b.totalCost.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
