"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Role, roleNav, roleConfig } from "@/lib/roles";
import { cn } from "@/lib/utils";
import {
  Zap,
  X,
  ChevronUp,
  LogOut,
  User,
  Settings,
} from "lucide-react";
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
  const { user, logout } = useAuth();
  const [activeRideCount, setActiveRideCount] = useState<number>(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive display name and role label
  const displayName = user?.name || config.label;
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const roleLabel =
    role === "renter"
      ? "Student Renter"
      : role === "owner"
      ? "Vehicle Owner"
      : "System Admin";

  const profileHref =
    role === "system_admin"
      ? "/admin/profile"
      : role === "owner"
      ? "/owner/profile"
      : "/renter/profile";

  const settingsHref =
    role === "system_admin"
      ? "/admin/settings"
      : role === "owner"
      ? "/owner/profile"
      : "/renter/profile";

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
  };

  const dashboardHomeHref =
    role === "system_admin"
      ? "/admin/dashboard"
      : role === "owner"
      ? "/owner/dashboard"
      : "/renter/dashboard";

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#0A1F1A] text-gray-200 select-none border-r border-emerald-950/40">
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <Link href={dashboardHomeHref} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 group-hover:scale-105 transition-transform shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Wheelzy
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-emerald-400/80 uppercase">
              {config.sublabel}
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

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-900/40">
        {/* Nav section label */}
        <p className="text-[10px] font-bold tracking-widest text-emerald-500/60 uppercase px-2.5 pt-1 pb-1">
          Navigation
        </p>

        {items.map((item) => {
          const Icon = item.icon;
          const isSpecialActiveRides =
            item.href === "/owner/active-rides" || item.href === "/renter/active-rides";

          const isDashboard =
            item.href === "/admin/dashboard" ||
            item.href === "/owner/dashboard" ||
            item.href === "/renter/dashboard";

          const isProfile =
            item.href === "/renter/profile";

          let active = false;
          if (item.href === "/admin/dashboard") {
            active = pathname === "/admin" || pathname === "/admin/dashboard";
          } else if (item.href === "/owner/dashboard") {
            active = pathname === "/owner" || pathname === "/owner/dashboard";
          } else if (item.href === "/renter/dashboard") {
            active = pathname === "/renter" || pathname === "/renter/dashboard";
          } else if (item.href === "/owner/my-vehicles") {
            active =
              pathname === "/owner/my-vehicles" ||
              pathname === "/owner/listings" ||
              pathname === "/owner/add-vehicle" ||
              pathname === "/owner/pricing" ||
              pathname === "/owner/return-tracking" ||
              pathname?.startsWith("/owner/my-vehicles/");
          } else if (item.href === "/owner/active-rides") {
            active =
              pathname === "/owner/active-rides" ||
              pathname === "/owner/active-rentals";
          } else if (item.href === "/renter/booking") {
            active = pathname === "/renter/booking" || pathname?.startsWith("/renter/booking/");
          } else if (isProfile) {
            active =
              pathname === "/renter/profile" ||
              pathname === "/renter/college-verification" ||
              pathname === "/renter/driving-license";
          } else {
            active =
              pathname === item.href ||
              (!isDashboard &&
                item.href !== "/admin" &&
                item.href !== "/owner" &&
                item.href !== "/renter" &&
                pathname?.startsWith(item.href + "/"));
          }

          const badgeText = isSpecialActiveRides
            ? activeRideCount > 0
              ? `${activeRideCount}`
              : null
            : item.badge
            ? "●"
            : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3.5 px-3.5 py-2.5 min-h-[46px] rounded-xl text-sm font-medium transition-all duration-150 relative cursor-pointer select-none",
                active
                  ? "bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 shadow-xs font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-white/8 border border-transparent"
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r" />
              )}

              {/* Pulsing dot for active rides with live count */}
              {isSpecialActiveRides && activeRideCount > 0 && !active && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}

              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  active
                    ? "text-emerald-400"
                    : "text-gray-400 group-hover:text-emerald-400"
                )}
              />
              <span className="flex-1 truncate leading-none">{item.label}</span>

              {badgeText && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center",
                    active
                      ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                      : isSpecialActiveRides && activeRideCount > 0
                      ? "bg-emerald-500 text-white animate-pulse"
                      : "bg-emerald-900/60 text-emerald-400"
                  )}
                >
                  {badgeText}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Profile Section */}
      <div className="shrink-0 border-t border-white/5 pt-2">
        {/* Profile Section */}
        <div className="px-2.5 pb-3 relative" ref={profileRef}>
          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute bottom-full mb-1 left-2.5 right-2.5 bg-[#0F2920] border border-emerald-900/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-150">
              <div className="p-3 border-b border-white/5">
                <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                {user?.email && (
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                )}
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  href={profileHref}
                  onClick={() => { setProfileMenuOpen(false); onClose?.(); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <User size={13} className="text-emerald-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href={settingsHref}
                  onClick={() => { setProfileMenuOpen(false); onClose?.(); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <Settings size={13} className="text-emerald-400" />
                  <span>Account Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Trigger Button */}
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl border transition-all cursor-pointer",
              profileMenuOpen
                ? "bg-emerald-900/30 border-emerald-700/40"
                : "bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/12"
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm">
              {initials}
            </div>

            {/* Name + Role */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-200 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-emerald-400/80 font-medium truncate leading-tight">
                {roleLabel}
              </p>
            </div>

            {/* Chevron */}
            <ChevronUp
              size={13}
              className={cn(
                "text-gray-500 shrink-0 transition-transform duration-150",
                profileMenuOpen ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
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
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
