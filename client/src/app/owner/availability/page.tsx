"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Check, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function OwnerAvailabilityPage() {
  const [selectedDay, setSelectedDay] = useState("Today");

  const days = [
    { label: "Today", date: "Thu, Oct 15", active: true },
    { label: "Tomorrow", date: "Fri, Oct 16", active: true },
    { label: "Saturday", date: "Sat, Oct 17", active: true },
    { label: "Sunday", date: "Sun, Oct 18", active: true },
    { label: "Monday", date: "Mon, Oct 19", active: true },
    { label: "Tuesday", date: "Tue, Oct 20", active: true },
    { label: "Wednesday", date: "Wed, Oct 21", active: true },
  ];

  const timeSlots = [
    { slot: "08:00 AM – 10:00 AM", available: true },
    { slot: "10:00 AM – 12:00 PM", available: true },
    { slot: "12:00 PM – 02:00 PM", available: true },
    { slot: "02:00 PM – 04:00 PM", available: false, rentedTo: "Priya Nair (BK-8021)" },
    { slot: "04:00 PM – 06:00 PM", available: false, rentedTo: "Devon Clark (Pending)" },
    { slot: "06:00 PM – 08:00 PM", available: true },
    { slot: "08:00 PM – 10:00 PM", available: true },
  ];

  const handleToggleSlot = (slot: string) => {
    toast.success(`Availability preference for ${slot} saved.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Availability Calendar</h1>
        <p className="text-xs text-gray-500 mt-1">
          Define when your vehicles are unlocked and parked at campus hubs for student pickup.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
        {/* Day selector carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button
              key={d.label}
              onClick={() => setSelectedDay(d.label)}
              className={`px-4 py-3 rounded-2xl text-left shrink-0 transition-all cursor-pointer ${selectedDay === d.label
                  ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
            >
              <p className="text-[11px] uppercase tracking-wider opacity-80">{d.label}</p>
              <p className="text-xs font-bold mt-0.5">{d.date}</p>
            </button>
          ))}
        </div>

        {/* Slot schedule for the selected day */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900">Campus Hub Time Slots ({selectedDay})</h3>

          <div className="space-y-2">
            {timeSlots.map((ts, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-900">{ts.slot}</span>
                    {ts.rentedTo && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Occupied: {ts.rentedTo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${ts.available ? "bg-emerald-100 text-emerald-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                    {ts.available ? "AVAILABLE FOR BOOKING" : "RESERVED"}
                  </span>

                  {ts.available && (
                    <button
                      onClick={() => handleToggleSlot(ts.slot)}
                      className="text-xs font-bold text-gray-500 hover:text-emerald-700 px-2 py-1 rounded-lg"
                    >
                      Block Slot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
