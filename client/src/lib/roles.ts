import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileCheck,
  Car,
  CalendarClock,
  BookOpen,
  BarChart3,
  Bell,
  ScrollText,
  Settings,
  UserCircle,
  PlusCircle,
  FileText,
  List,
  DollarSign,
  Inbox,
  Activity,
  RotateCcw,
  AlertTriangle,
  Compass,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Role = "system_admin" | "owner" | "renter";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const roleNav: Record<Role, NavItem[]> = {
  system_admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Student Verification", href: "/admin/student-verification", icon: GraduationCap, badge: "Pending" },
    { label: "Driving License Verification", href: "/admin/license-verification", icon: FileCheck },
    { label: "Vehicle Verification", href: "/admin/vehicle-verification", icon: Car },
    { label: "Vehicle Management", href: "/admin/vehicles", icon: CalendarClock },
    { label: "Recent Bookings", href: "/admin/recent-bookings", icon: Activity, badge: "Recent" },
    { label: "All Bookings / Booking History", href: "/admin/bookings", icon: BookOpen },
    { label: "Reports & Complaints", href: "/admin/reports", icon: AlertTriangle },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ],
  owner: [
    { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { label: "My Vehicle", href: "/owner/my-vehicles", icon: Car },
    { label: "Booking Requests", href: "/owner/booking-requests", icon: Inbox, badge: "New" },
    { label: "Active Rides", href: "/owner/active-rides", icon: Zap, badge: "Live" },
    { label: "Notifications", href: "/owner/notifications", icon: Bell },
    { label: "Profile & Verification", href: "/owner/profile", icon: ShieldCheck },
  ],
  renter: [
    { label: "Dashboard", href: "/renter/dashboard", icon: LayoutDashboard },
    { label: "Find a Ride", href: "/renter/browse", icon: Compass },
    { label: "My Active Ride", href: "/renter/active-rides", icon: Zap, badge: "Live" },
    { label: "My Bookings", href: "/renter/booking", icon: BookOpen },
    { label: "Notifications", href: "/renter/notifications", icon: Bell },
    { label: "Profile & Verification", href: "/renter/profile", icon: ShieldCheck },
  ],
};

export const roleConfig: Record<
  Role,
  {
    label: string;
    sublabel: string;
    primary: string;
    accent: string;
    highlight: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  system_admin: {
    label: "System Admin",
    sublabel: "Platform Command Center",
    primary: "#059669", // Emerald
    accent: "#10B981",  // Green
    highlight: "#34D399", // Light Emerald
    gradient: "from-[#064E3B] via-[#065F46] to-[#047857]",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
  owner: {
    label: "Vehicle Owner",
    sublabel: "Host & Fleet Management",
    primary: "#047857", // Deep Emerald
    accent: "#10B981",  // Emerald
    highlight: "#6EE7B7", // Light Green
    gradient: "from-[#022C22] via-[#064E3B] to-[#065F46]",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
  renter: {
    label: "Student Renter",
    sublabel: "Campus Ride Portal",
    primary: "#10B981", // Emerald
    accent: "#34D399",  // Light Emerald
    highlight: "#6EE7B7", // Soft Green
    gradient: "from-[#022C22] via-[#064E3B] to-[#059669]",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
};
