"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2, Megaphone, Shield } from "lucide-react";
import { dataStore, PlatformNotification } from "@/lib/dataStore";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState(dataStore.getNotifications("system_admin"));
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState<"all" | "owner" | "renter">("all");

  const reload = () => setNotifs(dataStore.getNotifications("system_admin"));

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.error("Please fill in both title and message");
      return;
    }

    dataStore.addNotification({
      recipientId: targetAudience,
      recipientRole: targetAudience,
      title: broadcastTitle,
      message: broadcastMessage,
      type: "system",
    });

    toast.success("Broadcast notification dispatched to campus users!");
    setBroadcastTitle("");
    setBroadcastMessage("");
    reload();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Notifications</h1>
        <p className="text-xs text-gray-500 mt-1">
          Broadcast campus safety alerts, maintenance announcements, and view administrative logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compose Broadcast */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Megaphone size={16} />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Send Campus Broadcast</h2>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="all">All Campus Users (Renters & Hosts)</option>
                <option value="renter">Student Renters Only</option>
                <option value="owner">Vehicle Hosts Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Alert Title</label>
              <input
                type="text"
                placeholder="e.g. Quad Hub Relocation for Spring Fest"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
              <textarea
                placeholder="Provide details about hub changes, storm alerts, or service updates..."
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={13} />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>

        {/* Recent Admin Alerts */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Admin Notification History</h2>
            <span className="text-xs text-gray-400">{notifs.length} events logged</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {notifs.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-1">
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                  <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-gray-600">{n.message}</p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase">
                    {n.type}
                  </span>
                  <span className="text-[10px] text-gray-400">Target: {n.recipientRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
