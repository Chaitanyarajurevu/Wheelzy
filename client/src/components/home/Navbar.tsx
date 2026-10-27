"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Menu,
  X,
  LogIn,
  UserPlus,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rent a Ride", href: "#vehicles" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Safety", href: "#safety" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getProfileHref = () => {
    if (!user) return "/login";
    if (user.role === "system_admin") return "/admin/profile";
    if (user.role === "owner") return "/owner/profile";
    return "/renter/profile";
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "system_admin") return "/admin/dashboard";
    if (user.role === "owner") return "/owner/dashboard";
    return "/renter/dashboard";
  };

  const handleMobileNavClick = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main navbar bar — frosted glass */}
      <div className="bg-[#080f1c]/85 backdrop-blur-xl border-b border-emerald-500/[0.12] shadow-[0_1px_0_0_rgba(16,185,129,0.1),0_6px_32px_0_rgba(0,0,0,0.45)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-[72px] flex items-center justify-between gap-8">

          {/* ── Logo & Brand ── */}
          <Link
            href="/"
            className="flex items-center gap-4 text-white group select-none shrink-0"
          >
            {/* Icon box — permanent soft ring + strong hover glow */}
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500/30 group-hover:border-emerald-300/80 group-hover:ring-emerald-400/50 group-hover:shadow-[0_0_22px_rgba(52,211,153,0.45)] transition-all duration-200">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col leading-none gap-1">
              {/* Brand wordmark — much larger & heavier */}
              <span className="text-[1.55rem] font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
                Wheelzy
                <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              </span>
              {/* Tagline — crisper, brighter */}
              <span className="text-[9.5px] font-bold text-emerald-300/90 tracking-[0.24em] uppercase hidden sm:block">
                Book. Ride. Return.
              </span>
            </div>
          </Link>

          {/* ── Desktop Center Navigation ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-5 py-3 text-[1rem] font-semibold text-white/70 hover:text-emerald-300 rounded-lg transition-colors duration-200 group"
              >
                {link.label}
                {/* Sliding emerald underline */}
                <span className="absolute bottom-[7px] left-5 right-5 h-[2px] rounded-full bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}
          </nav>

          {/* ── Desktop Right: Auth Controls ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              /* ─ Logged-in: Profile dropdown ─ */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((o) => !o)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-[0.875rem] font-semibold text-white/85 hover:text-white hover:bg-white/[0.07] transition-all duration-200 border border-white/10 hover:border-emerald-500/35"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                >
                  <span className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-sm font-bold text-emerald-300 shrink-0">
                    {user.name[0].toUpperCase()}
                  </span>
                  <span className="max-w-[110px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Panel */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a1628]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(16,185,129,0.06)] py-1.5 overflow-hidden">
                    {/* User identity header */}
                    <div className="px-3 py-2 border-b border-white/[0.08]">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href={getProfileHref()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      My Profile
                    </Link>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      Dashboard
                    </Link>

                    <div className="border-t border-white/[0.08] mt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ─ Logged-out: Login + Sign Up ─ */
              <>
                {/* Ghost / outline Log In */}
                <Link
                  href="/login"
                  className="px-5 py-2 text-[0.875rem] font-semibold text-white/75 hover:text-emerald-300 border border-white/15 hover:border-emerald-500/45 hover:bg-emerald-500/[0.07] rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  Log In
                </Link>
                {/* Solid Sign Up */}
                <Link
                  href="/login?mode=signup"
                  className="px-5 py-2 text-[0.875rem] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-[0_0_18px_rgba(52,211,153,0.3)] active:scale-[0.97]"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile: Hamburger toggle ── */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            type="button"
            className="flex md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080f1c]/95 backdrop-blur-2xl border-b border-emerald-500/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <nav className="px-4 pt-2 pb-5 flex flex-col">
            {/* Nav Links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={handleMobileNavClick}
                className="px-3 py-3 text-[0.9375rem] font-semibold text-white/65 hover:text-emerald-300 hover:bg-emerald-500/[0.07] rounded-xl transition-all duration-150 border border-transparent hover:border-emerald-500/15"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth section */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-2.5 px-3 py-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center text-sm font-bold text-emerald-200 shrink-0">
                      {user.name[0].toUpperCase()}
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={getProfileHref()}
                    onClick={handleMobileNavClick}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    My Profile
                  </Link>

                  <Link
                    href={getDashboardHref()}
                    onClick={handleMobileNavClick}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      handleMobileNavClick();
                      logout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] rounded-lg transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={handleMobileNavClick}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white/75 hover:text-emerald-300 border border-white/12 hover:border-emerald-500/35 hover:bg-emerald-500/[0.06] rounded-xl transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    Log In
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    onClick={handleMobileNavClick}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-[0_0_18px_rgba(52,211,153,0.2)]"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
