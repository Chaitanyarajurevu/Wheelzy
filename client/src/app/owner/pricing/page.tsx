"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Save, Sparkles, TrendingUp } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function OwnerPricingPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";
  const [vehicles, setVehicles] = useState(dataStore.getOwnerVehicles(ownerId));
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(vehicles.map((v) => [v.id, v.hourlyPrice]))
  );

  useEffect(() => {
    const list = dataStore.getOwnerVehicles(ownerId);
    setVehicles(list);
    setPrices(Object.fromEntries(list.map((v) => [v.id, v.hourlyPrice])));
  }, [ownerId]);

  const handlePriceChange = (id: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPrices((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleSavePrice = (id: string) => {
    const p = prices[id];
    if (p && p > 0) {
      dataStore.updateVehiclePricing(id, p);
      toast.success("Hourly rate updated!");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Fleet Pricing</h1>
        <p className="text-xs text-gray-500 mt-1">
          Set competitive hourly rates for campus students. Wheelzy deducts a flat 10% platform fee.
        </p>
      </div>

      <div className="space-y-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <img src={v.imageUrl} alt="" className="w-14 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">{v.name}</h3>
                <p className="text-xs text-gray-500">{v.vehicleType} · {v.locationHub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  step="0.25"
                  value={prices[v.id] || v.hourlyPrice}
                  onChange={(e) => handlePriceChange(v.id, e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">/hr</span>
              </div>

              <button
                onClick={() => handleSavePrice(v.id)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                <span>Save</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
