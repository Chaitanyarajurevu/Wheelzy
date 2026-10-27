"use client";

import React, { useState } from "react";
import { Search, MapPin, Star, Filter, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { dataStore, StoredVehicle } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function RenterBrowsePage() {
  const { user } = useAuth();
  const [vehicles] = useState(dataStore.getApprovedAvailableVehicles(user?.campus));
  const [category, setCategory] = useState<"All" | "Bike" | "Scooter">("All");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("10");
  const [selectedVehicle, setSelectedVehicle] = useState<StoredVehicle | null>(null);

  const filtered = vehicles.filter((v) => {
    if (category !== "All" && v.category !== category) return false;
    if (v.hourlyPrice > parseFloat(maxPrice)) return false;
    if (
      search &&
      !v.name.toLowerCase().includes(search.toLowerCase()) &&
      !v.model.toLowerCase().includes(search.toLowerCase()) &&
      !v.locationHub.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleBook = (v: StoredVehicle) => {
    if (!user) return;
    dataStore.createBooking({
      vehicle: v,
      renter: user,
      pickupTime: "Today, 3:00 PM",
      dropoffTime: "Today, 6:00 PM",
      durationHours: 3,
      campusHub: v.locationHub,
    });
    toast.success(`Booking request submitted for ${v.name}!`);
    setSelectedVehicle(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Browse Campus Rides</h1>
          <p className="text-xs text-gray-500 mt-1">
            Explore verified student-owned bikes and electric scooters available near {user?.campus || "UC Berkeley"}.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          {filtered.length} Rides Available
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ride model (Xiaomi, Trek, Activa), campus hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["All", "Scooter", "Bike"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${category === cat
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
              >
                {cat === "All" ? "All Types" : cat === "Scooter" ? "Scooters" : "Bikes"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-500 font-medium">Max Hourly Rate:</span>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-36 accent-emerald-600 cursor-pointer"
          />
          <span className="font-bold text-emerald-900 font-mono">${maxPrice}/hr</span>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-3xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                <img
                  src={v.imageUrl}
                  alt={v.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-emerald-900 shadow-sm">
                  ${v.hourlyPrice.toFixed(2)}/hr
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-white flex items-center gap-1 font-medium">
                  <MapPin size={10} className="text-emerald-400" /> {v.locationHub}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-xs text-gray-500">{v.model}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                    <Star size={12} className="fill-amber-400" />
                    <span>{v.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <img src={v.ownerAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[11px] text-gray-600 truncate">Host: {v.ownerName}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedVehicle(v)}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-700 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Details & Book</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {selectedVehicle.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {selectedVehicle.vehicleType} · {selectedVehicle.locationHub}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-52">
                <img src={selectedVehicle.imageUrl} alt="" className="w-full h-52 object-cover" />
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Hourly Rate:</span>
                  <span className="font-bold text-emerald-900">${selectedVehicle.hourlyPrice.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pickup Location:</span>
                  <span className="font-semibold text-gray-800">{selectedVehicle.locationHub}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="py-2 px-3 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBook(selectedVehicle)}
                className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md"
              >
                Confirm Booking Request
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
