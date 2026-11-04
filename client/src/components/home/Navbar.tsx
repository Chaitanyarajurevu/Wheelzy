"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rent a Ride", href: "/#vehicles" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Safety", href: "/#safety" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (typeof window === "undefined") return;

    if (href === "/") {
      if (window.location.pathname === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (href.startsWith("/#") || href.startsWith("#")) {
      const hash = href.startsWith("/#") ? href.substring(1) : href;
      const targetId = hash.replace("#", "");

      if (window.location.pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          const navbarHeight = 85;
          const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
          window.history.pushState(null, "", hash);
        }
      }
    }
  };

  const handleMobileNavClick = (e?: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    setMobileMenuOpen(false);
    if (e && href) {
      handleNavClick(e, href);
    }
  };

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
            {/* Icon box */}
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500/30 group-hover:border-emerald-300/80 group-hover:ring-emerald-400/50 group-hover:shadow-[0_0_22px_rgba(52,211,153,0.45)] transition-all duration-200">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col leading-none gap-1">
              {/* Brand wordmark */}
              <span className="text-[1.55rem] font-black tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
                Wheelzy
                <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              </span>
              {/* Tagline */}
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
                onClick={(e) => handleNavClick(e, link.href)}
                className="relative px-5 py-3 text-[1rem] font-semibold text-white/70 hover:text-emerald-300 rounded-lg transition-colors duration-200 group"
              >
                {link.label}
                {/* Sliding emerald underline */}
                <span className="absolute bottom-[7px] left-5 right-5 h-[2px] rounded-full bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}
          </nav>

          {/* ── Desktop Right: Public Auth Buttons ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-5 py-2 text-[0.875rem] font-semibold text-white/75 hover:text-emerald-300 border border-white/15 hover:border-emerald-500/45 hover:bg-emerald-500/[0.07] rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              Log In
            </Link>
            <Link
              href="/login?mode=signup"
              className="px-5 py-2 text-[0.875rem] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-[0_0_18px_rgba(52,211,153,0.3)] active:scale-[0.97] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </div>

          {/* ── Mobile: Hamburger toggle ── */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            type="button"
            className="flex md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
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
        <div className="md:hidden bg-[#0a1628]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleMobileNavClick(e, link.href)}
                className="px-3 py-2.5 text-base font-semibold text-white/80 hover:text-emerald-300 rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => handleMobileNavClick()}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white/85 hover:text-white border border-white/15 rounded-xl hover:bg-white/[0.05] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              Log In
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={() => handleMobileNavClick()}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
