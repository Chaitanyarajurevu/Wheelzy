"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  MapPin,
  Menu,
  Zap,
  ChevronDown,
  LogOut,
  UserCheck,
  ExternalLink,
  ShieldAlert,
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
  const router = useRouter();
  const config = roleConfig[role];

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Load real notifications from dataStore
  const notifications = dataStore.getNotifications(role, user?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    dataStore.markAllNotificationsRead();
    setNotificationsOpen(false);
  };

  return (
    <header className="h-18 px-4 sm:px-8 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-30 font-sans shadow-xs">

      {/* Left: Mobile Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Brand mark for small screens when sidebar is hidden */}
        <Link href="/" className="md:hidden flex items-center gap-1.5 mr-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
            <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText} border border-emerald-200/50`}>
              {config.label}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Campus Node + Role Switcher + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Campus Location Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/70 border border-emerald-100 text-xs font-semibold text-emerald-900">
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
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto py-1">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`py-3 px-2 rounded-xl transition-colors ${item.read ? "opacity-75" : "bg-emerald-50/40"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-gray-900">{item.title}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                      {item.actionHref && (
                        <Link
                          href={item.actionHref}
                          onClick={() => setNotificationsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline mt-1.5"
                        >
                          View Action <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-gray-400">No notifications at this time.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white flex items-center justify-center text-xs font-black shadow-sm ring-2 ring-emerald-100">
              {user?.name ? user.name[0] : config.label[0]}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || config.label}</p>
              <p className="text-[10px] font-medium text-emerald-600">{config.label}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-emerald-50/60 rounded-2xl mb-2">
                <p className="text-xs font-bold text-gray-900">{user?.name || "Campus User"}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
                    {config.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified ID ✓
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href={role === "system_admin" ? "/admin/profile" : role === "owner" ? "/owner/profile" : "/renter/profile"}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <UserCheck size={14} />
                  <span>My Profile & Verification</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Return to Public Homepage</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
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
