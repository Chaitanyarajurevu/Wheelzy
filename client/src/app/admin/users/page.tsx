"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  MapPin,
  Filter,
  Eye,
  GraduationCap,
  ShieldCheck,
  Car,
  FileCheck2,
} from "lucide-react";
import { dataStore, User } from "@/lib/dataStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { AdminUserProfileModal } from "@/components/AdminUserProfileModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(dataStore.getUsers());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const reload = () => setUsers(dataStore.getUsers());

  useEffect(() => {
    const handleUpdate = () => reload();
    window.addEventListener("wheelzy-store-update", handleUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
  }, []);

  const handleToggle = (userItem: User) => {
    const updated = dataStore.toggleUserStatus(userItem.id);
    if (updated) {
      toast.success(
        updated.status === "active"
          ? `${updated.name}'s account has been activated.`
          : `${updated.name}'s account has been suspended.`
      );
      reload();
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase()) &&
      !u.campus.toLowerCase().includes(search.toLowerCase()) &&
      !(u.studentIdNumber && u.studentIdNumber.toLowerCase().includes(search.toLowerCase())) &&
      !(u.aadhaarNumber && u.aadhaarNumber.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Directory &amp; Verification Dossiers</h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete database of student renters, vehicle owners, and admins. Click any user to inspect their full profile, photos, and document proofs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, SID, Aadhaar, campus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-500 font-semibold hidden md:inline">Role Filter:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="renter">Student Renters ({users.filter(u => u.role === "renter").length})</option>
              <option value="owner">Vehicle Hosts / Owners ({users.filter(u => u.role === "owner").length})</option>
              <option value="system_admin">System Admins ({users.filter(u => u.role === "system_admin").length})</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/70">
              <TableRow>
                <TableHead className="text-xs font-bold text-gray-700">User</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Role</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Campus / Dept</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Contact</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">KYC Proofs</TableHead>
                <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                <TableHead className="text-xs font-bold text-gray-700 text-right">Profile &amp; Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-emerald-50/20 transition-colors">
                  {/* User info */}
                  <TableCell>
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelectedUserId(u.id)}
                    >
                      <img
                        src={u.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-50 hover:ring-emerald-400 transition-all"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900 hover:text-emerald-700 transition-colors">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role badge */}
                  <TableCell>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                      {u.role.replace("_", " ")}
                    </span>
                  </TableCell>

                  {/* Campus / Dept */}
                  <TableCell className="text-xs text-gray-700">
                    <p className="font-semibold text-gray-800">{u.campus}</p>
                    <p className="text-[11px] text-gray-400">{u.collegeYear || "Undergraduate"}</p>
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="text-xs text-gray-600 font-mono">{u.phone}</TableCell>

                  {/* KYC Verification Badges (Student ID, Aadhaar, License) */}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          u.studentVerified
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        title={u.studentIdNumber || "No Student ID"}
                      >
                        SID {u.studentVerified ? "✓" : "✗"}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          u.aadhaarVerified
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        title={u.aadhaarNumber || "No Aadhaar"}
                      >
                        Aadhaar {u.aadhaarVerified ? "✓" : "✗"}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          u.licenseVerified
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        title={u.drivingLicenseNumber || "No License"}
                      >
                        DL {u.licenseVerified ? "✓" : "✗"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Account Status */}
                  <TableCell>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </TableCell>

                  {/* Actions: View Profile & Documents + Toggle Status */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye size={12} />
                        <span>View Profile &amp; Documents</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(u)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          u.status === "active"
                            ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                        title={u.status === "active" ? "Suspend user account" : "Activate user account"}
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Universal User Profile & All Documents Inspector Modal */}
      <AdminUserProfileModal
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        userId={selectedUserId}
        onUserUpdated={reload}
      />
    </div>
  );
}
