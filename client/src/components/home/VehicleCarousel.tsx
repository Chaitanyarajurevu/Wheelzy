"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Star, ArrowRight, Zap, Bike } from "lucide-react";
import { StoredVehicle, STANDARD_HOURLY_RATE, getVehicleDurationHours, calculateRentalAmount } from "@/lib/dataStore";

interface VehicleCarouselProps {
  vehicles: StoredVehicle[];
  onViewDetails: (vehicle: StoredVehicle) => void;
  isScheduleFiltered?: boolean;
  scheduleLabel?: string;
}

function getCardsPerView(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

export function VehicleCarousel({
  vehicles,
  onViewDetails,
  isScheduleFiltered = false,
  scheduleLabel = "",
}: VehicleCarouselProps) {
  const [cardsPerView, setCardsPerView] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset index if vehicles or cardsPerView changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [vehicles.length, cardsPerView]);

  const maxIndex = Math.max(0, vehicles.length - cardsPerView);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  }, [maxIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const totalPages = Math.ceil(vehicles.length / cardsPerView);
  const currentPage = Math.floor(currentIndex / cardsPerView);

  if (vehicles.length === 0) {
    return (
      <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
          <Bike className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No rides available</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          {isScheduleFiltered
            ? "No vehicles match your selected pickup and drop-off schedule. Try adjusting the dates."
            : "No campus rides are available right now. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Schedule filter info bar */}
      {isScheduleFiltered && scheduleLabel && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl w-fit">
          <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Showing rides available for: <strong>{scheduleLabel}</strong></span>
        </div>
      )}

      {/* Carousel row */}
      <div className="relative">
        {/* Prev button */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label="Previous vehicles"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Cards viewport */}
        <div
          className="overflow-hidden px-1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex gap-5 transition-transform duration-350 ease-out"
            style={{ transform: `translateX(calc(-${currentIndex} * (100% / ${cardsPerView}) - ${currentIndex} * (20px / ${cardsPerView})))` }}
          >
            {vehicles.map((v) => {
              const duration = getVehicleDurationHours(v);
              const totalCost = calculateRentalAmount(duration);

              return (
                <div
                  key={v.id}
                  className="shrink-0 bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
                  style={{ width: `calc((100% - ${(cardsPerView - 1) * 20}px) / ${cardsPerView})` }}
                  onClick={() => onViewDetails(v)}
                >
                  {/* Vehicle Image */}
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Rate badge */}
                    <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-xs font-black text-emerald-900 shadow-sm border border-emerald-200/60">
                      ₹{STANDARD_HOURLY_RATE}/hr
                    </div>
                    {/* Category */}
                    <div className="absolute top-2.5 left-2.5 bg-[#0A1F1A]/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white font-bold tracking-wide uppercase">
                      {v.vehicleType}
                    </div>
                    {/* Location */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/55 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white flex items-center gap-1 font-medium">
                      <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="truncate max-w-[120px]">{v.locationHub}</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    {/* Name + rating */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {v.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 truncate">{v.model}</p>
                      </div>
                      {v.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{v.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Duration + Cost */}
                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">Duration</p>
                          <p className="text-xs font-black text-emerald-950">
                            {duration}h
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Total</p>
                        <p className="text-sm font-black text-emerald-900">₹{totalCost}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onViewDetails(v); }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View & Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={currentIndex >= maxIndex}
          aria-label="Next vehicles"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 pt-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * cardsPerView)}
              aria-label={`Go to page ${i + 1}`}
              className={`rounded-full transition-all cursor-pointer ${
                i === currentPage
                  ? "w-5 h-2 bg-emerald-600"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Ride count */}
      <p className="text-center text-xs text-gray-400">
        {vehicles.length} ride{vehicles.length !== 1 ? "s" : ""} available
        {isScheduleFiltered ? " for your schedule" : " on campus"}
      </p>
    </div>
  );
}

