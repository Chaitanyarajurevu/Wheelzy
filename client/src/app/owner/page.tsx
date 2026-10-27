"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Car,
    PlusCircle,
    Calendar,
    DollarSign,
    TrendingUp,
    Star,
    Activity,
    Inbox,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ShieldCheck,
    Camera,
    MapPin,
    Eye,
    Key,
    Sparkles,
    Zap,
    Check,
    X,
    RotateCcw,
    User,
    Phone,
    GraduationCap,
} from "lucide-react";
import { StatCard } from "@/components/DashboardWidgets";
import { dataStore, StoredVehicle, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { StudentIdPreviewModal, StudentIdParticipant } from "@/components/StudentIdPreviewModal";
import { InPlatformCallModal } from "@/components/InPlatformCallModal";
import { ActiveRideCard } from "@/components/ActiveRideCard";

export default function OwnerDashboardPage() {
    const { user } = useAuth();
    const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";

    const [stats, setStats] = useState(dataStore.getOwnerStats(ownerId));
    const [vehicles, setVehicles] = useState(dataStore.getOwnerVehicles(ownerId));
    const [bookings, setBookings] = useState(dataStore.getOwnerBookings(ownerId));

    // Dialogs
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const [inspectBooking, setInspectBooking] = useState<StoredBooking | null>(null);
    const [inspectedParticipant, setInspectedParticipant] = useState<StudentIdParticipant | null>(null);
    const [callModalBooking, setCallModalBooking] = useState<StoredBooking | null>(null);

    const handleInspectKyc = (b: StoredBooking) => {
        const renterUser = dataStore.getUserById(b.renterId);
        setInspectedParticipant({
            name: b.renterName,
            avatar: b.renterAvatar,
            campus: b.renterCampus,
            role: "renter",
            studentIdNumber: b.renterStudentIdNumber || renterUser?.studentIdNumber || "SID-UCB-2024-99214",
            studentIdUrl: b.renterStudentIdUrl || renterUser?.studentIdCardUrl || "/student_id_proof.svg",
            studentVerified: b.renterStudentVerified ?? renterUser?.studentVerified ?? true,
            bookingId: b.id,
            vehicleName: b.vehicleName,
        });
    };

    // New vehicle form state
    const [newName, setNewName] = useState("");
    const [newModel, setNewModel] = useState("");
    const [newCategory, setNewCategory] = useState<"Bike" | "Scooter">("Scooter");
    const [newType, setNewType] = useState<StoredVehicle["vehicleType"]>("Electric Scooter");
    const [newCampus, setNewCampus] = useState(user?.campus || "UC Berkeley");
    const [newHub, setNewHub] = useState("Sproul Plaza Hub");
    const [newPrice, setNewPrice] = useState("4.00");
    const [newRcNumber, setNewRcNumber] = useState("");

    const reloadData = () => {
        setStats(dataStore.getOwnerStats(ownerId));
        setVehicles(dataStore.getOwnerVehicles(ownerId));
        setBookings(dataStore.getOwnerBookings(ownerId));
    };

    useEffect(() => {
        reloadData();
        const handleUpdate = () => reloadData();
        window.addEventListener("wheelzy-store-update", handleUpdate);
        return () => window.removeEventListener("wheelzy-store-update", handleUpdate);
    }, [ownerId]);

    // Actions
    const handleAcceptRequest = (booking: StoredBooking) => {
        dataStore.updateBookingStatus(booking.id, "active");
        toast.success(`Booking ${booking.id} accepted! Ride is now active.`);
        reloadData();
    };

    const handleRejectRequest = (booking: StoredBooking) => {
        dataStore.updateBookingStatus(booking.id, "cancelled");
        toast.error(`Booking request ${booking.id} declined.`);
        reloadData();
    };

    const handleConfirmReturnInspection = (booking: StoredBooking) => {
        dataStore.updateBookingStatus(booking.id, "completed");
        toast.success(`Return verified! ${booking.vehicleName} is back in your available fleet.`);
        setInspectBooking(null);
        reloadData();
    };

    const handleCreateVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newModel || !newPrice) {
            toast.error("Please fill in required fields");
            return;
        }

        let defaultImg = "/scooter_xiaomi.jpg";
        if (newCategory === "Bike") defaultImg = "/bike_trek.jpg";

        dataStore.addVehicle({
            name: newName,
            model: newModel,
            category: newCategory,
            vehicleType: newType,
            campus: newCampus,
            locationHub: newHub,
            hourlyPrice: parseFloat(newPrice),
            imageUrl: defaultImg,
            isAvailable: false,
            status: "pending_approval", // Pending admin review per rule
            ownerId: ownerId,
            ownerName: user?.name || "Marcus Vance",
            ownerCollege: user?.collegeYear ? `${newCampus} · ${user.collegeYear}` : newCampus,
            ownerAvatar: user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            features: ["Verified Lock", "Helmet Included", "Campus Geofenced"],
            documents: {
                rcNumber: newRcNumber || `RC-${Math.floor(10000 + Math.random() * 90000)}`,
                rcMinioKey: `minio://wheelzy-docs/vehicles/rc_${Date.now()}.pdf`,
                insuranceExpiry: "2027-12-31",
                verified: false,
            },
        });

        toast.success("Vehicle registered! Sent to campus administration for RC approval.");
        setIsAddVehicleOpen(false);
        setNewName("");
        setNewModel("");
        setNewRcNumber("");
        reloadData();
    };

    const pendingRequests = bookings.filter((b) => b.status === "pending");
    const activeRentals = bookings.filter((b) => b.status === "active");
    const returnedRentals = bookings.filter((b) => b.status === "returned");

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">

            {/* 1. Host Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#065F46] text-white p-7 sm:p-9 shadow-xl border border-emerald-500/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-white/15">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span>CAMPUS VEHICLE HOST DASHBOARD</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                            Manage Your Campus Ride Fleet
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                            Earn peer-to-peer revenue, review student booking requests, track active rentals, and inspect returned rides with verified photo timestamps.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsAddVehicleOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4 text-emerald-700" />
                            <span>Add Vehicle</span>
                        </button>
                        <Link
                            href="/owner/availability"
                            className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold text-xs hover:bg-white/20 border border-white/20 transition-all flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4 text-emerald-300" />
                            <span>Availability Schedule</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Six Mandatory Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <StatCard
                    label="Total Vehicles"
                    value={stats.totalVehicles}
                    icon={Car}
                    trend="In your fleet"
                    color="#059669"
                    bg="#ECFDF5"
                />
                <StatCard
                    label="Available"
                    value={stats.availableVehicles}
                    icon={CheckCircle2}
                    trend="Ready to rent"
                    color="#10B981"
                    bg="#ECFDF5"
                />
                <StatCard
                    label="Pending Approval"
                    value={stats.pendingApproval}
                    icon={Clock}
                    trend="Admin RC check"
                    color="#D97706"
                    bg="#FFFBEB"
                    highlight={stats.pendingApproval > 0}
                />
                <StatCard
                    label="Booking Requests"
                    value={stats.bookingRequests}
                    icon={Inbox}
                    trend="Needs response"
                    color="#059669"
                    bg="#ECFDF5"
                    highlight={stats.bookingRequests > 0}
                />
                <StatCard
                    label="Active Rentals"
                    value={stats.activeRentals}
                    icon={Activity}
                    trend="Live on campus"
                    color="#10B981"
                    bg="#D1FAE5"
                    highlight={stats.activeRentals > 0}
                />
                <StatCard
                    label="Returned / Done"
                    value={stats.completedReturnedRentals}
                    icon={RotateCcw}
                    trend="Inspected"
                    color="#059669"
                    bg="#ECFDF5"
                />
            </div>

            {/* 2.5 PROMINENT ACTIVE RIDES HIGHLIGHT SECTION */}
            {activeRentals.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
                                <span>Active Rides in Progress ({activeRentals.length})</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Live on Campus
                                </span>
                            </h2>
                        </div>
                        <Link
                            href="/owner/active-rides"
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                        >
                            <span>Manage in Active Rides Hub</span>
                            <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {activeRentals.map((rental) => (
                            <ActiveRideCard
                                key={rental.id}
                                booking={rental}
                                viewerRole="owner"
                                onInitiateCall={(b) => setCallModalBooking(b)}
                                onViewStudentId={(p) => setInspectedParticipant(p)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Urgent Action Section: Booking Requests (Accept / Reject) */}
            {pendingRequests.length > 0 && (
                <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <h2 className="text-base font-bold text-gray-900">
                                Incoming Booking Requests ({pendingRequests.length})
                            </h2>
                        </div>
                        <span className="text-xs text-gray-500">Respond within 30 minutes</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingRequests.map((req) => (
                            <div
                                key={req.id}
                                className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between gap-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={req.renterAvatar}
                                                alt=""
                                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-200"
                                            />
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{req.renterName}</h4>
                                                <p className="text-xs text-gray-500">{req.renterCampus}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-100 shadow-2xs">
                                            ${req.totalCost.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border border-emerald-100/70 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 font-medium">Requested Ride:</span>
                                            <span className="font-bold text-gray-900">{req.vehicleName}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 font-medium">Campus Pickup Hub:</span>
                                            <span className="font-semibold text-emerald-700">{req.campusHub}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 font-medium">Slot & Duration:</span>
                                            <span className="font-medium text-gray-800">{req.pickupTime} ({req.durationHours} hrs)</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleInspectKyc(req)}
                                    className="w-full py-2 px-3 rounded-xl border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                    title="Inspect College Student ID Proof"
                                >
                                    <GraduationCap size={14} className="text-emerald-600" />
                                    <span>View Student ID Proof</span>
                                </button>

                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() => handleRejectRequest(req)}
                                        className="flex-1 py-2 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleAcceptRequest(req)}
                                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <Check size={14} />
                                        <span>Accept Request</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Active Rentals & Return Tracking Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Active Rentals Panel */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-base font-bold text-gray-900">Active Campus Rentals</h2>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            {activeRentals.length} Live
                        </span>
                    </div>

                    {activeRentals.length > 0 ? (
                        <div className="space-y-4">
                            {activeRentals.map((item) => (
                                <div key={item.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={item.vehicleImage} alt="" className="w-12 h-10 rounded-xl object-cover" />
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-900">{item.vehicleName}</h4>
                                                <p className="text-[11px] text-gray-500">Rented by {item.renterName}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            ON RIDE
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-gray-400">Unlock Code</p>
                                            <p className="font-mono font-bold text-emerald-900">{item.digitalUnlockCode || "WHZ-9281"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400">Scheduled Due Time</p>
                                            <p className="font-semibold text-gray-800">{item.dropoffTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setCallModalBooking(item)}
                                            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                            <Phone size={13} className="animate-pulse" />
                                            <span>Call Renter</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleInspectKyc(item)}
                                            className="py-1.5 px-3 rounded-xl border border-emerald-200 text-emerald-800 bg-white hover:bg-emerald-50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                        >
                                            <GraduationCap size={13} className="text-emerald-600" />
                                            <span>Student ID</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-gray-500">No active rentals right now.</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Your vehicles are parked and ready at campus hubs.</p>
                        </div>
                    )}
                </div>

                {/* Return Tracking & Photo Review Panel */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-base font-bold text-gray-900">Return Photo Inspections</h2>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            {returnedRentals.length} Pending Review
                        </span>
                    </div>

                    {returnedRentals.length > 0 ? (
                        <div className="space-y-4">
                            {returnedRentals.map((item) => (
                                <div key={item.id} className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">{item.vehicleName}</h4>
                                            <p className="text-[11px] text-gray-500">Returned by {item.renterName} at {item.campusHub}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            PHOTO SUBMITTED
                                        </span>
                                    </div>

                                    {item.returnPhotoUrl && (
                                        <div className="relative rounded-xl overflow-hidden border border-emerald-200 max-h-36 bg-gray-100">
                                            <img src={item.returnPhotoUrl} alt="Return photo" className="w-full h-36 object-cover" />
                                            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-white font-mono">
                                                {item.returnTimestamp || "Timestamp Verified"}
                                            </div>
                                        </div>
                                    )}

                                    {item.returnNotes && (
                                        <p className="text-xs text-gray-600 italic bg-white p-2.5 rounded-xl border border-emerald-100">
                                            &quot;{item.returnNotes}&quot;
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={() => setInspectBooking(item)}
                                            className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                        >
                                            Enlarge Photo
                                        </button>
                                        <button
                                            onClick={() => handleConfirmReturnInspection(item)}
                                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                        >
                                            <Check size={14} />
                                            <span>Confirm & Complete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-gray-700">All Returns Inspected</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">No pending return photo inspections in your queue.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* 5. Complete Vehicle Listing Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">My Vehicle Fleet</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Only you can manage your listed bikes and scooters.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddVehicleOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                        <PlusCircle size={14} />
                        <span>Add New Vehicle</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/70">
                            <TableRow>
                                <TableHead className="text-xs font-bold text-gray-700">Ride</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Type</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Campus Hub</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Hourly Rate</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">RC Document</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Status</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map((v) => (
                                <TableRow key={v.id} className="hover:bg-emerald-50/20">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img src={v.imageUrl} alt="" className="w-12 h-10 rounded-xl object-cover" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{v.name}</p>
                                                <p className="text-[11px] text-gray-500">{v.model}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {v.vehicleType}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-700">{v.locationHub}</TableCell>
                                    <TableCell className="text-xs font-bold text-gray-900">${v.hourlyPrice.toFixed(2)}/hr</TableCell>
                                    <TableCell>
                                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                            {v.documents?.rcNumber || "Verified"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${v.status === "approved"
                                            ? v.isAvailable
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-emerald-100 text-emerald-800"
                                            : v.status === "pending_approval"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-rose-100 text-rose-800"
                                            }`}>
                                            {v.status === "approved"
                                                ? v.isAvailable
                                                    ? "AVAILABLE"
                                                    : "RENTED OUT"
                                                : v.status.replace("_", " ").toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href="/owner/pricing"
                                            className="text-xs font-bold text-emerald-700 hover:underline px-2 py-1"
                                        >
                                            Edit Pricing
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {isAddVehicleOpen && (
                <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                    <DialogContent className="max-w-lg rounded-3xl bg-white p-6 sm:p-7">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900">
                                List a Vehicle on Wheelzy
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Peer-to-peer campus ride sharing with verified college students.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateVehicle} className="space-y-4 my-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Brand & Model Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Segway Ninebot Max"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Model Trim / Specs</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Gen 2 (65km range)"
                                        value={newModel}
                                        onChange={(e) => setNewModel(e.target.value)}
                                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value as any)}
                                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                                    >
                                        <option value="Scooter">Scooter</option>
                                        <option value="Bike">Bike / Motorcycle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as any)}
                                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                                    >
                                        <option value="Electric Scooter">Electric Scooter</option>
                                        <option value="Hybrid Bicycle">Hybrid Bicycle</option>
                                        <option value="Motor Scooter">Motor Scooter</option>
                                        <option value="Motorcycle">Motorcycle</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Price ($/hr)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        required
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(e.target.value)}
                                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Designated Pickup Hub</label>
                                    <input
                                        type="text"
                                        value={newHub}
                                        onChange={(e) => setNewHub(e.target.value)}
                                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">RC / Registration Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CA-EBIKE-92812"
                                    value={newRcNumber}
                                    onChange={(e) => setNewRcNumber(e.target.value)}
                                    className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                                />
                                <span className="text-[10px] text-gray-400">
                                    Documents are stored encrypted in MinIO and reviewed by campus admin.
                                </span>
                            </div>

                            <DialogFooter className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddVehicleOpen(false)}
                                    className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-md"
                                >
                                    Submit Listing
                                </button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Return Photo Inspection Modal */}
            {inspectBooking && (
                <Dialog open={!!inspectBooking} onOpenChange={() => setInspectBooking(null)}>
                    <DialogContent className="max-w-md rounded-3xl bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-gray-900">
                                Return Photo Inspection
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                {inspectBooking.vehicleName} · Returned by {inspectBooking.renterName}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 my-3">
                            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
                                <img src={inspectBooking.returnPhotoUrl} alt="Return photo" className="w-full max-h-72 object-contain" />
                            </div>

                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                                <p><strong>Campus Hub:</strong> {inspectBooking.campusHub}</p>
                                <p><strong>Return Notes:</strong> {inspectBooking.returnNotes}</p>
                                <p className="font-mono text-[10px] text-gray-500">{inspectBooking.returnPhotoMinioKey}</p>
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <button
                                onClick={() => setInspectBooking(null)}
                                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleConfirmReturnInspection(inspectBooking)}
                                className="py-2.5 px-5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
                            >
                                Approve & Mark Completed
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* In-Platform Voice Calling Modal (Privacy Protected) */}
            <InPlatformCallModal
                isOpen={Boolean(callModalBooking)}
                onClose={() => setCallModalBooking(null)}
                booking={callModalBooking}
                callerRole="owner"
            />

            {/* Student ID Proof Preview Modal (Zero Aadhaar, Privacy-First) */}
            <StudentIdPreviewModal
                isOpen={Boolean(inspectedParticipant)}
                onClose={() => setInspectedParticipant(null)}
                participant={inspectedParticipant}
            />

        </div>
    );
}
