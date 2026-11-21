"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Car,
  BookOpen,
  AlertTriangle,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  ChevronRight,
  Eye,
  Check,
  X,
  UserCheck,
  UserX,
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

  const pendingVerifications = verifications.filter((v) =>
    v.status === "pending" &&
    (v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
     v.campus.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <div className="max-w-7xl mx-auto pb-12 space-y-6 font-sans">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Campus Security &amp; Operations
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor users, vehicles, rental activity, and compliance operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/verification"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <ShieldCheck size={13} />
            <span>Verification Center</span>
            {verifications.filter((v) => v.status === "pending").length > 0 && (
              <span className="bg-white text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {verifications.filter((v) => v.status === "pending").length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/vehicles"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Car size={13} />
            <span className="hidden sm:inline">Manage Vehicles</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          icon={BookOpen}
          trend="All-time"
          color="#059669"
          bg="#ECFDF5"
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
          label="Returned"
          value={stats.returnedBookings}
          icon={RotateCcw}
          trend="Photo dropoff"
          color="#0D9488"
          bg="#CCFBF1"
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

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Recent Bookings</h2>
          <Link
            href="/admin/recent-bookings"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            View All
            <ChevronRight size={13} />
          </Link>
        </div>
        <RecentBookingsSection
          title=""
          subtitle=""
          itemsPerPage={5}
          showViewAllLink={false}
        />
      </div>

      {/* Operational Tables */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

        {/* Tab Nav + Search */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg">
            <button
              onClick={() => setSelectedTab("verifications")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "verifications"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldCheck size={12} />
              <span>Verifications</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedTab === "verifications" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}>
                {verifications.filter((v) => v.status === "pending").length}
              </span>
            </button>
            <button
              onClick={() => setSelectedTab("users")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                selectedTab === "users"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setSelectedTab("reports")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTab === "reports"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>Reports</span>
              {stats.openReports > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  selectedTab === "reports" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"
                }`}>
                  {stats.openReports}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-52"
            />
          </div>
        </div>

        {/* Tab: Pending Verifications */}
        {selectedTab === "verifications" && (
          <div className="p-4">
            {pendingVerifications.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingVerifications.map((verif) => (
                    <div
                      key={verif.id}
                      className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/40 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={verif.userAvatar}
                            alt={verif.userName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{verif.userName}</p>
                            <p className="text-[10px] text-gray-500 truncate">{verif.campus}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 shrink-0">{verif.submittedAt}</span>
                      </div>

                      <div className="bg-white rounded-lg p-2.5 border border-gray-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-900 uppercase tracking-wide">
                            {verif.type === "student_id" ? "Student ID" : verif.type === "driving_license" ? "Driving License" : "Vehicle RC"}
                          </span>
                          <span className="font-mono text-emerald-700 text-[10px]">{verif.idNumber}</span>
                        </div>
                        <p className="text-[11px] text-gray-600">{verif.documentTitle}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedVerif(verif)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleRejectVerification(verif)}
                          className="py-1.5 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
                          title="Reject"
                        >
                          <X size={13} />
                        </button>
                        <button
                          onClick={() => handleApproveVerification(verif)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={12} />
                          <span>Approve</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing {pendingVerifications.length} pending review requests
                  </span>
                  <Link
                    href="/admin/verification"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    <span>Open Full Verification Center</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-gray-900">Verification Queue Clear</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  All student IDs, driving licenses, and vehicle certificates have been reviewed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: User Accounts */}
        {selectedTab === "users" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/60">
                <TableRow>
                  <TableHead className="text-[11px] font-semibold text-gray-500">User</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500">Role</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 hidden md:table-cell">Campus & Year</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 hidden sm:table-cell">Verifications</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-gray-500 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-emerald-50/20">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                        {u.role.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 hidden md:table-cell">
                      {u.campus}{u.collegeYear && ` · ${u.collegeYear}`}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          u.studentVerified ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          ID {u.studentVerified ? "✓" : "—"}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          u.licenseVerified ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          DL {u.licenseVerified ? "✓" : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {u.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleToggleUser(u)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          u.status === "active"
                            ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Tab: Reports & Complaints */}
        {selectedTab === "reports" && (
          <div className="divide-y divide-gray-50">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/40 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.status === "open"
                        ? "bg-rose-100 text-rose-800"
                        : report.status === "in_investigation"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {report.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-gray-900">{report.category}</span>
                    <span className="text-[11px] text-gray-400">{report.createdAt}</span>
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-1">{report.description}</p>
                  <p className="text-[11px] text-gray-500">
                    Filed by: <span className="font-semibold text-gray-700">{report.reporterName}</span>
                    {" "}({report.reporterRole}) · Target: {report.targetId}
                  </p>
                  {report.resolutionNotes && (
                    <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                      Resolution: {report.resolutionNotes}
                    </p>
                  )}
                </div>

                {report.status !== "resolved" && (
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shrink-0 cursor-pointer"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">No reports found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inspect Document Dialog */}
      {selectedVerif && (
        <Dialog open={!!selectedVerif} onOpenChange={() => setSelectedVerif(null)}>
          <DialogContent className="max-w-md rounded-2xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Document Inspection
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Uploaded document for {selectedVerif.userName} ({selectedVerif.campus})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-64 flex items-center justify-center">
                <img
                  src={selectedVerif.documentUrl}
                  alt={selectedVerif.documentTitle}
                  className="max-h-64 w-full object-cover"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Document Type:</span>
                  <span className="capitalize">{selectedVerif.type.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">ID / Certificate #:</span>
                  <span className="font-mono font-semibold">{selectedVerif.idNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-gray-700 shrink-0">MinIO Key:</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate">{selectedVerif.minioKey}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/admin/verification?tab=${selectedVerif.type === "student_id" ? "student" : selectedVerif.type === "driving_license" ? "license" : "vehicle"}`}
                onClick={() => setSelectedVerif(null)}
                className="py-2 px-3 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <span>Full Dossier</span>
                <ChevronRight size={13} />
              </Link>
              <button
                onClick={() => {
                  handleRejectVerification(selectedVerif);
                  setSelectedVerif(null);
                }}
                className="flex-1 py-2 px-3 rounded-lg border border-rose-200 text-rose-700 font-semibold text-xs hover:bg-rose-50 cursor-pointer"
              >
                Reject Document
              </button>
              <button
                onClick={() => {
                  handleApproveVerification(selectedVerif);
                  setSelectedVerif(null);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 cursor-pointer"
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
          <DialogContent className="max-w-md rounded-2xl bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Resolution Notes</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain resolution steps..."
                  rows={3}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="py-2 px-4 rounded-lg border border-gray-200 text-gray-600 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveReport}
                className="py-2 px-4 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800"
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
