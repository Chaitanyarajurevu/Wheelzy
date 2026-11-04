"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Bike, Calendar, Clock, AlertCircle } from "lucide-react";

export interface HeroSearchFilters {
  vehicleType: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
}

interface HeroProps {
  onSearch: (filters: HeroSearchFilters) => void;
}

// Get today's date formatted as YYYY-MM-DD
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function Hero({ onSearch }: HeroProps) {
  const today = todayStr();

  const [vehicleType, setVehicleType] = useState("All");
  const [pickupDate, setPickupDate] = useState(today);
  const [pickupTime, setPickupTime] = useState("09:00");
  const [dropoffDate, setDropoffDate] = useState(today);
  const [dropoffTime, setDropoffTime] = useState("17:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic date/time validation
    const pickupMs = new Date(`${pickupDate}T${pickupTime}`).getTime();
    const dropoffMs = new Date(`${dropoffDate}T${dropoffTime}`).getTime();

    if (isNaN(pickupMs) || isNaN(dropoffMs)) {
      setErrorMessage("Please enter valid pickup and drop-off dates.");
      return;
    }
    if (dropoffMs <= pickupMs) {
      setErrorMessage("Drop-off time must be after pick-up time.");
      return;
    }

    setErrorMessage(null);

    // Convert 24h time to 12h AM/PM for display / storage
    const to12h = (t: string) => {
      const [hStr, mStr] = t.split(":");
      let h = parseInt(hStr, 10);
      const m = mStr;
      const period = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${h}:${m} ${period}`;
    };

    onSearch({
      vehicleType,
      pickupDate,
      pickupTime: to12h(pickupTime),
      dropoffDate,
      dropoffTime: to12h(dropoffTime),
    });

    const el = document.getElementById("explore-rides");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between pt-[76px] sm:pt-[84px] pb-8 sm:pb-10 overflow-hidden">
      {/* Background Campus Photo with Full Coverage & Position Center */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/campus_hero.jpg"
          alt="University campus pathway with students, bicycles, and electric scooters"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.84]"
        />
        {/* Subtle dark gradient overlay to ensure white text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d18] via-[#050d18]/50 to-[#050d18]/40" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#050d18]" />
      </div>

      {/* Hero Headline Content — Centered & Visually Balanced */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center my-auto py-8 sm:py-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>YOUR CAMPUS. YOUR RIDE.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg leading-[1.05]">
          Book. Ride. Return.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto font-normal leading-relaxed drop-shadow">
          The peer-to-peer bike and scooter rental platform for university campuses.
        </p>
      </div>

      {/* Compact Quick Booking Bar — Kept Together Near Bottom of Hero */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <form
          onSubmit={handleSearchClick}
          className="bg-[#0b1a2e]/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(16,185,129,0.15)] border border-white/[0.08] p-3 sm:p-3.5 transition-all"
        >
          {errorMessage && (
            <div className="mb-2.5 p-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 
            Responsive Layout:
            - Desktop (lg:grid-cols-6): all 5 fields and button in ONE horizontal row
            - Tablet (md:grid-cols-3): balanced 2-row layout (3 fields row 1, 2 fields + button row 2)
            - Mobile (grid-cols-1): stacked vertically with full-width button
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 items-stretch">

            {/* 1. Vehicle Type */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Bike className="w-3 h-3" />
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0b1a2e]">All Rides</option>
                <option value="Bike" className="bg-[#0b1a2e]">Bikes &amp; Cycles</option>
                <option value="Scooter" className="bg-[#0b1a2e]">Scooters</option>
              </select>
            </div>

            {/* 2. Pickup Date */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                min={today}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 3. Pickup Time */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pickup Time
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 4. Drop-off Date */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Drop-off Date
              </label>
              <input
                type="date"
                value={dropoffDate}
                min={pickupDate || today}
                onChange={(e) => setDropoffDate(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 5. Drop-off Time */}
            <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/30 rounded-xl p-2 px-3 transition-all flex flex-col justify-center">
              <label className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-widest block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Drop-off Time
              </label>
              <input
                type="time"
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white/95 focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* 6. Find a Ride Button */}
            <div className="flex items-stretch">
              <button
                type="submit"
                className="w-full min-h-[44px] py-2 px-4 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 hover:shadow-[0_0_24px_rgba(52,211,153,0.4)] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-emerald-400/20"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Find a Ride</span>
              </button>
            </div>

          </div>
        </form>
      </div>
    </section>
  );
}
