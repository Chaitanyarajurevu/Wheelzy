"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { type Role, roleConfig } from "@/lib/roles";

interface RoleGuardProps {
  allowedRole: Role;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated || !user) {
        // Unauthenticated visitor attempting to access dashboard -> redirect to login
        router.replace("/login");
      } else if (user.role !== allowedRole) {
        // Authenticated user with mismatched role -> redirect to their own dashboard
        if (user.role === "system_admin") {
          router.replace("/admin/dashboard");
        } else if (user.role === "owner") {
          router.replace("/owner/dashboard");
        } else {
          router.replace("/renter/dashboard");
        }
      }
    }
  }, [mounted, isLoading, isAuthenticated, user, allowedRole, router]);

  if (!mounted || isLoading || !user || user.role !== allowedRole) {
    const targetConfig = roleConfig[allowedRole] || { label: "Campus Portal" };
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFD] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500 animate-pulse">
            Verifying {targetConfig.label} Access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
