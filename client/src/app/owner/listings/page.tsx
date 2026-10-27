"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, PlusCircle, Search, Power, Trash2, Edit3, ShieldCheck } from "lucide-react";
import { dataStore, StoredVehicle } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";

export default function OwnerListingsPage() {
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";
  const [vehicles, setVehicles] = useState<StoredVehicle[]>(dataStore.getOwnerVehicles(ownerId));
  const [search, setSearch] = useState("");

  const reload = () => setVehicles(dataStore.getOwnerVehicles(ownerId));

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, [ownerId]);

  const handleToggleAvailability = (v: StoredVehicle) => {
    if (v.status !== "approved") {
      toast.warning("Vehicle is still pending administrative approval.");
      return;
    }
    const updated = dataStore.updateVehicleStatus(v.id, "approved", !v.isAvailable);
    if (updated) {
      toast.success(
        updated.isAvailable
          ? `${v.name} is now available for campus bookings!`
          : `${v.name} has been paused from rentals.`
      );
      reload();
    }
  };

  const filtered = vehicles.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.locationHub.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Listing Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your peer-to-peer vehicles, toggle live campus availability, and review RC approvals.
          </p>
        </div>
        <Link
          href="/owner/add-vehicle"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle size={14} />
          <span>Add New Vehicle</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search in your fleet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hidden sm:inline">
            {vehicles.length} Vehicles in Host Fleet
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-700">Vehicle</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Type</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Designated Hub</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Rate</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Live Availability</TableHead>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {v.vehicleType}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-700">{v.locationHub}</TableCell>
                  <TableCell className="text-xs font-bold text-gray-900">${v.hourlyPrice.toFixed(2)}/hr</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${v.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : v.status === "pending_approval"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                      {v.status.replace("_", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleAvailability(v)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${v.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                      {v.isAvailable ? "● Live / Rentable" : "○ Paused"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href="/owner/pricing"
                      className="text-xs font-bold text-emerald-700 hover:underline px-2"
                    >
                      Pricing
                    </Link>
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
