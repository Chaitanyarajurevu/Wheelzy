"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Bike,
  GraduationCap,
  ArrowRight,
  PlusCircle,
  Clock,
  Camera,
  Settings,
  User,
  KeyRound,
  FileText,
  Sparkles,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function RoleHomeBanner() {
  const { user } = useAuth();

  if (!user) return null;

  const isRenter = user.role === "renter";
  const isOwner = user.role === "owner";
  const isAdmin = user.role === "system_admin";

  const scrollToExplore = () => {
    const el = document.getElementById("explore-rides");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041d16] via-[#072d22] to-[#041a14] border border-emerald-500/30 p-6 sm:p-8 shadow-2xl text-white">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: User Identity & Active Role Badge */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-2xl font-black shrink-0 shadow-inner">
              {isAdmin && <ShieldCheck className="w-8 h-8 text-emerald-400" />}
              {isOwner && <Bike className="w-8 h-8 text-emerald-400" />}
              {isRenter && <GraduationCap className="w-8 h-8 text-emerald-400" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAdmin && "Administrator Session"}
                  {isOwner && "Host & Owner Session"}
                  {isRenter && "Student Renter Session"}
                </span>
                <span className="text-xs text-white/60">
                  {user.campus ? `• ${user.campus}` : "• Campus Network"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Welcome back, {user.name}!
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5 max-w-xl">
                {isAdmin &&
                  "You are logged in as System Administrator. Review campus verifications, moderate disputes, and inspect system audit trails."}
                {isOwner &&
                  "You are logged in as a Campus Vehicle Host. Accept booking requests, manage your ride availability, and inspect vehicle return photos."}
                {isRenter &&
                  "You are logged in as a Student Renter. Explore available rides below, manage your active rentals, or check in return photos."}
              </p>
            </div>
          </div>

          {/* Right: Primary Role Dashboard CTA */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-center"
              >
                <span>Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isOwner && (
              <Link
                href="/owner/dashboard"
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-center"
              >
                <span>Owner Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isRenter && (
              <Link
                href="/renter/dashboard"
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-center"
              >
                <span>Renter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href={
                isAdmin
                  ? "/admin/profile"
                  : isOwner
                  ? "/owner/profile"
                  : "/renter/profile"
              }
              className="px-4 py-3 text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Profile</span>
            </Link>

            <Link
              href="/login"
              className="px-4 py-3 text-xs sm:text-sm font-semibold text-white/80 hover:text-emerald-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              title="Switch account or login with different credentials"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch / Login</span>
            </Link>
          </div>
        </div>

        {/* Bottom Quick Role Shortcuts Pill Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mr-1">
            Quick Actions:
          </span>

          {isRenter && (
            <>
              <button
                onClick={scrollToExplore}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Explore Campus Rides</span>
              </button>
              <Link
                href="/renter/return"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Return Vehicle</span>
              </Link>
              <Link
                href="/renter/notifications"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trip Notifications</span>
              </Link>
            </>
          )}

          {isOwner && (
            <>
              <Link
                href="/owner/add-vehicle"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-medium transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ List New Vehicle</span>
              </Link>
              <Link
                href="/owner/booking-requests"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Booking Requests</span>
              </Link>
              <Link
                href="/owner/return-tracking"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Return Photos</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin/bookings"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-medium transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Campus Verifications</span>
              </Link>
              <Link
                href="/admin/reports"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audit & System Reports</span>
              </Link>
              <Link
                href="/admin/settings"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 font-medium transition-colors flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-400" />
                <span>Platform Settings</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
