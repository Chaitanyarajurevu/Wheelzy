"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  BookOpen,
  Search,
  MapPin,
  Activity,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  ArrowUpDown,
  Eye,
  Camera,
  AlertTriangle,
  XCircle,
  Car,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import AdminBookingDetailsModal, { getBookingStatusBadge } from "@/components/AdminBookingDetailsModal";

export default function AdminAllBookingsPage() {
  const [bookings, setBookings] = useState<StoredBooking[]>(dataStore.getBookings());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "status" | "cost_desc">("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState<StoredBooking | null>(null);

  const reload = () => setBookings(dataStore.getBookings());

  useEffect(() => {
    reload();
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let list = [...bookings];

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((b) => {
        return (
          b.id.toLowerCase().includes(q) ||
          b.renterName.toLowerCase().includes(q) ||
          b.ownerName.toLowerCase().includes(q) ||
          b.vehicleName.toLowerCase().includes(q) ||
          b.campusHub.toLowerCase().includes(q) ||
          (b.vehicleRegistrationNumber && b.vehicleRegistrationNumber.toLowerCase().includes(q))
        );
      });
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      const target = statusFilter.toLowerCase();
      list = list.filter((b) => {
        const bStatus = b.status.toLowerCase();
        if (target === "confirmed") {
          return bStatus === "confirmed" || bStatus === "approved";
        }
        if (target === "returned") {
          return bStatus === "returned" || bStatus === "completed";
        }
        return bStatus === target;
      });
    }

    // 3. Vehicle Type Filter
    if (vehicleTypeFilter !== "all") {
      list = list.filter((b) => b.vehicleType === vehicleTypeFilter);
    }

    // 4. Campus Hub Filter
    if (campusFilter !== "all") {
      list = list.filter((b) => b.campusHub.toLowerCase().includes(campusFilter.toLowerCase()));
    }

    // 5. Sorting
    list.sort((a, b) => {
      if (sortBy === "date_desc") {
        return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
      }
      if (sortBy === "date_asc") {
        return (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0);
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      if (sortBy === "cost_desc") {
        return b.totalCost - a.totalCost;
      }
      return 0;
    });

    return list;
  }, [bookings, search, statusFilter, vehicleTypeFilter, campusFilter, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // Metrics count
  const counts = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter((b) => b.status === "active").length,
      returned: bookings.filter((b) => b.status === "returned" || b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      pending: bookings.filter((b) => b.status === "pending").length,
    };
  }, [bookings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              All Bookings / Booking History
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Permanent Ledger
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-3xl">
            Complete historical and active record of peer-to-peer quad rentals. Past bookings are permanently retained across status transitions for compliance, safety audits, and dispute resolution.
          </p>
        </div>

        {/* Quick Metric Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-gray-800 border border-gray-200 shadow-2xs">
            Total: <strong>{counts.total}</strong>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            Active: <strong>{counts.active}</strong>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
            Returned: <strong>{counts.returned}</strong>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            Cancelled: <strong>{counts.cancelled}</strong>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs">
            Rejected: <strong>{counts.rejected}</strong>
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search booking ID, student, host, vehicle model, or RC registration..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Bookings</option>
                  <option value="active">Active Rides</option>
                  <option value="pending">Pending Requests</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="returned">Returned / Finished</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected by Host</option>
                </select>
              </div>

              {/* Vehicle Type Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Type:</span>
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => {
                    setVehicleTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Vehicle Types</option>
                  <option value="Electric Scooter">Electric Scooter</option>
                  <option value="Motor Scooter">Motor Scooter</option>
                  <option value="Hybrid Bicycle">Hybrid Bicycle</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
                <ArrowUpDown size={13} className="text-gray-400" />
                <span className="text-[11px] font-bold text-gray-500 uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="date_desc">Booking Date: Newest First</option>
                  <option value="date_asc">Booking Date: Oldest First</option>
                  <option value="status">Status (A to Z)</option>
                  <option value="cost_desc">Quoted Cost: High to Low</option>
                </select>
              </div>

              {/* Reset Action */}
              {(statusFilter !== "all" || vehicleTypeFilter !== "all" || campusFilter !== "all" || search) && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setVehicleTypeFilter("all");
                    setCampusFilter("all");
                    setSearch("");
                    setSortBy("date_desc");
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-emerald-700 px-2 py-1 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          {paginatedList.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-50/80 border-b border-gray-100">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gray-700 py-3.5">Booking Ref</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Vehicle Info</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Renter Details</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Host Owner</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Schedule & Hub</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Quote</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Return Photo</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.map((b) => {
                  const badge = getBookingStatusBadge(b.status);
                  const isReturned = b.status === "returned" || b.status === "completed";
                  const isCancelled = b.status === "cancelled";
                  const isRejected = b.status === "rejected";

                  return (
                    <TableRow key={b.id} className="hover:bg-emerald-50/25 transition-colors border-b border-gray-100/80">
                      {/* Booking Ref */}
                      <TableCell className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-emerald-800 block">
                            {b.id}
                          </span>
                          <span className="text-[10px] text-gray-400 block whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Vehicle Info */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <img
                            src={b.vehicleImage}
                            alt={b.vehicleName}
                            className="w-11 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
                          />
                          <div className="min-w-0 max-w-[190px]">
                            <p className="text-xs font-bold text-gray-900 truncate">{b.vehicleName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-500 truncate">{b.vehicleType}</span>
                              {b.vehicleRegistrationNumber && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-gray-100 text-gray-600">
                                  {b.vehicleRegistrationNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Renter Details */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={b.renterAvatar}
                            alt={b.renterName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{b.renterName}</p>
                            <p className="text-[10px] text-gray-500">{b.renterCampus.split("·")[0]}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Host Owner */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={b.ownerAvatar}
                            alt={b.ownerName}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
                          />
                          <span className="text-xs font-medium text-gray-800">{b.ownerName}</span>
                        </div>
                      </TableCell>

                      {/* Schedule & Hub */}
                      <TableCell>
                        <div className="space-y-0.5 max-w-[180px]">
                          <p className="text-xs font-medium text-gray-900 whitespace-nowrap">
                            {b.pickupTime} – {b.dropoffTime}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                            <MapPin size={10} className="text-gray-400 shrink-0" />
                            <span>{b.campusHub}</span>
                          </p>
                        </div>
                      </TableCell>

                      {/* Total Quote */}
                      <TableCell>
                        <span className="text-xs font-black text-gray-900">${b.totalCost.toFixed(2)}</span>
                      </TableCell>

                      {/* Return Photo & Timestamp */}
                      <TableCell>
                        {b.returnPhotoUrl ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={b.returnPhotoUrl}
                              alt="Return"
                              className="w-8 h-8 rounded-lg object-cover border border-emerald-300 ring-1 ring-emerald-200"
                            />
                            <div className="text-[10px] text-gray-600 leading-tight">
                              <span className="font-bold text-emerald-700 block">Uploaded</span>
                              <span className="text-gray-400 text-[9px] block whitespace-nowrap">
                                {b.returnPhotoTimestamp || b.returnTimestamp || "At return"}
                              </span>
                            </div>
                          </div>
                        ) : isReturned ? (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            Dropoff Logged
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* Status & Cancellation/Rejection Preview */}
                      <TableCell>
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1.5 border ${badge.className}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                            {badge.label}
                          </span>

                          {isCancelled && b.cancellationReason && (
                            <p className="text-[10px] text-slate-500 truncate max-w-[140px]" title={b.cancellationReason}>
                              Note: {b.cancellationReason}
                            </p>
                          )}

                          {isRejected && b.rejectionReason && (
                            <p className="text-[10px] text-rose-500 truncate max-w-[140px]" title={b.rejectionReason}>
                              Declined: {b.rejectionReason}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right pr-6">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 text-xs font-bold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 px-4 space-y-2">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800">No Historical Records Found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No bookings matched your filter selection. You can reset filters to view all current and completed campus reservations.
              </p>
            </div>
          )}
        </div>

        {/* Table Footer with Pagination & Page Size */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-gray-800">
                {filteredAndSorted.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-800">
                {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}
              </strong>{" "}
              of <strong className="text-gray-800">{filteredAndSorted.length}</strong> bookings
            </span>

            <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-200 pl-3">
              <span className="text-[11px] text-gray-400">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 text-xs font-bold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <AdminBookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onBookingUpdated={reload}
        />
      )}
    </div>
  );
}
