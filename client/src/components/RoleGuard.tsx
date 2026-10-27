"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { type Role, roleConfig } from "@/lib/roles";

interface RoleGuardProps {
  allowedRole: Role;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, loginAsRole } = useAuth();
  const [mounted, setMounted] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated || !user || user.role !== allowedRole) {
        if (!syncingRef.current) {
          syncingRef.current = true;
          loginAsRole(allowedRole);
        }
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, allowedRole, loginAsRole]);

  // Reset syncingRef if role matches
  useEffect(() => {
    if (user && user.role === allowedRole) {
      syncingRef.current = false;
    }
  }, [user, allowedRole]);

  if (!mounted || isLoading || !user || user.role !== allowedRole) {
    const targetConfig = roleConfig[allowedRole];
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFD] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500 animate-pulse">
            Connecting to {targetConfig.label} Portal...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
