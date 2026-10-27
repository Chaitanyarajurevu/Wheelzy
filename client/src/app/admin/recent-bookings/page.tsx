"use client";

import React from "react";
import RecentBookingsSection from "@/components/RecentBookingsSection";
import Link from "next/link";
import { BookOpen, Activity, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminRecentBookingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#047857] text-white p-7 sm:p-8 shadow-xl border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-white/15">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>LIVE OPERATIONS MONITOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Recent Campus Bookings
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Real-time monitoring of new bike and scooter rental reservations, active campus trips, and return inspections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 shadow-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>View All Historical Records</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Recent Bookings Component */}
      <RecentBookingsSection
        title="Live & Recent Rental Ledger"
        subtitle="Ordered with the most recent campus booking requests, confirmed reservations, and handovers first."
        itemsPerPage={10}
        showViewAllLink={true}
      />
    </div>
  );
}
