"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  MapPin,
  Menu,
  Zap,
  ChevronDown,
  LogOut,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { type Role, roleConfig } from "@/lib/roles";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/dataStore";

interface DashboardHeaderProps {
  role: Role;
  title: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
}

export default function DashboardHeader({
  role,
  title,
  subtitle,
  onToggleMobileMenu,
}: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const config = roleConfig[role];

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Load real notifications from dataStore
  const notifications = dataStore.getNotifications(role, user?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const dashboardHomeHref =
    role === "system_admin"
      ? "/admin/dashboard"
      : role === "owner"
      ? "/owner/dashboard"
      : "/renter/dashboard";

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsRead();
    setNotificationsOpen(false);
  };

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-gray-100 bg-white shrink-0 sticky top-0 z-30">

      {/* Left: Mobile Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Brand mark for small screens when sidebar is hidden */}
        <Link href={dashboardHomeHref} className="md:hidden flex items-center gap-1.5 mr-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </Link>

        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500 leading-tight hidden sm:block mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Campus Pill + Notifications + User */}
      <div className="flex items-center gap-2.5">

        {/* Campus Location Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/70 border border-emerald-100 text-xs font-semibold text-emerald-800">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{user?.campus || "UC Berkeley Hub"}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
            className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 ${item.read ? "" : "bg-emerald-50/40"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                      {item.actionHref && (
                        <Link
                          href={item.actionHref}
                          onClick={() => setNotificationsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline mt-1"
                        >
                          View <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs text-gray-400">No notifications at this time.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.name ? user.name[0] : config.label[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || config.label}</p>
              <p className="text-[11px] font-semibold text-emerald-700 leading-tight mt-0.5">{config.label}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-900">{user?.name || "Campus User"}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{user?.email}</p>
                <span className="inline-flex mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {config.label}
                </span>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  href={role === "system_admin" ? "/admin/profile" : role === "owner" ? "/owner/profile" : "/renter/profile"}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <UserCheck size={14} />
                  <span>My Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
