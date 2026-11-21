"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Search, ShieldCheck, CheckCircle2, ChevronRight, Wrench } from "lucide-react";
import { dataStore, StoredVehicle, STANDARD_HOURLY_RATE } from "@/lib/dataStore";
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
    dataStore.updateVehicleStatus(v.id, nextStatus, false);
    toast.success(`${v.name} status updated to ${nextStatus.toUpperCase()}`);
    reload();
  };

  const filtered = vehicles.filter((v) => {
    if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
    if (
      search &&
      !v.name.toLowerCase().includes(search.toLowerCase()) &&
      !v.campus.toLowerCase().includes(search.toLowerCase()) &&
      !v.ownerName.toLowerCase().includes(search.toLowerCase()) &&
      !(v.documents?.rcNumber && v.documents.rcNumber.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const pendingVehiclesCount = vehicles.filter((v) => v.status === "pending_approval").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Heading aligned with Renter & Owner Dashboards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Fleet Catalog &amp; Maintenance
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Global catalog of bikes and electric scooters registered across college campuses (1 vehicle per owner).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingVehiclesCount > 0 && (
            <Link
              href="/admin/verification?tab=vehicle"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <ShieldCheck size={13} />
              <span>Verify Queue</span>
              <span className="bg-white text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingVehiclesCount}
              </span>
            </Link>
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            Total Fleet: {vehicles.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicle model, owner, RC #, hub..."
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
              <option value="Scooter">Electric &amp; Motor Scooters</option>
              <option value="Bike">Bicycles &amp; Motorcycles</option>
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
                      <img src={v.imageUrl} alt="" className="w-12 h-10 rounded-xl object-cover border border-gray-100 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{v.name}</p>
                        <p className="text-[11px] text-gray-500">{v.model}</p>
                        {v.documents?.rcNumber && (
                          <span className="font-mono text-[10px] text-emerald-700 font-semibold">{v.documents.rcNumber}</span>
                        )}
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
                  <TableCell className="text-xs font-bold text-gray-900">
                    ₹{STANDARD_HOURLY_RATE}/hr
                  </TableCell>
                  <TableCell>
                    {v.status === "approved" ? (
                      v.isAvailable ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Active / Listed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                          Approved – Not Listed
                        </span>
                      )
                    ) : v.status === "pending_approval" ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Pending Approval
                      </span>
                    ) : v.status === "maintenance" ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                        Maintenance
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        {v.status.toUpperCase()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {v.status === "pending_approval" ? (
                        <Link
                          href="/admin/verification?tab=vehicle"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                        >
                          Review RC
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleToggleMaintenance(v)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {v.status === "maintenance" ? "End Maintenance" : "Set Maintenance"}
                        </button>
                      )}
                    </div>
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
