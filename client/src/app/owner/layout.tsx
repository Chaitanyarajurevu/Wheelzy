"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import RoleGuard from "@/components/RoleGuard";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RoleGuard allowedRole="owner">
      <div className="flex h-screen overflow-hidden bg-[#F5F6F8] font-sans">
        <Sidebar
          role="owner"
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <DashboardHeader
            role="owner"
            title="Dashboard"
            subtitle="Manage your vehicles and rental activity"
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
