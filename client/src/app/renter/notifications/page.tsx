"use client";

import React, { useState } from "react";
import { Bell, Activity, Clock, ShieldCheck } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";

export default function RenterNotificationsPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";
  const [notifs] = useState(dataStore.getNotifications("renter", renterId));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Renter Notifications</h1>
        <p className="text-xs text-gray-500 mt-1">
          Stay updated on booking approvals, active ride countdowns, and return confirmations.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm divide-y divide-gray-50">
        {notifs.map((n) => (
          <div key={n.id} className="py-4 first:pt-0 last:pb-0 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-gray-900">{n.title}</h3>
              </div>
              <span className="text-[10px] text-gray-400">{n.timestamp}</span>
            </div>
            <p className="text-xs text-gray-600 pl-4">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
