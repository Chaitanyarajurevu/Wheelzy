"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";

const typeIcons: Record<string, React.ElementType> = {
  booking: CheckCircle2,
  alert: AlertCircle,
  reminder: Clock,
  info: Info,
};

export default function RenterNotificationsPage() {
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";
  const [notifs] = useState(dataStore.getNotifications("renter", renterId));

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Booking approvals, ride countdowns, and return confirmations.
          </p>
        </div>
        {notifs.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {notifs.length} updates
          </span>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Activity updates will appear here as you use Wheelzy.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {notifs.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-gray-900">{n.title}</h3>
                    <span className="text-[10px] text-gray-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
