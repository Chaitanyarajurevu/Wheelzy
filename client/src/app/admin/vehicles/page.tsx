"use client";

import React, { useState, useEffect } from "react";
import { Car, Search, MapPin, Star, AlertCircle, CheckCircle2, Power } from "lucide-react";
import { dataStore, StoredVehicle } from "@/lib/dataStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<StoredVehicle[]>(dataStore.getVehicles());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const reload = () => setVehicles(dataStore.getVehicles());

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  const handleToggleMaintenance = (v: StoredVehicle) => {
    const nextStatus = v.status === "maintenance" ? "approved" : "maintenance";
    dataStore.updateVehicleStatus(v.id, nextStatus, nextStatus === "approved");
    toast.success(`${v.name} status updated to ${nextStatus.toUpperCase()}`);
    reload();
  };

  const filtered = vehicles.filter((v) => {
    if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
    if (
      search &&
      !v.name.toLowerCase().includes(search.toLowerCase()) &&
      !v.campus.toLowerCase().includes(search.toLowerCase()) &&
      !v.ownerName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vehicle Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Global catalog of bikes and electric scooters registered across college quads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Total Fleet: {vehicles.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicle model, owner, campus hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700"
            >
              <option value="all">All Vehicle Types</option>
              <option value="Scooter">Electric & Motor Scooters</option>
              <option value="Bike">Bicycles & Motorcycles</option>
            </select>
          </div>
        </div>

        {/* Fleet Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-700">Vehicle</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Category</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Campus Hub</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Host Owner</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Hourly Rate</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Listing Status</TableHead>
                <TableHead className="text-xs font-bold text-gray-700 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id} className="hover:bg-emerald-50/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={v.imageUrl} alt="" className="w-12 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{v.name}</p>
                        <p className="text-[11px] text-gray-500">{v.model}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {v.vehicleType}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">{v.campus} · {v.locationHub}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={v.ownerAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-gray-800">{v.ownerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-gray-900">${v.hourlyPrice.toFixed(2)}/hr</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      v.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : v.status === "pending_approval"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {v.status.replace("_", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleToggleMaintenance(v)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        v.status === "maintenance"
                          ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {v.status === "maintenance" ? "Activate Listing" : "Set Maintenance"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
