"use client";

import React from "react";
import RecentBookingsSection from "@/components/RecentBookingsSection";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export default function AdminRecentBookingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Heading matching Renter & Owner Dashboards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Live Operations Monitor
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Recent Campus Bookings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time monitoring of rental reservations, active trips, and return inspections across campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <BookOpen size={13} />
            <span>All Bookings Ledger</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recent Bookings Component */}
      <RecentBookingsSection
        title=""
        subtitle=""
        itemsPerPage={10}
        showViewAllLink={true}
      />
    </div>
  );
}
