"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Clock, Inbox, ShieldAlert } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";

export default function OwnerNotificationsPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";
  const [notifs] = useState(dataStore.getNotifications("owner", ownerId));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Host Notifications</h1>
        <p className="text-xs text-gray-500 mt-1">
          Real-time alerts for booking requests, returns, cancellations, and verification status.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm divide-y divide-gray-50">
        {notifs.map((n) => (
          <div key={n.id} className="py-4 first:pt-0 last:pb-0 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
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
