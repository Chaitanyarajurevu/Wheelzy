"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { VehicleCard, VehicleBookingModal } from "@/components/home/VehicleCard";
import {
  HowItWorksSection,
  WhyChooseSection,
  ListYourVehicleSection,
  SafetyAndTrustSection,
  FinalCTASection,
  ContactSection,
  FooterSection,
} from "@/components/home/Sections";
import { RoleHomeBanner } from "@/components/home/RoleHomeBanner";
import { SAMPLE_VEHICLES, Vehicle, CAMPUS_OPTIONS } from "@/data/mockVehicles";
import { Bike, Sparkles, Filter, CheckCircle2, RotateCcw } from "lucide-react";

export default function HomePage() {
  const [selectedCampus, setSelectedCampus] = useState<string>("UC Berkeley");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"All" | "Bike" | "Scooter">("All");

  // Selected vehicle for details/booking modal
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [modalMode, setModalMode] = useState<"details" | "book">("details");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search filter trigger
  const handleSearch = (filters: {
    campus: string;
    category: string;
    pickupDate: string;
    dropoffDate: string;
  }) => {
    setSelectedCampus(filters.campus);
    if (filters.category === "All" || filters.category === "Bike" || filters.category === "Scooter") {
      setSelectedCategory(filters.category);
      setActiveTab(filters.category as "All" | "Bike" | "Scooter");
    }
  };

  // Filter vehicles according to campus and vehicle category
  const filteredVehicles = useMemo(() => {
    return SAMPLE_VEHICLES.filter((vehicle) => {
      // Category filter (support both activeTab and selectedCategory)
      const targetCat = activeTab !== "All" ? activeTab : selectedCategory;
      if (targetCat !== "All" && vehicle.category !== targetCat) {
        return false;
      }
      // Campus filter
      if (selectedCampus && selectedCampus !== "" && vehicle.campus !== selectedCampus) {
        // If campus is selected, show vehicles matching the campus or display all if user wants
        return false;
      }
      return true;
    });
  }, [selectedCampus, selectedCategory, activeTab]);

  const handleOpenDetails = (vehicle: Vehicle) => {
    setActiveVehicle(vehicle);
    setModalMode("details");
    setIsModalOpen(true);
  };

  const handleOpenBook = (vehicle: Vehicle) => {
    setActiveVehicle(vehicle);
    setModalMode("book");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Translucent Navbar */}
      <Navbar />

      {/* 2. Hero with Floating Search Panel */}
      <Hero
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat === "All" || cat === "Bike" || cat === "Scooter") {
            setActiveTab(cat as "All" | "Bike" | "Scooter");
          }
        }}
        onSearch={handleSearch}
      />

      {/* 2.5 Active Role Portal Banner */}
      <div className="pt-20 sm:pt-24 bg-gradient-to-b from-white to-gray-50/40">
        <RoleHomeBanner />
      </div>

      {/* 3. Explore Campus Rides Section */}
      <section id="vehicles" className="pt-8 pb-20 bg-white scroll-mt-24">
        <div id="explore-rides" className="scroll-mt-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
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
                  {selectedCampus || "All Campuses"}
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
                    setSelectedCategory(tab);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === tab
                      ? "bg-[#064E3B] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                >
                  {tab === "All" ? "All Rides" : tab === "Scooter" ? "Scooters" : "Bikes"}
                </button>
              ))}
            </div>
          </div>

          {/* Active Campus Filter Pill Bar (if campus is filtered) */}
          {selectedCampus && (
            <div className="mb-8 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 p-2.5 px-4 rounded-xl w-fit">
              <span>Showing available rides for:</span>
              <span className="font-bold text-[#064E3B]">{selectedCampus}</span>
              <button
                onClick={() => setSelectedCampus("")}
                className="ml-2 text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> View all campuses
              </button>
            </div>
          )}

          {/* Vehicles Card Grid: 3 cols desktop, 2 tablet, 1 mobile */}
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onBook={handleOpenBook}
                  onViewDetails={handleOpenDetails}
                />
              ))}
            </div>
          ) : (
            /* Helpful Empty State */
            <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Bike className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No vehicles match your current filter</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                We couldn&apos;t find any {activeTab !== "All" ? activeTab.toLowerCase() + "s" : "rides"} at {selectedCampus}.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCampus("");
                    setActiveTab("All");
                    setSelectedCategory("All");
                  }}
                  className="px-5 py-2.5 bg-[#064E3B] text-white rounded-xl text-xs font-bold hover:bg-[#043D2F] transition-all"
                >
                  Clear Filters
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

      {/* 6. List Your Vehicle */}
      <ListYourVehicleSection />

      {/* 7. Safety and Trust */}
      <SafetyAndTrustSection />

      {/* 8. Final Call to Action */}
      <FinalCTASection />

      {/* 8.5 Contact & Campus Support */}
      <ContactSection />

      {/* 9. Production Footer */}
      <FooterSection />

      {/* 10. Interactive Vehicle Booking / Details Modal */}
      <VehicleBookingModal
        vehicle={activeVehicle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={modalMode}
      />
    </div>
  );
}
