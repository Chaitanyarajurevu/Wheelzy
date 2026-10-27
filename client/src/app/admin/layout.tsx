"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import RoleGuard from "@/components/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RoleGuard allowedRole="system_admin">
      <div className="flex h-screen overflow-hidden bg-[#FAFAFD] font-sans">
        <Sidebar
          role="system_admin"
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <DashboardHeader
            role="system_admin"
            title="System Admin Control Plane"
            subtitle="Campus safety, verification & fleet moderation"
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
