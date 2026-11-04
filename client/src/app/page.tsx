"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/home/Navbar";
import { Hero, HeroSearchFilters } from "@/components/home/Hero";
import { VehicleCarousel } from "@/components/home/VehicleCarousel";
import {
  HowItWorksSection,
  WhyChooseSection,
  SafetyAndTrustSection,
  FinalCTASection,
  ContactSection,
  FooterSection,
} from "@/components/home/Sections";
import { dataStore, StoredVehicle } from "@/lib/dataStore";
import {
  PendingSearchState,
  savePendingSearch,
  buildBrowseSearchUrl,
} from "@/lib/searchState";
import { Zap, RotateCcw } from "lucide-react";

/** Parse a display time string like "9:00 AM" or "17:00" into minutes since midnight. */
function parseTimeToMinutes(t: string): number {
  if (!t) return -1;
  const match = t.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = (match[3] || "").toUpperCase();
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/** Returns ms timestamp from YYYY-MM-DD + "9:00 AM" (or "09:00") */
function toMs(date: string, time: string): number {
  const mins = parseTimeToMinutes(time);
  if (!date || mins < 0) return 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`).getTime();
}

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // All approved+available vehicles from dataStore
  const [allVehicles, setAllVehicles] = useState<StoredVehicle[]>(() =>
    dataStore.getApprovedAvailableVehicles()
  );

  useEffect(() => {
    const handleStoreUpdate = () => {
      setAllVehicles(dataStore.getApprovedAvailableVehicles());
    };
    window.addEventListener("wheelzy-store-update", handleStoreUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleStoreUpdate);
  }, []);

  // Active filter state
  const [activeFilters, setActiveFilters] = useState<HeroSearchFilters | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Bike" | "Scooter">("All");
  const [filterCampus, setFilterCampus] = useState("");
  const [isScheduleFiltered, setIsScheduleFiltered] = useState(false);

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "system_admin") router.replace("/admin/dashboard");
      else if (user.role === "owner") router.replace("/owner/dashboard");
      else router.replace("/renter/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  /** Filter vehicles based on category pill + campus pill + schedule availability */
  const displayedVehicles = useMemo<StoredVehicle[]>(() => {
    let list = allVehicles;

    // Category quick-filter
    if (activeTab !== "All") {
      list = list.filter((v) => v.category === activeTab);
    }

    // Campus filter pill
    if (filterCampus) {
      list = list.filter((v) => v.campus === filterCampus);
    }

    // Schedule filter from compact booking search
    if (activeFilters) {
      const { vehicleType, pickupDate, pickupTime, dropoffDate, dropoffTime } = activeFilters;

      if (vehicleType && vehicleType !== "All") {
        list = list.filter((v) => v.category === vehicleType);
      }

      // Check owner window overlap: renter's requested window must fit within vehicle's available window
      const reqPickupMs = toMs(pickupDate, pickupTime);
      const reqDropoffMs = toMs(dropoffDate, dropoffTime);

      if (reqPickupMs > 0 && reqDropoffMs > reqPickupMs) {
        list = list.filter((v) => {
          const ownerPickupMs = toMs(v.availableFromDate || "", v.availableFromTime || "");
          const ownerDropoffMs = toMs(v.returnDate || "", v.returnTime || "");
          if (ownerPickupMs <= 0 || ownerDropoffMs <= ownerPickupMs) return true; // no window defined – show it
          return reqPickupMs >= ownerPickupMs && reqDropoffMs <= ownerDropoffMs;
        });
      }
    }

    return list;
  }, [allVehicles, activeTab, filterCampus, activeFilters]);

  const scheduleLabel = useMemo(() => {
    if (!activeFilters) return "";
    const { vehicleType, pickupDate, pickupTime, dropoffDate, dropoffTime } = activeFilters;
    const type = vehicleType === "All" ? "All Rides" : vehicleType + "s";
    const campusPart = filterCampus ? `${filterCampus} · ` : "";
    return `${campusPart}${type} · ${pickupDate} ${pickupTime} → ${dropoffDate} ${dropoffTime}`;
  }, [activeFilters, filterCampus]);

  const handleSearch = (filters: HeroSearchFilters) => {
    setActiveFilters(filters);
    setIsScheduleFiltered(true);
    if (filters.vehicleType === "All" || filters.vehicleType === "Bike" || filters.vehicleType === "Scooter") {
      setActiveTab(filters.vehicleType as "All" | "Bike" | "Scooter");
    }

    const pending: PendingSearchState = {
      campus: filterCampus || user?.campus || "",
      vehicleType: filters.vehicleType,
      pickupDate: filters.pickupDate,
      pickupTime: filters.pickupTime,
      dropoffDate: filters.dropoffDate,
      dropoffTime: filters.dropoffTime,
    };
    savePendingSearch(pending);

    // If not authenticated, scroll down to carousel so visitor sees instant filtered results
    if (!isAuthenticated) {
      const el = document.getElementById("explore-rides");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Authenticated renter → go directly to browse page with params
    if (user?.role === "renter") {
      router.push(buildBrowseSearchUrl(pending));
    }
  };

  const handleViewDetails = (vehicle: StoredVehicle) => {
    if (!isAuthenticated) {
      // Save vehicle selection + current search state, redirect to login
      const pending: PendingSearchState = {
        campus: filterCampus || vehicle.campus || "",
        vehicleType: activeFilters?.vehicleType || activeTab,
        pickupDate: activeFilters?.pickupDate || "",
        pickupTime: activeFilters?.pickupTime || "",
        dropoffDate: activeFilters?.dropoffDate || "",
        dropoffTime: activeFilters?.dropoffTime || "",
        selectedVehicleId: vehicle.id,
      };
      savePendingSearch(pending);
      router.push("/login?fromSearch=1");
      return;
    }

    if (user?.role === "renter") {
      // Navigate to browse page and auto-open the vehicle details modal
      const pending: PendingSearchState = {
        campus: filterCampus || vehicle.campus,
        vehicleType: activeFilters?.vehicleType || activeTab,
        pickupDate: activeFilters?.pickupDate || "",
        pickupTime: activeFilters?.pickupTime || "",
        dropoffDate: activeFilters?.dropoffDate || "",
        dropoffTime: activeFilters?.dropoffTime || "",
        selectedVehicleId: vehicle.id,
      };
      router.push(buildBrowseSearchUrl(pending));
    } else {
      // Owner / admin – redirect to their dashboard
      router.push(user?.role === "owner" ? "/owner/dashboard" : "/admin/dashboard");
    }
  };

  // If session is checking or user is authenticated (redirecting to dashboard), show loading screen
  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-[#050d18] flex flex-col items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Wheelzy
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <p className="text-xs text-emerald-300/80 font-medium mt-1 animate-pulse">
              {isAuthenticated ? "Redirecting to your dashboard..." : "Loading Wheelzy..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Public Landing Page for Logged-Out Visitors ONLY ──
  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Translucent Public Navbar */}
      <Navbar />

      {/* 2. Full-Screen Hero with Integrated Compact Quick Booking Bar */}
      <Hero onSearch={handleSearch} />

      {/* 3. Explore Campus Rides – Vehicle Sliding Carousel (Visible on Scroll Down) */}
      <section id="vehicles" className="pt-20 sm:pt-24 pb-20 bg-white scroll-mt-20">
        <div id="explore-rides" className="scroll-mt-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase">
                  Instant Availability
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Explore Campus Rides
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-1">
                Affordable rides near you at{" "}
                <span className="font-semibold text-gray-900">
                  {filterCampus || "All Campuses"}
                </span>
              </p>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl w-fit">
              {(["All", "Scooter", "Bike"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveFilters(null);
                    setIsScheduleFiltered(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#064E3B] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  {tab === "All" ? "All Rides" : tab === "Scooter" ? "Scooters" : "Bikes"}
                </button>
              ))}
            </div>
          </div>

          {/* Active Campus Filter Pill (if campus is filtered) */}
          {filterCampus && (
            <div className="mb-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 p-2.5 px-4 rounded-xl w-fit">
              <span>Showing rides for:</span>
              <span className="font-bold text-[#064E3B]">{filterCampus}</span>
              <button
                onClick={() => {
                  setFilterCampus("");
                  setActiveFilters(null);
                  setIsScheduleFiltered(false);
                }}
                className="ml-2 text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> View all campuses
              </button>
            </div>
          )}

          {/* Vehicles Sliding Carousel */}
          <VehicleCarousel
            vehicles={displayedVehicles}
            onViewDetails={handleViewDetails}
            isScheduleFiltered={isScheduleFiltered}
            scheduleLabel={scheduleLabel}
          />

          {/* Login CTA for unauthenticated visitors */}
          {!isAuthenticated && (
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Ready to book a ride?{" "}
                <span className="font-semibold text-gray-900">Log in to continue</span>
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2.5 bg-[#064E3B] text-white rounded-xl text-sm font-bold hover:bg-[#043D2F] transition-all cursor-pointer shadow-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push("/login?mode=signup")}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. How It Works */}
      <HowItWorksSection />

      {/* 5. Why Choose Wheelzy */}
      <WhyChooseSection />

      {/* 6. Safety and Trust (No duplicate promotional image section underneath) */}
      <SafetyAndTrustSection />

      {/* 7. Final Call to Action */}
      <FinalCTASection />

      {/* 8. Contact & Campus Support */}
      <ContactSection />

      {/* 9. Production Footer */}
      <FooterSection />
    </div>
  );
}
