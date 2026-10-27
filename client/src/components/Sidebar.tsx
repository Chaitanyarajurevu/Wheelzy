"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Role, roleNav, roleConfig } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { ChevronRight, Zap, ArrowLeft, X, Sparkles, ShieldCheck, Activity } from "lucide-react";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = roleNav[role];
  const config = roleConfig[role];
  const { user } = useAuth();
  const [activeRideCount, setActiveRideCount] = useState<number>(0);

  useEffect(() => {
    const updateCounts = () => {
      if (role === "owner") {
        const ownerId = user && user.role === "owner" ? user.id : "usr-owner-marcus";
        const count = dataStore.getOwnerBookings(ownerId).filter((b) => b.status === "active").length;
        setActiveRideCount(count);
      } else if (role === "renter") {
        const renterId = user && user.role === "renter" ? user.id : "usr-renter-priya";
        const count = dataStore.getRenterBookings(renterId).filter((b) => b.status === "active").length;
        setActiveRideCount(count);
      }
    };
    updateCounts();
    window.addEventListener("wheelzy-store-update", updateCounts);
    return () => window.removeEventListener("wheelzy-store-update", updateCounts);
  }, [role, user]);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#0A1F1A] text-gray-200 select-none border-r border-emerald-950/40">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                Wheelzy
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase mt-0.5 flex items-center gap-1">
              <span>{config.label}</span>
            </p>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role Pill Banner */}
      <div className="px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/20 flex items-center justify-between text-[11px]">
        <span className="text-gray-400 font-medium">{config.sublabel}</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Live Node
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin scrollbar-thumb-emerald-900/40">
        {items.map((item) => {
          const Icon = item.icon;
          const isSpecialActiveRides =
            item.href === "/owner/active-rides" || item.href === "/renter/active-rides";

          // Exact match or sub-path match
          const isDashboard =
            item.href === "/admin/dashboard" ||
            item.href === "/owner/dashboard" ||
            item.href === "/renter/dashboard";

          const active =
            pathname === item.href ||
            (item.href === "/admin/dashboard" && (pathname === "/admin" || pathname === "/admin/dashboard")) ||
            (item.href === "/owner/dashboard" && (pathname === "/owner" || pathname === "/owner/dashboard")) ||
            (item.href === "/renter/dashboard" && (pathname === "/renter" || pathname === "/renter/dashboard")) ||
            (!isDashboard &&
              item.href !== "/admin" &&
              item.href !== "/owner" &&
              item.href !== "/renter" &&
              pathname?.startsWith(item.href));

          // Dynamic badge label for active rides item
          const badgeText = isSpecialActiveRides
            ? activeRideCount > 0
              ? `${activeRideCount} Active`
              : "0 Active"
            : item.badge;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative",
                isSpecialActiveRides && active
                  ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-300/40"
                  : isSpecialActiveRides && activeRideCount > 0
                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/70 hover:text-white"
                    : active
                      ? "bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 text-white shadow-md shadow-emerald-950/40"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {/* Active Ride Pulsing Dot when live count > 0 */}
              {isSpecialActiveRides && activeRideCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}

              <Icon
                size={16}
                className={cn(
                  "shrink-0 transition-colors",
                  isSpecialActiveRides && active
                    ? "text-emerald-100 fill-emerald-300/30 animate-pulse"
                    : isSpecialActiveRides && activeRideCount > 0
                      ? "text-emerald-400"
                      : active
                        ? "text-emerald-300"
                        : "text-gray-400 group-hover:text-emerald-300"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>

              {badgeText && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full transition-all",
                    isSpecialActiveRides && active
                      ? "bg-white text-emerald-900 shadow-xs"
                      : isSpecialActiveRides && activeRideCount > 0
                        ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 animate-pulse"
                        : active
                          ? "bg-white/20 text-white"
                          : "bg-emerald-900/50 text-emerald-300 border border-emerald-700/40"
                  )}
                >
                  {badgeText}
                </span>
              )}

              {active && <ChevronRight size={14} className="text-emerald-200 shrink-0 ml-1" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Return to Homepage & Campus Info */}
      <div className="p-4 border-t border-white/5 bg-[#061411] space-y-3">
        {/* Switch Portal Quick Links */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
            Switch Portal
          </p>
          <div className="grid grid-cols-3 gap-1">
            <Link
              href="/renter/dashboard"
              className={cn(
                "px-2 py-1.5 rounded-lg text-center text-[10px] font-bold transition-all truncate",
                role === "renter"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              🎓 Renter
            </Link>
            <Link
              href="/owner/dashboard"
              className={cn(
                "px-2 py-1.5 rounded-lg text-center text-[10px] font-bold transition-all truncate",
                role === "owner"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              🚲 Owner
            </Link>
            <Link
              href="/admin/dashboard"
              className={cn(
                "px-2 py-1.5 rounded-lg text-center text-[10px] font-bold transition-all truncate",
                role === "system_admin"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              🛡️ Admin
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-3 pt-1 px-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-300 shrink-0">
            {config.label[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">UC Berkeley Hub</p>
            <p className="text-emerald-300/80 text-[10px] truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Verified Quad Network
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Visible when isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
