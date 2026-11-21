"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MapPin,
  Camera,
  Eye,
  Check,
  RotateCcw,
  ShieldCheck,
  DollarSign,
  Power,
  ChevronRight,
  Sparkles,
  Lock,
  X,
  SlidersHorizontal,
  Info,
  ArrowRight,
  FileText,
  BadgeCheck,
  Upload,
  FileCheck2,
} from "lucide-react";
import {
  dataStore,
  StoredVehicle,
  StoredBooking,
  STANDARD_HOURLY_RATE,
  calculateRentalAmount,
  calculateDurationFromTimes,
  getVehicleDurationHours,
} from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type TabKey = "vehicle" | "returns";

function formatReadable(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";
  try {
    const d = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(d.getTime())) return `${dateStr}, ${timeStr}`;
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return `${dateStr}, ${timeStr}`;
  }
}

// Photo presets for easy vehicle registration
const VEHICLE_PHOTO_PRESETS = [
  { label: "Xiaomi Electric Pro 2", url: "/scooter_xiaomi.jpg", type: "Scooter" },
  { label: "Segway Ninebot Max", url: "/scooter_segway.jpg", type: "Scooter" },
  { label: "Trek FX 2 Commuter", url: "/bike_trek.jpg", type: "Bike" },
  { label: "Specialized Sirrus", url: "/bike_specialized.jpg", type: "Bike" },
  { label: "Ather 450X Gen 3", url: "/scooter_ather.jpg", type: "Scooter" },
  { label: "Royal Enfield Hunter 350", url: "/bike_hunter.jpg", type: "Bike" },
  { label: "TVS Jupiter 125", url: "/scooter_jupiter.jpg", type: "Scooter" },
  { label: "Honda Activa 6G", url: "/scooter_activa.jpg", type: "Scooter" },
];

function MyVehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const ownerId = user && user.role === "owner" ? user.id : "usr-owner-marcus";

  // Tab management: "vehicle" (Overview & Availability) or "returns" (Return Tracking)
  const initialParamTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialParamTab === "returns" ? "returns" : "vehicle"
  );

  // Single vehicle state (Strict 1-vehicle-per-owner)
  const [vehicle, setVehicle] = useState<StoredVehicle | null>(null);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadData = () => {
    const single = dataStore.getOwnerVehicle(ownerId) || null;
    setVehicle(single);
    setBookings(dataStore.getOwnerBookings(ownerId));
    setIsLoading(false);
  };

  useEffect(() => {
    reloadData();
    const handleStoreUpdate = () => reloadData();
    window.addEventListener("wheelzy-store-update", handleStoreUpdate);
    return () => window.removeEventListener("wheelzy-store-update", handleStoreUpdate);
  }, [ownerId]);

  // Synchronize tab from URL if changed
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "returns") {
      setActiveTab("returns");
    } else if (tabParam === "add" && vehicle) {
      toast.warning("You can register only one vehicle on Wheelzy.");
      setActiveTab("vehicle");
    } else if (tabParam === "vehicle" || tabParam === "listings" || tabParam === "pricing") {
      setActiveTab("vehicle");
    }
  }, [searchParams, vehicle]);

  // Active or confirmed ride check for the vehicle
  const activeRide = useMemo(() => {
    if (!vehicle) return null;
    return (
      bookings.find(
        (b) =>
          b.vehicleId === vehicle.id &&
          (b.status === "active" || b.status === "confirmed")
      ) || null
    );
  }, [vehicle, bookings]);

  // ----------------------------------------------------
  // MODAL 1: MAKE AVAILABLE / UPDATE AVAILABILITY SCHEDULE
  // ----------------------------------------------------
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  const [modalAvailDate, setModalAvailDate] = useState(todayStr);
  const [modalAvailTime, setModalAvailTime] = useState("09:00");
  const [modalReturnDate, setModalReturnDate] = useState(todayStr);
  const [modalReturnTime, setModalReturnTime] = useState("12:00");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Live schedule validation
  const modalStartMs = useMemo(() => {
    if (!modalAvailDate || !modalAvailTime) return null;
    const ms = new Date(`${modalAvailDate}T${modalAvailTime}`).getTime();
    return isNaN(ms) ? null : ms;
  }, [modalAvailDate, modalAvailTime]);

  const modalEndMs = useMemo(() => {
    if (!modalReturnDate || !modalReturnTime) return null;
    const ms = new Date(`${modalReturnDate}T${modalReturnTime}`).getTime();
    return isNaN(ms) ? null : ms;
  }, [modalReturnDate, modalReturnTime]);

  const isScheduleValid = Boolean(
    modalStartMs !== null && modalEndMs !== null && modalEndMs > modalStartMs
  );

  const calculatedDurationHours = useMemo(() => {
    if (!isScheduleValid || !modalStartMs || !modalEndMs) return 0;
    return Math.max(1, Math.ceil((modalEndMs - modalStartMs) / (1000 * 60 * 60)));
  }, [isScheduleValid, modalStartMs, modalEndMs]);

  const estimatedEarnings = calculateRentalAmount(calculatedDurationHours);

  const openAvailabilityModal = () => {
    if (!vehicle) return;
    if (vehicle.status !== "approved") {
      toast.warning("Vehicle is still awaiting administrative RC verification.");
      return;
    }
    if (activeRide) {
      toast.error(
        `Cannot alter availability: Ride ${activeRide.id} is currently in progress with return deadline locked.`
      );
      return;
    }

    setModalAvailDate(vehicle.availableFromDate || todayStr);
    setModalAvailTime(vehicle.availableFromTime || "09:00");
    setModalReturnDate(vehicle.returnDate || todayStr);
    setModalReturnTime(vehicle.returnTime || "12:00");
    setIsAvailabilityModalOpen(true);
  };

  const handleConfirmAvailabilityActivation = () => {
    if (!vehicle) return;
    if (!isScheduleValid || calculatedDurationHours <= 0) {
      toast.error("Mandatory return deadline must be strictly later than pickup date and time.");
      return;
    }

    setIsSavingSchedule(true);
    const result = dataStore.activateVehicleAvailability(vehicle.id, {
      availableFromDate: modalAvailDate,
      availableFromTime: modalAvailTime,
      returnDate: modalReturnDate,
      returnTime: modalReturnTime,
    });

    setIsSavingSchedule(false);

    if (result.success) {
      toast.success(`${vehicle.name} is now LIVE for campus student rentals!`);
      setIsAvailabilityModalOpen(false);
      reloadData();
    } else {
      toast.error(result.error || "Failed to activate vehicle availability.");
    }
  };

  // ----------------------------------------------------
  // MODAL 2: DEACTIVATE / MAKE VEHICLE UNAVAILABLE
  // ----------------------------------------------------
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const handleConfirmDeactivation = () => {
    if (!vehicle) return;
    if (activeRide) {
      toast.error(
        `Cannot pause vehicle: Student booking ${activeRide.id} is in progress. Deactivation is locked until vehicle is returned.`
      );
      setIsDeactivateModalOpen(false);
      return;
    }

    const result = dataStore.deactivateVehicleAvailability(vehicle.id);
    if (result.success) {
      toast.success(`${vehicle.name} has been paused from campus rentals.`);
      setIsDeactivateModalOpen(false);
      reloadData();
    } else {
      toast.error(result.error || "Failed to pause vehicle.");
    }
  };

  // ----------------------------------------------------
  // MODAL 3: SCENARIO A – ADD VEHICLE MODAL (ONLY IF NO VEHICLE)
  // ----------------------------------------------------
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addModel, setAddModel] = useState("");
  const [addCategory, setAddCategory] = useState<"Bike" | "Scooter">("Scooter");
  const [addVehicleType, setAddVehicleType] = useState<StoredVehicle["vehicleType"]>("Electric Scooter");
  const [addCampus, setAddCampus] = useState(user?.campus || "UC Berkeley");
  const [addHub, setAddHub] = useState("Sproul Plaza Hub");
  const [addRcNumber, setAddRcNumber] = useState("");
  const [addInsuranceExpiry, setAddInsuranceExpiry] = useState("2027-12-31");
  const [addSelectedPhoto, setAddSelectedPhoto] = useState("/scooter_xiaomi.jpg");

  const [addAvailDate, setAddAvailDate] = useState(todayStr);
  const [addAvailTime, setAddAvailTime] = useState("09:00");
  const [addReturnDate, setAddReturnDate] = useState(todayStr);
  const [addReturnTime, setAddReturnTime] = useState("12:00");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Live schedule check for new vehicle
  const addStartMs = useMemo(() => {
    if (!addAvailDate || !addAvailTime) return null;
    const ms = new Date(`${addAvailDate}T${addAvailTime}`).getTime();
    return isNaN(ms) ? null : ms;
  }, [addAvailDate, addAvailTime]);

  const addEndMs = useMemo(() => {
    if (!addReturnDate || !addReturnTime) return null;
    const ms = new Date(`${addReturnDate}T${addReturnTime}`).getTime();
    return isNaN(ms) ? null : ms;
  }, [addReturnDate, addReturnTime]);

  const addScheduleValid = Boolean(
    addStartMs !== null && addEndMs !== null && addEndMs > addStartMs
  );

  const addDurationHours = useMemo(() => {
    if (!addScheduleValid || !addStartMs || !addEndMs) return 0;
    return Math.max(1, Math.ceil((addEndMs - addStartMs) / (1000 * 60 * 60)));
  }, [addScheduleValid, addStartMs, addEndMs]);

  const handleRegisterVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (vehicle) {
      toast.error("You can register only one vehicle on Wheelzy.");
      setIsAddVehicleModalOpen(false);
      return;
    }

    if (!addName.trim() || !addModel.trim()) {
      toast.error("Please enter the vehicle make and model.");
      return;
    }
    if (!addRcNumber.trim()) {
      toast.error("Please provide the vehicle registration (RC) number.");
      return;
    }
    if (!addScheduleValid || addDurationHours <= 0) {
      toast.error("Mandatory return deadline must be strictly after the availability start time.");
      return;
    }

    setIsSubmittingNew(true);

    try {
      const availFromLabel = formatReadable(addAvailDate, addAvailTime);
      const mustReturnLabel = formatReadable(addReturnDate, addReturnTime);

      const created = dataStore.addVehicle({
        name: addName.trim(),
        model: addModel.trim(),
        category: addCategory,
        vehicleType: addVehicleType,
        campus: addCampus,
        locationHub: addHub,
        hourlyPrice: STANDARD_HOURLY_RATE,
        rentalDurationHours: addDurationHours,
        imageUrl: addSelectedPhoto,
        isAvailable: false, // Starts as Approved-Inactive or Pending Approval
        status: "pending_approval",
        ownerId,
        ownerName: user?.name || "Marcus Vance",
        ownerCollege: user?.collegeYear ? `${addCampus} · ${user.collegeYear}` : addCampus,
        ownerAvatar:
          user?.avatar ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        features: ["Verified Lock", "Helmet Included", "Campus Geofenced"],
        documents: {
          rcNumber: addRcNumber.trim(),
          rcMinioKey: `minio://wheelzy-docs/vehicles/rc_${Date.now()}.pdf`,
          insuranceExpiry: addInsuranceExpiry,
          verified: false,
        },
        availableFromDate: addAvailDate,
        availableFromTime: addAvailTime,
        returnDate: addReturnDate,
        returnTime: addReturnTime,
        availableFrom: availFromLabel,
        mustReturnBy: mustReturnLabel,
      });

      toast.success(
        `${created.name} registered! Awaiting campus administrator verification.`
      );

      setIsAddVehicleModalOpen(false);
      setAddName("");
      setAddModel("");
      setAddRcNumber("");
      reloadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to register vehicle.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // ----------------------------------------------------
  // MODAL 4: VEHICLE DETAILS MODAL
  // ----------------------------------------------------
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // ----------------------------------------------------
  // VEHICLE DOCUMENTS STATE (RC & INSURANCE)
  // ----------------------------------------------------
  const rcFileInputRef = React.useRef<HTMLInputElement>(null);
  const insuranceFileInputRef = React.useRef<HTMLInputElement>(null);
  const [rcUploadProgress, setRcUploadProgress] = useState<number | null>(null);
  const [insuranceUploadProgress, setInsuranceUploadProgress] = useState<number | null>(null);
  const [docPreviewModalOpen, setDocPreviewModalOpen] = useState(false);
  const [docPreviewTitle, setDocPreviewTitle] = useState("");
  const [docPreviewUrl, setDocPreviewUrl] = useState("");

  const openDocPreview = (title: string, url: string) => {
    setDocPreviewTitle(title);
    setDocPreviewUrl(url);
    setDocPreviewModalOpen(true);
  };

  const handleRcFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid JPG, PNG, or PDF file for RC verification.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller document.");
      return;
    }

    setRcUploadProgress(20);
    const progressTimer = setInterval(() => {
      setRcUploadProgress((prev) => {
        if (prev === null || prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 30;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      setTimeout(() => {
        clearInterval(progressTimer);
        setRcUploadProgress(100);
        setTimeout(() => {
          dataStore.updateVehicleDocument(vehicle.id, {
            rcDocUrl: resultUrl,
            rcStatus: "pending",
            rcRejectionReason: undefined,
            rcMinioKey: `minio://wheelzy-docs/vehicles/rc_${Date.now()}.pdf`,
          });
          setRcUploadProgress(null);
          reloadData();
          toast.success("Registration Certificate (RC) uploaded! Submitted for administrative verification.");
        }, 300);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const handleInsuranceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid JPG, PNG, or PDF file for Insurance verification.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please upload a smaller document.");
      return;
    }

    setInsuranceUploadProgress(20);
    const progressTimer = setInterval(() => {
      setInsuranceUploadProgress((prev) => {
        if (prev === null || prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 30;
      });
    }, 150);

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      setTimeout(() => {
        clearInterval(progressTimer);
        setInsuranceUploadProgress(100);
        setTimeout(() => {
          dataStore.updateVehicleDocument(vehicle.id, {
            insuranceDocUrl: resultUrl,
            insuranceStatus: "pending",
            insuranceRejectionReason: undefined,
            insuranceMinioKey: `minio://wheelzy-docs/vehicles/ins_${Date.now()}.pdf`,
          });
          setInsuranceUploadProgress(null);
          reloadData();
          toast.success("Insurance Policy uploaded! Submitted for administrative verification.");
        }, 300);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const getDocStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check size={11} className="stroke-[3]" />
            <span>Verified</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Pending Verification</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <X size={11} className="stroke-[3]" />
            <span>Rejected</span>
          </span>
        );
      case "not_uploaded":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <span>Not Uploaded</span>
          </span>
        );
    }
  };

  // ----------------------------------------------------
  // TAB 2: RETURN TRACKING STATE & INSPECTION MODALS
  // ----------------------------------------------------
  const [returnFilterTab, setReturnFilterTab] = useState<"pending" | "completed">("pending");
  const [inspectReturnBooking, setInspectReturnBooking] = useState<StoredBooking | null>(null);
  const [reportModalBooking, setReportModalBooking] = useState<StoredBooking | null>(null);
  const [reportReason, setReportReason] = useState("Vehicle Damage Observed");
  const [reportNotes, setReportNotes] = useState("");

  const returnedBookings = useMemo(() => {
    if (!vehicle) return [];
    return bookings.filter((b) => b.vehicleId === vehicle.id && b.status === "returned");
  }, [vehicle, bookings]);

  const completedBookings = useMemo(() => {
    if (!vehicle) return [];
    return bookings.filter((b) => b.vehicleId === vehicle.id && b.status === "completed");
  }, [vehicle, bookings]);

  const handleApproveReturnHandover = (booking: StoredBooking) => {
    dataStore.updateBookingStatus(booking.id, "completed");
    toast.success(`Return verified for ${booking.vehicleName}! Payment released.`);
    setInspectReturnBooking(null);
    reloadData();
  };

  const handleReportIssueToAdmin = () => {
    if (!reportModalBooking) return;
    if (!reportNotes.trim()) {
      toast.error("Please describe the damage or issue before submitting.");
      return;
    }

    const reportCategory =
      reportReason.includes("Damage")
        ? "Vehicle Damage"
        : reportReason.includes("Wrong")
        ? "Late Return"
        : "Safety Concern";

    dataStore.createReport({
      reporterId: ownerId,
      reporterName: user?.name || "Marcus Vance",
      reporterRole: "owner",
      targetType: "booking",
      targetId: reportModalBooking.id,
      category: reportCategory,
      description: `[${reportReason}] ${reportNotes.trim()} · Vehicle: ${reportModalBooking.vehicleName} at ${reportModalBooking.campusHub}`,
    });

    toast.success("Incident report filed with Wheelzy safety administration.");
    setReportModalBooking(null);
    setReportNotes("");
    reloadData();
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    params.set("tab", tab);
    router.replace(`/owner/my-vehicles?${params.toString()}`);
  };

  // Helper status resolution
  const isApproved = vehicle?.status === "approved";
  const isPending = vehicle?.status === "pending_approval";
  const isRejected = vehicle?.status === "rejected";
  const isActive = isApproved && Boolean(vehicle?.isAvailable);
  const isApprovedInactive = isApproved && !vehicle?.isAvailable;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── Top Page Header ── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Fleet Operations & Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            My Vehicle
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Manage your registered campus vehicle, availability schedule, and rental status.
          </p>
        </div>

        {/* Header Right Action: If NO vehicle, show Add button. If vehicle exists, DO NOT show Add button! */}
        <div className="flex items-center gap-3">
          {!vehicle ? (
            <button
              type="button"
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Add Your Vehicle</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-2xl border border-gray-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold text-gray-700">
                1 Registered Vehicle (Platform Limit)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENARIO A: OWNER HAS NO VEHICLE (ATTRACTIVE EMPTY STATE)
         ══════════════════════════════════════════════════════════════════════ */}
      {!vehicle && !isLoading && (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <Car size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              No Vehicle Registered
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Register your bike or scooter to start sharing rides with students on your campus.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <PlusCircle size={17} />
              <span>Add Your Vehicle</span>
            </button>
          </div>

          {/* Value Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-left">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-emerald-700 font-bold text-xs block mb-1 flex items-center gap-1.5">
                <DollarSign size={13} /> ₹100 / Hour
              </span>
              <p className="text-[11px] text-gray-500 leading-snug">
                Standardized platform hourly rate guaranteed for every ride.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-emerald-700 font-bold text-xs block mb-1 flex items-center gap-1.5">
                <MapPin size={13} /> Campus Geofenced
              </span>
              <p className="text-[11px] text-gray-500 leading-snug">
                Pickups & dropoffs occur exclusively at designated campus hubs.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-emerald-700 font-bold text-xs block mb-1 flex items-center gap-1.5">
                <ShieldCheck size={13} /> Verified Students
              </span>
              <p className="text-[11px] text-gray-500 leading-snug">
                Only campus-verified students with valid IDs can book your ride.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SCENARIO B: OWNER HAS A REGISTERED VEHICLE (EXACTLY ONE VEHICLE)
         ══════════════════════════════════════════════════════════════════════ */}
      {vehicle && (
        <div className="space-y-6">
          {/* Main Tab Bar: Vehicle & Availability vs Return Tracking */}
          <div className="flex items-center gap-2 p-1.5 bg-gray-100/90 backdrop-blur-sm rounded-2xl border border-gray-200/80 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => switchTab("vehicle")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "vehicle"
                  ? "bg-[#064E3B] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
            >
              <Car size={15} />
              <span>Vehicle & Availability</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("returns")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "returns"
                  ? "bg-[#064E3B] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
            >
              <RotateCcw size={15} />
              <span>Return Tracking</span>
              {returnedBookings.length > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === "returns"
                      ? "bg-amber-400 text-gray-950 animate-pulse"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {returnedBookings.length}
                </span>
              )}
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: VEHICLE & AVAILABILITY
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "vehicle" && (
            <div className="space-y-6">
              {/* Dynamic Status Notification Banner */}
              {isPending && (
                <div className="p-4 bg-amber-50 rounded-3xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        Under Verification by Campus Admin
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Your vehicle RC and documents are currently being verified by campus administration. You will be able to activate rentals once approved.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors shrink-0"
                  >
                    View Details
                  </button>
                </div>
              )}

              {isApprovedInactive && (
                <div className="p-5 bg-amber-50/90 rounded-3xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-amber-950">
                        Vehicle is Currently Inactive
                      </p>
                      <p className="text-xs text-amber-800/90 mt-0.5">
                        Set your availability schedule to make your vehicle available to renters.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openAvailabilityModal}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 shrink-0 cursor-pointer transition-all active:scale-95"
                  >
                    <Calendar size={14} />
                    <span>Schedule My Vehicle</span>
                  </button>
                </div>
              )}

              {isActive && (
                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1 sm:mt-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Active / Listed on Campus
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Your vehicle is live for student bookings! Students on your campus can discover and rent it on Find a Ride and the campus carousel.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={openAvailabilityModal}
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Update Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeactivateModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors cursor-pointer"
                    >
                      Pause Rentals
                    </button>
                  </div>
                </div>
              )}

              {isRejected && (
                <div className="p-4 bg-rose-50 rounded-3xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-xs font-bold text-rose-900">
                        Vehicle Registration Rejected
                      </p>
                      <p className="text-[11px] text-rose-800">
                        Campus administration declined the RC verification for this vehicle. Please review details.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-900 font-bold text-xs hover:bg-rose-100 transition-colors shrink-0"
                  >
                    View Reason
                  </button>
                </div>
              )}

              {/* Main Content Grid: Left Vehicle Showcase & Right Availability Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left Column: Vehicle Card Showcase (5 Cols) ── */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Vehicle Photo with Status Badges */}
                    <div className="relative h-60 bg-gray-100 overflow-hidden">
                      <img
                        src={vehicle.imageUrl || "/scooter_xiaomi.jpg"}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                          {vehicle.vehicleType}
                        </span>

                        {/* Distinct Status Pill */}
                        {isActive ? (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Active / Listed
                          </span>
                        ) : isApprovedInactive ? (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                            <CheckCircle2 size={12} /> Approved – Inactive
                          </span>
                        ) : isPending ? (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                            <Clock size={12} /> Pending Approval
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-600 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                            <AlertCircle size={12} /> Rejected
                          </span>
                        )}
                      </div>

                      {/* Bottom Image Info */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                            Platform Rate
                          </span>
                          <span className="text-xl font-black font-mono">
                            ₹{STANDARD_HOURLY_RATE} / hr
                          </span>
                        </div>
                        <span className="text-xs font-semibold bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md border border-white/10">
                          {getVehicleDurationHours(vehicle)}h Available Window
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Details Body */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{vehicle.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{vehicle.model}</p>
                      </div>

                      {/* Hub & Registration Metadata */}
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Campus Hub</span>
                          <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <MapPin size={13} className="text-emerald-600" />
                            {vehicle.locationHub}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Registration (RC)</span>
                          <span className="font-mono text-xs font-bold text-gray-800 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                            {vehicle.documents?.rcNumber || "RC-VERIFIED"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Category</span>
                          <span className="font-semibold text-gray-800">{vehicle.category}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Campus</span>
                          <span className="font-semibold text-gray-800">{vehicle.campus}</span>
                        </div>
                      </div>

                      {/* Features Badges */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                          Included Hardware & Safety
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(vehicle.features || ["Verified Lock", "Helmet Included", "Campus Geofenced"]).map(
                            (feat, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                              >
                                <Check size={11} className="text-emerald-600" />
                                {feat}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer for Vehicle */}
                  <div className="p-5 bg-gray-50/80 border-t border-gray-100 space-y-2">
                    {/* Primary Status Button */}
                    {isApprovedInactive && (
                      <button
                        type="button"
                        onClick={openAvailabilityModal}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        <Sparkles size={15} />
                        <span>Make Vehicle Available</span>
                      </button>
                    )}

                    {isActive && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={openAvailabilityModal}
                          className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Clock size={13} />
                          <span>Update Schedule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeactivateModalOpen(true)}
                          className="py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Power size={13} />
                          <span>Make Unavailable</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(true)}
                      className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View Registration Documents & Details</span>
                    </button>
                  </div>
                </div>

                {/* ── Right Column: Availability Schedule, Pricing & Active Ride Notice (7 Cols) ── */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Wheelzy Rate Standard Card */}
                  <div className="bg-[#0A1F1A] text-white rounded-3xl p-6 sm:p-7 border border-emerald-950/60 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                          <ShieldCheck size={12} /> Standardized University Rate
                        </div>
                        <h3 className="text-xl font-black text-white mt-2">
                          Fixed Campus Rate: ₹{STANDARD_HOURLY_RATE} / Hour
                        </h3>
                        <p className="text-xs text-gray-300 mt-1 max-w-md leading-relaxed">
                          In compliance with university peer-to-peer sharing regulations, all rides rent at a flat rate of ₹100 per hour.
                        </p>
                      </div>

                      <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-2xl text-center shrink-0">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Current Hourly Rate
                        </span>
                        <span className="text-2xl font-black text-white font-mono mt-0.5 block">
                          ₹{STANDARD_HOURLY_RATE}
                        </span>
                        <span className="text-[10px] text-gray-400">Fixed rate / hr</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Ride In Progress Notice (If Any) */}
                  {activeRide && (
                    <div className="p-5 bg-amber-50 rounded-3xl border border-amber-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Lock size={11} /> Active Ride in Progress
                        </span>
                        <span className="font-mono text-xs text-amber-800 font-bold">{activeRide.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={activeRide.renterAvatar || "/default_avatar.jpg"}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-300 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            Renter: {activeRide.renterName} ({activeRide.renterCampus})
                          </p>
                          <p className="text-[11px] text-gray-600">
                            Booked from <strong>{activeRide.pickupTime}</strong> · Mandatory Return by:{" "}
                            <strong className="text-rose-700">
                              {activeRide.mandatoryReturnDeadline || activeRide.dropoffTime}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-amber-800 bg-white/70 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                        The vehicle schedule is currently locked while the student is riding. Once the student parks and uploads the return lock photo at the campus hub, you will inspect it in Return Tracking.
                      </p>
                    </div>
                  )}

                  {/* Current Availability Schedule Box */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-emerald-600" />
                          <h3 className="text-base font-black text-gray-900">
                            Availability Schedule Window
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Configured rental availability and student return deadline.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openAvailabilityModal}
                        disabled={Boolean(activeRide) || !isApproved}
                        className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock size={13} />
                        <span>Edit Schedule</span>
                      </button>
                    </div>

                    {/* Schedule Stats Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Availability Start */}
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <Clock size={13} className="text-emerald-600" />
                          <span>Availability Start</span>
                        </div>
                        <p className="text-sm font-black text-gray-900">
                          {vehicle.availableFrom ||
                            `${vehicle.availableFromDate || "Today"}, ${vehicle.availableFromTime || "09:00 AM"}`}
                        </p>
                        <span className="text-[10px] text-gray-500 block">
                          When students can begin their ride
                        </span>
                      </div>

                      {/* Mandatory Return By */}
                      <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                          <RotateCcw size={13} className="text-rose-600" />
                          <span>Mandatory Return Deadline</span>
                        </div>
                        <p className="text-sm font-black text-gray-900">
                          {vehicle.mustReturnBy ||
                            `${vehicle.returnDate || "Today"}, ${vehicle.returnTime || "12:00 PM"}`}
                        </p>
                        <span className="text-[10px] text-rose-700 font-medium block">
                          Strict return deadline shown to students
                        </span>
                      </div>
                    </div>

                    {/* Window Duration & Estimated Payout Calculation */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-gray-500 font-medium">Total Continuous Rental Window</span>
                        <p className="text-base font-black text-gray-900">
                          {getVehicleDurationHours(vehicle)} Hours Available
                        </p>
                      </div>

                      <div className="sm:text-right space-y-0.5">
                        <span className="text-gray-500 font-medium">Potential Earnings at Full Window</span>
                        <p className="text-base font-black text-emerald-700 font-mono">
                          ₹{calculateRentalAmount(getVehicleDurationHours(vehicle))}
                        </p>
                      </div>
                    </div>

                    {/* Wheelzy Protection & Geofence Assurance */}
                    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 flex items-start gap-3">
                      <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-950">
                        <p className="font-bold">Campus Return Verification Protocol</p>
                        <p className="mt-0.5 text-emerald-900/80 leading-relaxed text-[11px]">
                          Students are required to upload a timestamped parking photo with GPS geofence evidence at the designated hub before return completion. You retain full authority to verify the photo before payout release.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Dedicated Vehicle Compliance Documents Section (RC & Insurance) ── */}
              <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <FileCheck2 size={18} className="text-emerald-700" />
                      <span>Vehicle Compliance Documents (RC &amp; Insurance)</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload and manage the Registration Certificate (RC) and active insurance policy for {vehicle.name}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Fleet RC &amp; Insurance:</span>
                    {vehicle.documents?.verified ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified &amp; Active ✓
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Under Admin Review
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* ── Document 1: Registration Certificate (RC) ── */}
                  <div className="bg-gray-50/60 rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">Registration Certificate (RC)</h4>
                            <p className="text-[11px] text-gray-500">
                              Government registration proof (Form 23).
                            </p>
                          </div>
                        </div>
                        {getDocStatusBadge(vehicle.documents?.rcStatus)}
                      </div>

                      {/* Rejection Alert if rejected */}
                      {vehicle.documents?.rcStatus === "rejected" && (
                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                          <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">RC Verification Rejected</p>
                            <p className="text-[11px] text-rose-700 mt-0.5">
                              {vehicle.documents?.rcRejectionReason ||
                                "The uploaded RC document is illegible or does not match the registered vehicle specs. Please upload a clear copy."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Preview Box */}
                      <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-white group">
                        <div className="h-44 w-full flex items-center justify-center p-3 bg-gray-50/50">
                          <img
                            src={vehicle.documents?.rcDocUrl || "/vehicle_rc_proof.svg"}
                            alt="RC Preview"
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
                          />
                        </div>
                        <div className="px-3.5 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                          <div className="truncate">
                            <span className="font-mono text-[11px] font-bold text-gray-800">
                              {vehicle.documents?.rcNumber || "RC-VERIFIED"}
                            </span>
                            <p className="text-[10px] text-gray-400">
                              MinIO Secure Storage • Verified Fleet
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              openDocPreview(
                                "Registration Certificate (RC)",
                                vehicle.documents?.rcDocUrl || "/vehicle_rc_proof.svg"
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>

                      {/* Upload Progress Bar */}
                      {rcUploadProgress !== null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-emerald-800 font-semibold">
                            <span>Uploading RC to MinIO storage...</span>
                            <span>{rcUploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-200"
                              style={{ width: `${rcUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-100">
                      <input
                        ref={rcFileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleRcFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => rcFileInputRef.current?.click()}
                        disabled={rcUploadProgress !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={14} />
                        <span>
                          {vehicle.documents?.rcDocUrl ? "Replace RC Document" : "Upload RC Document"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* ── Document 2: Insurance Policy Document ── */}
                  <div className="bg-gray-50/60 rounded-3xl border border-gray-200/80 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 shrink-0">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">Vehicle Insurance Policy</h4>
                            <p className="text-[11px] text-gray-500">
                              Comprehensive &amp; 3rd party liability coverage.
                            </p>
                          </div>
                        </div>
                        {getDocStatusBadge(vehicle.documents?.insuranceStatus)}
                      </div>

                      {/* Rejection Alert if rejected */}
                      {vehicle.documents?.insuranceStatus === "rejected" && (
                        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                          <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Insurance Verification Rejected</p>
                            <p className="text-[11px] text-rose-700 mt-0.5">
                              {vehicle.documents?.insuranceRejectionReason ||
                                "The policy document has expired or has missing policy details. Please upload an active insurance certificate."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Preview Box */}
                      <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-white group">
                        <div className="h-44 w-full flex items-center justify-center p-3 bg-gray-50/50">
                          <img
                            src={vehicle.documents?.insuranceDocUrl || "/insurance_document_proof.svg"}
                            alt="Insurance Preview"
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
                          />
                        </div>
                        <div className="px-3.5 py-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                          <div className="truncate">
                            <span className="font-mono text-[11px] font-bold text-gray-800">
                              {vehicle.documents?.insurancePolicyNumber || "POL-WHEELZY-8819"}
                            </span>
                            <p className="text-[10px] text-gray-400">
                              Expiry: {vehicle.documents?.insuranceExpiry || "2027-05-15"} • Encrypted MinIO Key
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              openDocPreview(
                                "Vehicle Insurance Policy Document",
                                vehicle.documents?.insuranceDocUrl || "/insurance_document_proof.svg"
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>

                      {/* Upload Progress Bar */}
                      {insuranceUploadProgress !== null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-emerald-800 font-semibold">
                            <span>Uploading Insurance to MinIO storage...</span>
                            <span>{insuranceUploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-200"
                              style={{ width: `${insuranceUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-100">
                      <input
                        ref={insuranceFileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleInsuranceFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => insuranceFileInputRef.current?.click()}
                        disabled={insuranceUploadProgress !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={14} />
                        <span>
                          {vehicle.documents?.insuranceDocUrl
                            ? "Replace Insurance Document"
                            : "Upload Insurance Document"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: RETURN TRACKING FOR THIS VEHICLE
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "returns" && (
            <div className="space-y-6">
              {/* Header and Subfilter */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Return Inspections for {vehicle.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Inspect renter parking photos, GPS geofencing, and confirm vehicle return condition.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setReturnFilterTab("pending")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      returnFilterTab === "pending"
                        ? "bg-[#064E3B] text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Awaiting Inspection ({returnedBookings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnFilterTab("completed")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      returnFilterTab === "completed"
                        ? "bg-[#064E3B] text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Completed ({completedBookings.length})
                  </button>
                </div>
              </div>

              {/* Zero Aadhaar Exposure Banner */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900">
                <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                <span>
                  <strong>Zero Aadhaar Exposure:</strong> In compliance with Wheelzy Student Privacy Standards, student Aadhaar credentials are kept strictly encrypted and concealed from peer hosts.
                </span>
              </div>

              {/* Return Bookings List */}
              {(returnFilterTab === "pending" ? returnedBookings : completedBookings).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(returnFilterTab === "pending" ? returnedBookings : completedBookings).map((b) => {
                    const isReturned = b.status === "returned";

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isReturned
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {isReturned ? "Awaiting Host Inspection" : "Return Verified & Completed"}
                          </span>
                          <span className="font-mono text-xs text-gray-400 font-bold">{b.id}</span>
                        </div>

                        {/* Renter & Trip Info */}
                        <div className="flex items-start gap-3">
                          <img
                            src={b.renterAvatar || "/default_avatar.jpg"}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900">{b.renterName}</h4>
                            <p className="text-xs text-gray-600 truncate">{b.renterCampus}</p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="text-emerald-600" />
                              Hub: {b.campusHub}
                            </p>
                          </div>
                        </div>

                        {/* Schedule & GPS */}
                        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Agreed Deadline:</span>
                            <span className="font-semibold text-rose-700">
                              {b.mandatoryReturnDeadline || b.dropoffTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Actual Return:</span>
                            <span className="font-bold text-gray-900">
                              {b.returnTimestamp || b.returnPhotoTimestamp || "Today"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                            <span className="text-gray-500">GPS Evidence:</span>
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Campus Hub Geofenced
                            </span>
                          </div>
                        </div>

                        {/* Return Photo Preview */}
                        {b.returnPhotoUrl && (
                          <div
                            onClick={() => setInspectReturnBooking(b)}
                            className="relative rounded-2xl overflow-hidden border border-gray-200 group cursor-pointer h-40 bg-black"
                          >
                            <img
                              src={b.returnPhotoUrl}
                              alt="Return photo"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                              <Eye size={15} /> Click to Inspect Photo
                            </div>
                          </div>
                        )}

                        {/* Student Notes */}
                        {b.returnNotes && (
                          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-gray-700 italic">
                            &quot;{b.returnNotes}&quot;
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setInspectReturnBooking(b)}
                            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                          >
                            Inspect Photo
                          </button>

                          {isReturned && (
                            <button
                              type="button"
                              onClick={() => handleApproveReturnHandover(b)}
                              className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1"
                            >
                              <Check size={13} />
                              <span>Verify & Release</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setReportModalBooking(b)}
                            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            title="Report damage or issue to administrator"
                          >
                            <AlertTriangle size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-3">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <h3 className="text-base font-bold text-gray-900">
                    {returnFilterTab === "pending"
                      ? "All Returns Inspected"
                      : "No Completed Return History"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    When students finish their trips and submit their lock photo at campus hubs, they will appear here for inspection.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS & DIALOGS
         ══════════════════════════════════════════════════════════════════════ */}

      {/* ── MODAL 1: MAKE VEHICLE AVAILABLE / UPDATE AVAILABILITY ── */}
      {isAvailabilityModalOpen && vehicle && (
        <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-7 font-sans">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Wheelzy Campus Availability
                </span>
              </div>
              <DialogTitle className="text-lg font-black text-gray-900 mt-1">
                {isActive ? "Update Availability Schedule" : "Schedule My Vehicle"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Specify when students can pick up and when they are required to return <strong>{vehicle.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              {/* Field 1 & 2: Pickup / Availability Start */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <Clock size={13} className="text-emerald-600" />
                  <span>1 & 2. Availability / Pickup Schedule</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Pickup Date</label>
                    <input
                      type="date"
                      required
                      value={modalAvailDate}
                      onChange={(e) => setModalAvailDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Pickup Time</label>
                    <input
                      type="time"
                      required
                      value={modalAvailTime}
                      onChange={(e) => setModalAvailTime(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Field 3 & 4: Mandatory Drop-off / Return Deadline */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <RotateCcw size={13} className="text-rose-600" />
                  <span>3 & 4. Mandatory Return Schedule</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Return Date</label>
                    <input
                      type="date"
                      required
                      value={modalReturnDate}
                      onChange={(e) => setModalReturnDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Return Time</label>
                    <input
                      type="time"
                      required
                      value={modalReturnTime}
                      onChange={(e) => setModalReturnTime(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Calculation & Confirmation Summary */}
              {isScheduleValid ? (
                <div className="p-4 bg-[#0A1F1A] text-white rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold">Available Duration:</span>
                    <span className="font-black text-sm font-mono">{calculatedDurationHours} Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">Platform Fixed Hourly Rate:</span>
                    <span className="font-mono font-bold">₹{STANDARD_HOURLY_RATE}/hr</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs">
                    <span className="text-white font-bold">Estimated Payout:</span>
                    <span className="font-black font-mono text-emerald-400 text-base">
                      ₹{estimatedEarnings}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 pt-1">
                    ✓ Validated: Return deadline is strictly later than pickup.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>
                    Mandatory return deadline must be strictly later than pickup date and time.
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAvailabilityModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isScheduleValid || isSavingSchedule}
                onClick={handleConfirmAvailabilityActivation}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>
                  {isSavingSchedule
                    ? "Activating..."
                    : isActive
                    ? "Save Schedule Changes"
                    : "Confirm & Activate Vehicle"}
                </span>
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 2: DEACTIVATE / MAKE VEHICLE UNAVAILABLE CONFIRMATION ── */}
      {isDeactivateModalOpen && vehicle && (
        <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className={`text-base font-bold flex items-center gap-2 ${activeRide ? "text-amber-800" : "text-gray-900"}`}>
                <Power size={18} className={activeRide ? "text-amber-600" : "text-amber-600"} />
                <span>{activeRide ? "Cannot Pause: Rental in Progress" : "Make Vehicle Unavailable?"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {activeRide
                  ? `Vehicle ${vehicle.name} has an active student booking.`
                  : `Are you sure you want to pause rentals for ${vehicle.name}?`}
              </DialogDescription>
            </DialogHeader>

            {activeRide ? (
              <div className="space-y-3 my-2">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Lock size={13} className="text-amber-700" />
                      Booking #{activeRide.id} is {activeRide.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Deactivation Locked
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Student renter <strong>{activeRide.renterName}</strong> ({activeRide.renterCampus}) has reserved this vehicle. Under Wheelzy campus reliability regulations, an owner cannot pause or remove a vehicle while a student booking is active or confirmed.
                  </p>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pickup:</span>
                      <strong className="text-gray-800">{activeRide.pickupTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mandatory Return Deadline:</span>
                      <strong className="text-rose-700">{activeRide.mandatoryReturnDeadline || activeRide.dropoffTime}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Once the renter returns the vehicle at the campus hub and the return inspection is completed, your vehicle will automatically move to inactive, and you can reschedule it whenever you are ready.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1.5 my-2">
                <p>
                  When paused, students will not see your vehicle in <em>Find a Ride</em> or the campus carousel.
                </p>
                <p className="text-gray-500 text-[11px]">
                  You can reactivate your listing anytime by clicking &quot;Schedule My Vehicle&quot;.
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsDeactivateModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              {activeRide ? (
                activeRide.status === "returned" ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveReturnHandover(activeRide);
                      setIsDeactivateModalOpen(false);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Verify Return & Pause Vehicle</span>
                  </button>
                ) : (
                  <Link
                    href="/owner/active-rides"
                    className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View in Active Rides</span>
                    <ArrowRight size={14} />
                  </Link>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDeactivation}
                  className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                >
                  Yes, Pause Rentals
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 3: SCENARIO A – ADD VEHICLE MODAL (ONLY IF NO VEHICLE) ── */}
      {isAddVehicleModalOpen && (
        <Dialog open={isAddVehicleModalOpen} onOpenChange={setIsAddVehicleModalOpen}>
          <DialogContent className="max-w-2xl rounded-3xl bg-white p-6 sm:p-8 max-h-[90vh] overflow-y-auto font-sans">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  New Vehicle Registration
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 mt-1">
                Register Your Campus Vehicle
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Each host may register strictly one bike or scooter on Wheelzy. All listings undergo administrative verification before booking.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegisterVehicleSubmit} className="space-y-6 my-2">
              {/* Identity & Specs */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Car size={14} className="text-emerald-600" />
                  <span>1. Vehicle Identity & Hub</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Make / Brand <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Xiaomi, Trek, Honda"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Model Specification <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mi Electric Pro 2 (45km range)"
                      value={addModel}
                      onChange={(e) => setAddModel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={addCategory}
                      onChange={(e) => setAddCategory(e.target.value as "Bike" | "Scooter")}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="Scooter">Scooter</option>
                      <option value="Bike">Bike / Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      value={addVehicleType}
                      onChange={(e) => setAddVehicleType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="Electric Scooter">Electric Scooter</option>
                      <option value="Motor Scooter">Motor Scooter</option>
                      <option value="Manual Bicycle">Manual Bicycle</option>
                      <option value="Gear Bicycle">Gear Bicycle</option>
                      <option value="Electric Bike">Electric Bike</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Designated Campus Hub <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={addHub}
                      onChange={(e) => setAddHub(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="Sproul Plaza Hub">Sproul Plaza Hub</option>
                      <option value="Moffitt Library Hub">Moffitt Library Hub</option>
                      <option value="South Campus Hub">South Campus Hub</option>
                      <option value="Engineering Hall Hub">Engineering Hall Hub</option>
                      <option value="North Gate Hub">North Gate Hub</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Registration Number (RC) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CA-EBIKE-88192"
                      value={addRcNumber}
                      onChange={(e) => setAddRcNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Preset Selection */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Camera size={14} className="text-emerald-600" />
                  <span>2. Vehicle Photography</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {VEHICLE_PHOTO_PRESETS.map((preset) => {
                    const isSelected = addSelectedPhoto === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setAddSelectedPhoto(preset.url)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="h-16 rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                          <img src={preset.url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-900 truncate">{preset.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Availability Start & Return Deadline */}
              <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-700" />
                    <span>3. Mandatory Availability & Return Deadline</span>
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <label className="text-[11px] font-bold text-gray-800 block mb-1">
                      Availability Start
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        required
                        value={addAvailDate}
                        onChange={(e) => setAddAvailDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                      />
                      <input
                        type="time"
                        required
                        value={addAvailTime}
                        onChange={(e) => setAddAvailTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <label className="text-[11px] font-bold text-gray-800 block mb-1">
                      Mandatory Return Deadline
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        required
                        value={addReturnDate}
                        onChange={(e) => setAddReturnDate(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                      />
                      <input
                        type="time"
                        required
                        value={addReturnTime}
                        onChange={(e) => setAddReturnTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {addScheduleValid ? (
                  <div className="p-3 bg-emerald-950 text-white rounded-xl flex items-center justify-between text-xs">
                    <span>
                      Total Rental Window: <strong>{addDurationHours}h</strong> · Rate: <strong>₹{STANDARD_HOURLY_RATE}/hr</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      Est. Payout: ₹{calculateRentalAmount(addDurationHours)}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs">
                    Mandatory return deadline must be strictly after the availability start time.
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew || !addScheduleValid}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span>{isSubmittingNew ? "Submitting..." : "Submit Registration"}</span>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 4: VEHICLE DETAILS MODAL ── */}
      {isDetailsModalOpen && vehicle && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-lg rounded-3xl bg-white p-6 sm:p-7 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {vehicle.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {vehicle.model} · {vehicle.vehicleType}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="h-44 rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={vehicle.imageUrl || "/scooter_xiaomi.jpg"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Rental Price</span>
                  <span className="font-bold text-gray-900">₹{STANDARD_HOURLY_RATE} / hour</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Designated Hub</span>
                  <span className="font-bold text-gray-900">{vehicle.locationHub}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">RC Registration</span>
                  <span className="font-mono font-bold text-gray-900">
                    {vehicle.documents?.rcNumber || "Pending"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-400 font-medium block">Admin Status</span>
                  <span className="font-bold capitalize text-emerald-800">
                    {vehicle.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <p>
                  <strong>Available Start:</strong>{" "}
                  {vehicle.availableFrom ||
                    `${vehicle.availableFromDate}, ${vehicle.availableFromTime}`}
                </p>
                <p>
                  <strong>Mandatory Return:</strong>{" "}
                  {vehicle.mustReturnBy ||
                    `${vehicle.returnDate}, ${vehicle.returnTime}`}
                </p>
                <p>
                  <strong>Insurance Expiry:</strong>{" "}
                  {vehicle.documents?.insuranceExpiry || "2027-12-31"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openDocPreview("Registration Certificate (RC)", vehicle.documents?.rcDocUrl || "/vehicle_rc_proof.svg");
                  }}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={12} className="text-emerald-700" />
                  <span>Inspect RC Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    openDocPreview("Vehicle Insurance Policy", vehicle.documents?.insuranceDocUrl || "/insurance_document_proof.svg");
                  }}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={12} className="text-emerald-700" />
                  <span>Inspect Insurance</span>
                </button>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 5: RETURN PHOTO INSPECTION MODAL ── */}
      {inspectReturnBooking && (
        <Dialog open={!!inspectReturnBooking} onOpenChange={() => setInspectReturnBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                Return Inspection: {inspectReturnBooking.vehicleName}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Booking ID: {inspectReturnBooking.id} · {inspectReturnBooking.campusHub}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2">
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
                <img
                  src={inspectReturnBooking.returnPhotoUrl || "/card_return.jpg"}
                  alt=""
                  className="w-full max-h-80 object-contain"
                />
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-xs space-y-1">
                <p>
                  <strong>Renter:</strong> {inspectReturnBooking.renterName} ({inspectReturnBooking.renterCampus})
                </p>
                <p>
                  <strong>Submission Time:</strong> {inspectReturnBooking.returnTimestamp || "Today"}
                </p>
                <p>
                  <strong>Student Note:</strong> {inspectReturnBooking.returnNotes || "Safe parking confirmed."}
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setInspectReturnBooking(null)}
                className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Close
              </button>
              {inspectReturnBooking.status === "returned" && (
                <button
                  type="button"
                  onClick={() => handleApproveReturnHandover(inspectReturnBooking)}
                  className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Verify & Release Payout</span>
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 6: REPORT RETURN ISSUE MODAL ── */}
      {reportModalBooking && (
        <Dialog open={!!reportModalBooking} onOpenChange={() => setReportModalBooking(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 font-sans">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>Report Return Issue to Admin</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Booking: {reportModalBooking.id} · {reportModalBooking.vehicleName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Issue Type</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="Vehicle Damage Observed">Vehicle Damage Observed</option>
                  <option value="Missing Helmet / Lock">Missing Helmet or Lock</option>
                  <option value="Wrong Dropoff Hub Location">Wrong Dropoff Hub Location</option>
                  <option value="Excessively Dirty / Vandalized">Excessively Dirty / Vandalized</option>
                  <option value="Suspicious Handover">Suspicious Handover</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Incident Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the discrepancy, damage notes, or missing items..."
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportModalBooking(null)}
                className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportIssueToAdmin}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Submit Incident Report
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── MODAL 6: VEHICLE DOCUMENT FULLSCREEN PREVIEW MODAL ── */}
      <Dialog open={docPreviewModalOpen} onOpenChange={setDocPreviewModalOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 font-sans">
          <DialogHeader className="border-b border-gray-100 pb-3 flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileCheck2 size={16} className="text-emerald-700" />
              <span>{docPreviewTitle}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 p-3">
              <img
                src={docPreviewUrl}
                alt={docPreviewTitle}
                className="max-h-[50vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Official campus micro-mobility fleet verification document • Encrypted MinIO storage
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setDocPreviewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MyVehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs text-gray-500">
          Loading My Vehicle...
        </div>
      }
    >
      <MyVehiclesContent />
    </Suspense>
  );
}
