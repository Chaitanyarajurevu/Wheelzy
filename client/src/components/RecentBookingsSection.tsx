"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
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
import AdminBookingDetailsModal, { getBookingStatusBadge } from "./AdminBookingDetailsModal";

interface RecentBookingsSectionProps {
  title?: string;
  subtitle?: string;
  itemsPerPage?: number;
  showViewAllLink?: boolean;
}

export default function RecentBookingsSection({
  title = "Recent Bookings",
  subtitle = "Real-time ledger of campus bike and scooter rental requests, live rides, and dropoff verifications.",
  itemsPerPage = 6,
  showViewAllLink = true,
}: RecentBookingsSectionProps) {
  const [bookings, setBookings] = useState<StoredBooking[]>(dataStore.getBookings());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<StoredBooking | null>(null);

  const reloadData = () => {
    setBookings(dataStore.getBookings());
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  // Filter and sort bookings (Most recent bookings first)
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // Most recent first by createdAt or ID
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    // 1. Search filter: booking ID, renter name, owner name, or vehicle registration number
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const idMatch = b.id.toLowerCase().includes(q);
        const renterMatch = b.renterName.toLowerCase().includes(q);
        const ownerMatch = b.ownerName.toLowerCase().includes(q);
        const vehicleMatch = b.vehicleName.toLowerCase().includes(q);
        const regMatch = b.vehicleRegistrationNumber?.toLowerCase().includes(q) || false;
        const campusMatch = b.campusHub.toLowerCase().includes(q);
        return idMatch || renterMatch || ownerMatch || vehicleMatch || regMatch || campusMatch;
      });
    }

    // 2. Status filter
    if (statusFilter !== "ALL") {
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

    // 3. Vehicle Type filter
    if (vehicleTypeFilter !== "ALL") {
      list = list.filter((b) => b.vehicleType === vehicleTypeFilter);
    }

    // 4. Date Range filter
    if (dateRangeFilter !== "ALL") {
      const now = new Date();
      list = list.filter((b) => {
        const bDate = new Date(b.createdAt);
        if (isNaN(bDate.getTime())) return true;
        const diffDays = (now.getTime() - bDate.getTime()) / (1000 * 3600 * 24);

        if (dateRangeFilter === "TODAY") {
          return diffDays <= 1;
        } else if (dateRangeFilter === "7DAYS") {
          return diffDays <= 7;
        } else if (dateRangeFilter === "30DAYS") {
          return diffDays <= 30;
        }
        return true;
      });
    }

    return list;
  }, [bookings, searchQuery, statusFilter, vehicleTypeFilter, dateRangeFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">{title}</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredBookings.length} {filteredBookings.length === 1 ? "Record" : "Records"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">{subtitle}</p>
        </div>

        {showViewAllLink && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings"
              className="px-4 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 text-xs font-bold border border-gray-200/80 transition-all flex items-center gap-2"
            >
              <BookOpen size={14} />
              <span>All Bookings / History</span>
            </Link>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search booking ID, renter, owner, or vehicle registration..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
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
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="RETURNED">RETURNED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REJECTED">REJECTED</option>
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
              <option value="ALL">All Vehicle Types</option>
              <option value="Electric Scooter">Electric Scooter</option>
              <option value="Motor Scooter">Motor Scooter</option>
              <option value="Hybrid Bicycle">Hybrid Bicycle</option>
              <option value="Motorcycle">Motorcycle</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Window:</span>
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today Only</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>

          {(statusFilter !== "ALL" || vehicleTypeFilter !== "ALL" || dateRangeFilter !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setVehicleTypeFilter("ALL");
                setDateRangeFilter("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-gray-500 hover:text-emerald-700 px-2 py-1 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table or Empty State */}
      <div className="overflow-x-auto">
        {paginatedBookings.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/70 border-b border-gray-100">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-700 py-3.5">Booking ID</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Vehicle</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Renter Name</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Owner Name</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Booking Date</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Start Date & Time</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">End Date & Time</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Booking Status</TableHead>
                <TableHead className="text-xs font-bold text-gray-700 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((b) => {
                const badge = getBookingStatusBadge(b.status);
                const bookingDateFormatted = new Date(b.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <TableRow key={b.id} className="hover:bg-emerald-50/25 transition-colors border-b border-gray-100/80">
                    {/* Booking ID */}
                    <TableCell className="font-mono text-xs font-bold text-emerald-700 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span>{b.id}</span>
                        {b.vehicleRegistrationNumber && (
                          <span className="text-[10px] text-gray-400 font-sans hidden xl:inline">
                            ({b.vehicleRegistrationNumber})
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Vehicle */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={b.vehicleImage}
                          alt={b.vehicleName}
                          className="w-10 h-8 rounded-lg object-cover border border-gray-100"
                        />
                        <div className="min-w-0 max-w-[180px]">
                          <p className="text-xs font-bold text-gray-900 truncate">{b.vehicleName}</p>
                          <p className="text-[10px] text-gray-500 truncate">{b.vehicleType}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Renter Name */}
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

                    {/* Owner Name */}
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

                    {/* Booking Date */}
                    <TableCell className="text-xs text-gray-700 whitespace-nowrap">
                      {bookingDateFormatted}
                    </TableCell>

                    {/* Start Date & Time */}
                    <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                      {b.pickupTime}
                    </TableCell>

                    {/* End Date & Time */}
                    <TableCell className="text-xs text-gray-800 font-medium whitespace-nowrap">
                      {b.dropoffTime}
                    </TableCell>

                    {/* Booking Status Badge */}
                    <TableCell>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1.5 border ${badge.className}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        {badge.label}
                      </span>
                    </TableCell>

                    {/* View Details Action */}
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
          <div className="text-center py-14 px-4 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-800">No Bookings Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No reservation records matched your search query or filter criteria. Try clearing search filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div>
          Showing{" "}
          <span className="font-bold text-gray-800">
            {filteredBookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-bold text-gray-800">
            {Math.min(currentPage * itemsPerPage, filteredBookings.length)}
          </span>{" "}
          of <span className="font-bold text-gray-800">{filteredBookings.length}</span> bookings
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

      {/* Full Modal Viewer */}
      {selectedBooking && (
        <AdminBookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onBookingUpdated={reloadData}
        />
      )}
    </div>
  );
}
