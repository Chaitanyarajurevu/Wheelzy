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
  Calendar,
  Inbox,
  Activity,
  RotateCcw,
  Search,
  CreditCard,
  XCircle,
  History,
  AlertTriangle,
  Compass,
  CheckSquare,
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
    { label: "Active Rides", href: "/owner/active-rides", icon: Zap, badge: "Live" },
    { label: "Host Profile", href: "/owner/profile", icon: UserCircle },
    { label: "My Vehicles", href: "/owner/my-vehicles", icon: Car },
    { label: "Add Vehicle", href: "/owner/add-vehicle", icon: PlusCircle },
    { label: "Document Upload", href: "/owner/documents", icon: FileText },
    { label: "Listing Management", href: "/owner/listings", icon: List },
    { label: "Pricing", href: "/owner/pricing", icon: DollarSign },
    { label: "Availability Calendar", href: "/owner/availability", icon: Calendar },
    { label: "Booking Requests", href: "/owner/booking-requests", icon: Inbox, badge: "New" },
    { label: "Return Tracking", href: "/owner/return-tracking", icon: RotateCcw },
    { label: "Notifications", href: "/owner/notifications", icon: Bell },
    { label: "Reports", href: "/owner/reports", icon: BarChart3 },
  ],
  renter: [
    { label: "Dashboard", href: "/renter/dashboard", icon: LayoutDashboard },
    { label: "My Active Ride", href: "/renter/active-rides", icon: Zap, badge: "Live" },
    { label: "Renter Profile", href: "/renter/profile", icon: UserCircle },
    { label: "Browse Vehicles", href: "/renter/browse", icon: Compass },
    { label: "Search & Filters", href: "/renter/search", icon: Search },
    { label: "My Bookings", href: "/renter/booking", icon: BookOpen },
    { label: "Booking Status", href: "/renter/booking-status", icon: Activity },
    { label: "Rental Cost", href: "/renter/rental-cost", icon: CreditCard },
    { label: "Cancellation", href: "/renter/cancellation", icon: XCircle },
    { label: "Return Vehicle", href: "/renter/return", icon: RotateCcw },
    { label: "Notifications", href: "/renter/notifications", icon: Bell },
    { label: "Report an Issue", href: "/renter/report", icon: AlertTriangle },
    { label: "Booking History", href: "/renter/history", icon: History },
    { label: "Student Verification", href: "/renter/college-verification", icon: ShieldCheck },
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
