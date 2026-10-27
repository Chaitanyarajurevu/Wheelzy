"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Bike, Calendar, Clock, AlertCircle } from "lucide-react";
import { CAMPUS_OPTIONS } from "@/data/mockVehicles";
import { useAuth } from "@/context/AuthContext";

interface SearchPanelProps {
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSearch: (filters: { campus: string; category: string; pickupDate: string; dropoffDate: string }) => void;
}

export function Hero({
  selectedCampus,
  setSelectedCampus,
  selectedCategory,
  setSelectedCategory,
  onSearch,
}: SearchPanelProps) {
  const { user } = useAuth();
  const [pickupDate, setPickupDate] = useState("2026-10-15T09:00");
  const [dropoffDate, setDropoffDate] = useState("2026-10-15T17:00");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearchClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(dropoffDate) <= new Date(pickupDate)) {
      setErrorMessage("Drop-off time must be after pick-up time.");
      return;
    }
    setErrorMessage(null);
    onSearch({
      campus: selectedCampus,
      category: selectedCategory,
      pickupDate,
      dropoffDate,
    });

    const el = document.getElementById("explore-rides");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-[680px] md:min-h-[760px] flex flex-col justify-between pt-28 pb-20 overflow-hidden">
      {/* Background Campus Photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/campus_hero.jpg"
          alt="University campus pathway with students, bicycles, and electric scooters"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_35%] filter brightness-[0.88]"
        />
        {/* Gradients for text contrast & smooth bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d18]/95 via-[#050d18]/45 to-[#050d18]/30" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#050d18]" />
      </div>

      {/* Hero Headline Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center my-auto pt-6 pb-14">
        {/* Intro chip */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold tracking-[0.12em] uppercase mb-6 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {user ? (
            <span>
              LOGGED IN AS{" "}
              <strong className="text-emerald-300">
                {user.role === "system_admin"
                  ? "SYSTEM ADMIN"
                  : user.role === "owner"
                  ? "VEHICLE HOST"
                  : "STUDENT RENTER"}
              </strong>{" "}
              &bull; {user.name.split(" ")[0]}
            </span>
          ) : (
            <span>YOUR CAMPUS. YOUR RIDE.</span>
          )}
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tight drop-shadow-lg leading-[1.05]">
          Book. Ride. Return.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow">
          {user?.role === "owner" ? (
            <>
              Welcome back, <span className="font-bold text-emerald-300">{user.name}</span>! You are hosting vehicles at{" "}
              <span className="font-semibold text-emerald-300 underline decoration-emerald-400 decoration-2 underline-offset-4">
                {user.campus || selectedCampus || "Your Campus"}
              </span>
              . Manage your listings or track active rentals.
            </>
          ) : user?.role === "system_admin" ? (
            <>
              Welcome back, <span className="font-bold text-emerald-300">{user.name}</span>! Campus operations &amp; fleet safety administration for{" "}
              <span className="font-semibold text-emerald-300 underline decoration-emerald-400 decoration-2 underline-offset-4">
                {selectedCampus || "All Campuses"}
              </span>
              .
            </>
          ) : (
            <>
              The peer-to-peer bike and scooter rental platform for{" "}
              <span className="font-semibold text-emerald-300 underline decoration-emerald-400 decoration-2 underline-offset-4">
                {selectedCampus || "Your Campus"}
              </span>
              . Snag a ride from a classmate in seconds.
            </>
          )}
        </p>
      </div>

      {/* Floating Search Panel — frosted glass dark card */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 w-full -mb-14">
        <form
          onSubmit={handleSearchClick}
          className="bg-[#0b1a2e]/92 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(16,185,129,0.1)] border border-white/[0.07] p-5 sm:p-6 md:p-7 transition-all"
        >
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">

            {/* 1. Campus Location */}
            <div className="md:col-span-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/25 rounded-2xl p-3.5 px-4 transition-all duration-200 cursor-pointer">
              <label className="text-[10.5px] font-bold text-emerald-400/80 uppercase tracking-[0.14em] block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Campus Location
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full bg-transparent text-[0.9375rem] font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-[#0b1a2e]">All Campuses</option>
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c} className="bg-[#0b1a2e]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Vehicle Type */}
            <div className="md:col-span-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/25 rounded-2xl p-3.5 px-4 transition-all duration-200 cursor-pointer">
              <label className="text-[10.5px] font-bold text-emerald-400/80 uppercase tracking-[0.14em] block mb-1.5 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5" />
                Vehicle Type
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-[0.9375rem] font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0b1a2e]">All Rides (Bikes &amp; Scooters)</option>
                <option value="Bike" className="bg-[#0b1a2e]">Bikes &amp; Cycles</option>
                <option value="Scooter" className="bg-[#0b1a2e]">Scooters (Electric &amp; Motor)</option>
              </select>
            </div>

            {/* 3. Date & Time Inputs */}
            <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup */}
              <div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/25 rounded-2xl p-3.5 px-4 transition-all duration-200">
                <label className="text-[10.5px] font-bold text-emerald-400/80 uppercase tracking-[0.14em] block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Pick Up
                </label>
                <input
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-white/90 focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              {/* Dropoff */}
              <div className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/25 rounded-2xl p-3.5 px-4 transition-all duration-200">
                <label className="text-[10.5px] font-bold text-emerald-400/80 uppercase tracking-[0.14em] block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Drop Off
                </label>
                <input
                  type="datetime-local"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-white/90 focus:outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>
            </div>

            {/* 4. Find a Ride CTA */}
            <div className="md:col-span-2 flex items-stretch">
              <button
                type="submit"
                className="w-full py-3.5 px-5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white rounded-2xl font-bold text-[1rem] flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-900/40 hover:shadow-[0_0_28px_rgba(52,211,153,0.4)] active:scale-[0.97] transition-all duration-200 cursor-pointer border border-emerald-400/20"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
                <span>Find a Ride</span>
              </button>
            </div>

          </div>
        </form>
      </div>
    </section>
  );
}
