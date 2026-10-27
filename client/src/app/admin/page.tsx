"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  GraduationCap,
  Car,
  BookOpen,
  AlertTriangle,
  Activity,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  ChevronRight,
  Shield,
  Eye,
  Check,
  X,
  ExternalLink,
  Sparkles,
  UserCheck,
  UserX,
  AlertCircle,
  Zap,
  RotateCcw,
} from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";
import RecentBookingsSection from "@/components/RecentBookingsSection";
import { dataStore, VerificationRequest, IncidentReport, User, StoredBooking } from "@/lib/dataStore";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(dataStore.getAdminStats());
  const [verifications, setVerifications] = useState(dataStore.getVerifications());
  const [bookings, setBookings] = useState(dataStore.getBookings());
  const [users, setUsers] = useState(dataStore.getUsers());
  const [reports, setReports] = useState(dataStore.getReports());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"verifications" | "users" | "reports">("verifications");

  // Dialog states
  const [selectedVerif, setSelectedVerif] = useState<VerificationRequest | null>(null);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const reloadData = () => {
    setStats(dataStore.getAdminStats());
    setVerifications(dataStore.getVerifications());
    setBookings(dataStore.getBookings());
    setUsers(dataStore.getUsers());
    setReports(dataStore.getReports());
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  // Admin Actions
  const handleApproveVerification = (verif: VerificationRequest) => {
    dataStore.reviewVerification(verif.id, "approved");
    toast.success(`Approved verification for ${verif.userName}`);
    reloadData();
  };

  const handleRejectVerification = (verif: VerificationRequest) => {
    dataStore.reviewVerification(verif.id, "rejected", "Document invalid or unclear.");
    toast.error(`Rejected verification for ${verif.userName}`);
    reloadData();
  };

  const handleToggleUser = (userItem: User) => {
    const updated = dataStore.toggleUserStatus(userItem.id);
    if (updated) {
      if (updated.status === "active") {
        toast.success(`Account for ${updated.name} has been activated.`);
      } else {
        toast.warning(`Account for ${updated.name} has been suspended.`);
      }
      reloadData();
    }
  };

  const handleResolveReport = () => {
    if (!selectedReport) return;
    dataStore.resolveReport(selectedReport.id, resolutionNote || "Resolved by system administrator inspection.");
    toast.success(`Complaint #${selectedReport.id} marked as resolved.`);
    setSelectedReport(null);
    setResolutionNote("");
    reloadData();
  };

  // Filtered views
  const pendingVerifications = verifications.filter((v) =>
    v.status === "pending" &&
    (v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.campus.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBookings = bookings.filter((b) =>
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.renterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.campus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = reports.filter((r) =>
    r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* 1. Admin Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#047857] text-white p-7 sm:p-9 shadow-xl border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SYSTEM ADMINISTRATOR CONTROL PLANE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Campus Fleet & Verification Operations
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Verify college student credentials, approve vehicle listings, manage active quad rentals, and oversee platform integrity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/student-verification"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 shadow-md transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Verify Students ({stats.pendingVerifications})</span>
            </Link>
            <Link
              href="/admin/vehicles"
              className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold text-xs hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-emerald-300" />
              <span>Manage Vehicles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Mandatory Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9 gap-3 sm:gap-4">
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          icon={BookOpen}
          trend="All-time ledger"
          color="#059669"
          bg="#ECFDF5"
        />
        <StatCard
          label="Recent Bookings"
          value={stats.recentBookings}
          icon={Activity}
          trend="Active window"
          color="#0284C7"
          bg="#E0F2FE"
        />
        <StatCard
          label="Active Rides"
          value={stats.activeRides}
          icon={Zap}
          trend="Live on campus"
          color="#10B981"
          bg="#D1FAE5"
          highlight={stats.activeRides > 0}
        />
        <StatCard
          label="Returned Bookings"
          value={stats.returnedBookings}
          icon={RotateCcw}
          trend="Photo dropoff"
          color="#0D9488"
          bg="#CCFBF1"
        />
        <StatCard
          label="Cancelled Bookings"
          value={stats.cancelledBookings}
          icon={XCircle}
          trend="Prior to trip"
          color="#64748B"
          bg="#F1F5F9"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingBookingRequests}
          icon={Clock}
          trend="Awaiting host"
          color="#D97706"
          bg="#FEF3C7"
          highlight={stats.pendingBookingRequests > 0}
        />
        <StatCard
          label="Pending Students"
          value={stats.pendingStudentVerifications}
          icon={GraduationCap}
          trend="KYC queue"
          color="#7C3AED"
          bg="#EDE9FE"
          highlight={stats.pendingStudentVerifications > 0}
        />
        <StatCard
          label="Pending Vehicles"
          value={stats.pendingVehicleVerifications}
          icon={Car}
          trend="RC & insurance"
          color="#2563EB"
          bg="#DBEAFE"
          highlight={stats.pendingVehicleVerifications > 0}
        />
        <StatCard
          label="Open Reports"
          value={stats.openReports}
          icon={AlertTriangle}
          trend="Active issues"
          color="#E11D48"
          bg="#FFF1F2"
          highlight={stats.openReports > 0}
        />
      </div>

      {/* 3. Prominent Recent Bookings Section */}
      <RecentBookingsSection
        title="Recent Bookings"
        subtitle="Live feed of campus peer-to-peer bike and scooter reservations, active trips, and handover verifications. Displays the most recent bookings first."
        itemsPerPage={6}
        showViewAllLink={true}
      />

      {/* 3. Operational Tables & Verification Action Center */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs & Search */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-2xl w-fit border border-gray-200/60">
            <button
              onClick={() => setSelectedTab("verifications")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedTab === "verifications"
                  ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>Pending Verifications</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedTab === "verifications" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}>
                {verifications.filter(v => v.status === "pending").length}
              </span>
            </button>



            <button
              onClick={() => setSelectedTab("users")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTab === "users"
                  ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              User Accounts ({users.length})
            </button>

            <button
              onClick={() => setSelectedTab("reports")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "reports"
                  ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>Complaints</span>
              {stats.openReports > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ride ID, campus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Tab 1: Pending Verifications Queue */}
        {selectedTab === "verifications" && (
          <div className="p-4 sm:p-6">
            {pendingVerifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingVerifications.map((verif) => (
                  <div
                    key={verif.id}
                    className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-white hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={verif.userAvatar}
                          alt={verif.userName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-100"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{verif.userName}</p>
                          <p className="text-xs text-gray-500">{verif.campus}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400">{verif.submittedAt}</span>
                    </div>

                    <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/60 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-900 uppercase tracking-wider">
                          {verif.type === "student_id" ? "Student ID" : verif.type === "driving_license" ? "Driving License" : "Vehicle RC"}
                        </span>
                        <span className="font-mono text-emerald-700">{verif.idNumber}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium">{verif.documentTitle}</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{verif.minioKey}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedVerif(verif)}
                        className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => handleRejectVerification(verif)}
                        className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                        title="Reject Document"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => handleApproveVerification(verif)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-gray-900">Verification Queue Clear</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  All student IDs, driving licenses, and vehicle certificates have been reviewed.
                </p>
              </div>
            )}
          </div>
        )}



        {/* Tab 3: Recently Registered Users Table */}
        {selectedTab === "users" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/70">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gray-700">User</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Role</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Campus & Year</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Verifications</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700">Account Status</TableHead>
                  <TableHead className="text-xs font-bold text-gray-700 text-right">Moderation Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-emerald-50/30">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{u.name}</p>
                          <p className="text-[11px] text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                        {u.role.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {u.campus} {u.collegeYear && `· ${u.collegeYear}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          u.studentVerified ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          ID {u.studentVerified ? "✓" : "—"}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          u.licenseVerified ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          DL {u.licenseVerified ? "✓" : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleToggleUser(u)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          u.status === "active"
                            ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {u.status === "active" ? "Suspend Account" : "Activate Account"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tab 4: Complaints & Reports */}
        {selectedTab === "reports" && (
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        report.status === "open"
                          ? "bg-rose-100 text-rose-800"
                          : report.status === "in_investigation"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {report.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{report.category}</span>
                      <span className="text-xs text-gray-400">· {report.createdAt}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700">{report.description}</p>
                    <p className="text-xs text-gray-500">
                      Filed by: <span className="font-semibold text-gray-900">{report.reporterName}</span> ({report.reporterRole}) · Target: {report.targetId}
                    </p>
                    {report.resolutionNotes && (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                        Resolution: {report.resolutionNotes}
                      </p>
                    )}
                  </div>

                  {report.status !== "resolved" && (
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      Resolve Incident
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Inspect Document Dialog */}
      {selectedVerif && (
        <Dialog open={!!selectedVerif} onOpenChange={() => setSelectedVerif(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Document Inspection
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Uploaded document for {selectedVerif.userName} ({selectedVerif.campus})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-64 flex items-center justify-center">
                <img
                  src={selectedVerif.documentUrl}
                  alt={selectedVerif.documentTitle}
                  className="max-h-64 w-full object-cover"
                />
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-900">Document Type:</span>
                  <span className="capitalize">{selectedVerif.type.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-900">ID / Certificate #:</span>
                  <span className="font-mono font-semibold">{selectedVerif.idNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-900">MinIO Storage Key:</span>
                  <span className="font-mono text-[10px] text-gray-600">{selectedVerif.minioKey}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => {
                  handleRejectVerification(selectedVerif);
                  setSelectedVerif(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-50"
              >
                Reject Document
              </button>
              <button
                onClick={() => {
                  handleApproveVerification(selectedVerif);
                  setSelectedVerif(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
              >
                Approve Document
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Resolve Incident Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Resolve Incident Report
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Category: {selectedReport.category} · Reporter: {selectedReport.reporterName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {selectedReport.description}
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain resolution steps (e.g., student credited, vehicle sent for brake inspection)..."
                  rows={3}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveReport}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700"
              >
                Mark as Resolved
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
