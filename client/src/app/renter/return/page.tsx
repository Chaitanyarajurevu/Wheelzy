"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  RotateCcw,
  Camera,
  Upload,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ImagePlus,
  X,
  Loader2,
  Navigation,
  AlertTriangle,
  CheckCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  ArrowLeft,
  FileText,
  Check,
} from "lucide-react";
import { dataStore, StoredBooking } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Condition = "no_damage" | "minor_damage" | "major_damage" | "other";

const CONDITIONS: {
  value: Condition;
  label: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}[] = [
  {
    value: "no_damage",
    label: "No Visible Damage",
    description: "Vehicle is in good condition, no scratches, dents, or operational issues.",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-300",
    badgeText: "text-emerald-800",
  },
  {
    value: "minor_damage",
    label: "Minor Damage",
    description: "Small scratches, cosmetic scuffs, or minor wear during the trip.",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-800",
  },
  {
    value: "major_damage",
    label: "Major Damage",
    description: "Significant structural, mechanical, motor, or body component damage.",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-800",
  },
  {
    value: "other",
    label: "Other Issue",
    description: "Flat tire, battery drain, chain slip, or another technical concern.",
    badgeBg: "bg-gray-50",
    badgeBorder: "border-gray-300",
    badgeText: "text-gray-800",
  },
];

export type GpsState = "idle" | "requesting" | "captured" | "denied";

const STEPS = [
  { num: 1, label: "Ride Review" },
  { num: 2, label: "Vehicle Condition" },
  { num: 3, label: "Return Photo" },
  { num: 4, label: "Final Review" },
  { num: 5, label: "Confirmation" },
];

function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const renterId = user?.id || "usr-renter-priya";
  const bookingIdParam = searchParams?.get("bookingId") || "";
  const initialStepParam = Number(searchParams?.get("step")) || 1;

  const [activeBookings, setActiveBookings] = useState<StoredBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookingIdParam);
  const [step, setStep] = useState<number>(initialStepParam);

  // STEP 2: Condition Review
  const [condition, setCondition] = useState<Condition>("no_damage");
  const [damageDescription, setDamageDescription] = useState<string>("");
  const [damagePhotoPreview, setDamagePhotoPreview] = useState<string | null>(null);

  // STEP 3: Return Photo & GPS
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; ts: string } | null>(null);
  const [returnNotes, setReturnNotes] = useState<string>("");

  // STEP 4: Final Review & Submission
  const [confirmedAccuracy, setConfirmedAccuracy] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // STEP 5: Confirmation Info
  const [completedReturnInfo, setCompletedReturnInfo] = useState<{
    bookingId: string;
    vehicleName: string;
    returnTimestamp: string;
    minioKey: string;
    gpsTimestamp?: string;
    condition: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const damageFileInputRef = useRef<HTMLInputElement>(null);

  // Load active bookings
  useEffect(() => {
    let list = dataStore
      .getRenterBookings(renterId)
      .filter((b) => b.status === "active" || b.status === "overdue");
    if (list.length === 0) {
      dataStore.resetRenterActiveRide(renterId);
      list = dataStore
        .getRenterBookings(renterId)
        .filter((b) => b.status === "active" || b.status === "overdue");
    }
    setActiveBookings(list);
    if (!selectedBookingId && list.length > 0) {
      setSelectedBookingId(list[0].id);
    }
  }, [renterId, selectedBookingId]);

  const activeBooking =
    activeBookings.find((b) => b.id === selectedBookingId) || activeBookings[0];

  // GPS Coordinate capture
  const requestGps = () => {
    setGpsState("requesting");
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsState("denied");
      toast.info("GPS geolocation is not supported on this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: Number(position.coords.latitude.toFixed(5)),
          lng: Number(position.coords.longitude.toFixed(5)),
          ts: new Date().toISOString(),
        });
        setGpsState("captured");
        toast.success("Campus quad GPS coordinates verified and attached!");
      },
      (error) => {
        console.warn("Geolocation permission error:", error.message);
        setGpsState("denied");
        toast.info("Location permission was not granted. Return photo will be recorded without GPS coordinates.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Photo handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
      toast.success("Return photo attached!");
    };
    reader.readAsDataURL(file);

    // Auto-request GPS when photo is captured if not already done
    if (gpsState === "idle") {
      requestGps();
    }
  };

  const handleUseDemoPhoto = () => {
    setPhotoPreview("/card_return.jpg");
    toast.success("Sample campus quad return photo loaded!");
    if (gpsState === "idle") {
      requestGps();
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Damage photo handler
  const handleDamagePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDamagePhotoPreview(ev.target?.result as string);
      toast.success("Supporting damage photo attached!");
    };
    reader.readAsDataURL(file);
  };

  // Final submission
  const handleSubmitReturn = () => {
    if (!activeBooking) {
      toast.error("No active booking selected for return.");
      return;
    }
    if (!photoPreview) {
      toast.error("Please upload a verified return photo in Step 3.");
      setStep(3);
      return;
    }
    if (!confirmedAccuracy) {
      toast.error("Please check the confirmation box verifying that details are accurate.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          clearInterval(interval);
          const minioKey = `minio://wheelzy-media/returns/ret_${activeBooking.id.toLowerCase()}_${Date.now()}.webp`;

          dataStore.submitReturnPhoto(
            activeBooking.id,
            photoPreview,
            returnNotes.trim() || "Vehicle returned securely at designated campus quad rack.",
            minioKey,
            gpsCoords ? { latitude: gpsCoords.lat, longitude: gpsCoords.lng, timestamp: gpsCoords.ts } : undefined,
            {
              condition,
              description: damageDescription.trim() || undefined,
              damagePhotoUrl: damagePhotoPreview || undefined,
            }
          );

          setCompletedReturnInfo({
            bookingId: activeBooking.id,
            vehicleName: activeBooking.vehicleName,
            returnTimestamp: new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            minioKey,
            gpsTimestamp: gpsCoords ? new Date(gpsCoords.ts).toLocaleTimeString() : undefined,
            condition: CONDITIONS.find((c) => c.value === condition)?.label || "Good Condition",
          });

          setIsSubmitting(false);
          setStep(5);
          toast.success("Return submitted successfully! Awaiting host verification.");
        }
        return next;
      });
    }, 200);
  };

  // Validation rules
  const needsDamageDetails = condition !== "no_damage";
  const canProceedStep2 = !needsDamageDetails || damageDescription.trim().length > 0;
  const canProceedStep3 = !!photoPreview;

  // Stepper navigation handler
  const handleStepClick = (targetStep: number) => {
    // Only allow navigating to previous steps or next step if validated
    if (targetStep < step) {
      setStep(targetStep);
    } else if (targetStep === 2) {
      setStep(2);
    } else if (targetStep === 3 && canProceedStep2) {
      setStep(3);
    } else if (targetStep === 4 && canProceedStep2 && canProceedStep3) {
      setStep(4);
    }
  };

  const currentTimeFormatted = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase">
              Campus Handover Protocol
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            End Ride &amp; Return Vehicle
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Complete the 5-step return verification to conclude your rental session safely.
          </p>
        </div>

        <Link
          href="/renter/active-rides"
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back to Active Ride</span>
        </Link>
      </div>

      {/* ── 5-Step Stepper Progress Indicator ── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-3 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            const isUpcoming = step < s.num;

            return (
              <React.Fragment key={s.num}>
                <div
                  onClick={() => isCompleted && handleStepClick(s.num)}
                  className={`flex flex-col items-center gap-1.5 transition-all select-none ${
                    isCompleted ? "cursor-pointer group" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? "bg-[#064E3B] text-white ring-4 ring-emerald-100 shadow-xs scale-105"
                        : isCompleted
                        ? "bg-emerald-600 text-white group-hover:bg-emerald-700"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {isCompleted ? <Check size={14} className="stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold text-center leading-tight transition-colors hidden sm:block ${
                      isCurrent
                        ? "text-[#064E3B]"
                        : isCompleted
                        ? "text-emerald-700 group-hover:text-emerald-900"
                        : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 sm:mx-2 transition-colors ${
                      step > s.num ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Multi-Booking Selector (if multiple active rides) ── */}
      {activeBookings.length > 1 && step < 5 && (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <RotateCcw size={14} className="text-emerald-700 shrink-0" />
            <span className="font-bold text-emerald-950">Active Rental Session:</span>
            <span className="text-gray-600">Select which vehicle you are returning</span>
          </div>
          <select
            value={selectedBookingId}
            onChange={(e) => {
              setSelectedBookingId(e.target.value);
              setStep(1);
            }}
            className="bg-white border border-emerald-300 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-900 outline-none cursor-pointer"
          >
            {activeBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.vehicleName} ({b.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Active Booking Present Check ── */}
      {activeBooking ? (
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 1: RIDE REVIEW                                          */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-5 sm:p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Step 1 of 5
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Ride Review &amp; Session Summary
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review the booking summary and rental details before proceeding to the condition check.
                </p>
              </div>

              {/* Vehicle Hero Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
                <div className="relative w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-emerald-200 shrink-0 shadow-2xs">
                  <img
                    src={activeBooking.vehicleImage || "/bike_hunter.jpg"}
                    alt={activeBooking.vehicleName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black bg-[#064E3B] text-white uppercase">
                    {activeBooking.category || "Bike"}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-500">
                      {activeBooking.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active In-Session
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {activeBooking.vehicleName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{activeBooking.vehicleModel}</p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <img
                        src={activeBooking.ownerAvatar}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-semibold truncate">
                        Host: {activeBooking.ownerName}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin size={11} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{activeBooking.campusHub}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Booking Start</p>
                  <p className="font-bold text-gray-900">
                    {activeBooking.actualStartTime || activeBooking.pickupTime}
                  </p>
                  <p className="text-[10px] text-gray-500">Session pickup</p>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-rose-500">Return Deadline</p>
                  <p className="font-bold text-rose-800">
                    {activeBooking.mandatoryReturnDeadline || activeBooking.dropoffTime}
                  </p>
                  <p className="text-[10px] text-rose-700/80">Scheduled return</p>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Rental Duration</p>
                  <p className="font-bold text-gray-900">
                    {activeBooking.durationHours || 4} Hours
                  </p>
                  <p className="text-[10px] text-gray-500">Owner-Defined</p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-emerald-800">Actual Return Time</p>
                  <p className="font-black text-emerald-950">{currentTimeFormatted}</p>
                  <p className="text-[10px] text-emerald-700">Current timestamp</p>
                </div>
              </div>

              {/* Pricing Breakdown Callout */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-gray-900">Standard Campus Rental Rate</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Fixed price of ₹100 / hour · Zero platform return fee
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Rental Cost</span>
                  <p className="text-lg font-black text-emerald-900">₹{activeBooking.totalCost}</p>
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Vehicle Condition</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 2: VEHICLE CONDITION REVIEW                              */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="p-5 sm:p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Step 2 of 5
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Vehicle Condition Review
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review and honestly declare the physical condition of the vehicle before completing your return.
                </p>
              </div>

              {/* Condition Options */}
              <div className="space-y-3">
                {CONDITIONS.map((c) => {
                  const isSelected = condition === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCondition(c.value)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? `${c.badgeBg} ${c.badgeBorder} shadow-2xs`
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">{c.label}</p>
                          {c.value === "no_damage" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Damage Details (Required if damage selected) */}
              {needsDamageDetails && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                    <span>Damage Description &amp; Notes (Required)</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Please describe any scratches, dents, chain slips, or mechanical issues in detail so our campus fleet team and vehicle host can assess repairs fairly.
                  </p>
                  <textarea
                    rows={3}
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    placeholder="e.g. Scratched left handlebar and kickstand scuff when parking at the library quad rack."
                    className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
                  />

                  {/* Supporting Damage Photo */}
                  <div className="space-y-2 pt-2 border-t border-amber-200/80">
                    <span className="font-bold text-gray-700 block">
                      Attach Supporting Damage Photo (Optional)
                    </span>
                    {!damagePhotoPreview ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => damageFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Camera size={13} className="text-emerald-700" />
                          <span>Attach Damage Photo</span>
                        </button>
                        <input
                          ref={damageFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleDamagePhotoChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={damagePhotoPreview}
                          alt="Damage evidence"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setDamagePhotoPreview(null)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/75 text-white hover:bg-black cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Photo Upload</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 3: RETURN PHOTO UPLOAD                                  */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-5 sm:p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Step 3 of 5
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Return Photo &amp; Location Verification
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Photograph the vehicle parked and locked at {activeBooking.campusHub}.
                </p>
              </div>

              {/* Verbatim Important Security Warning */}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span className="uppercase tracking-wider">Important Security Notice</span>
                </div>
                <p className="text-amber-900 leading-relaxed font-medium">
                  IMPORTANT: Upload a genuine, current photo of the returned vehicle at the agreed return location. Enable device location permission where available so Wheelzy can capture location evidence for return verification.
                </p>
              </div>

              {/* GPS Location Evidence Status */}
              <div className="p-3.5 sm:p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <Navigation size={13} className="text-emerald-700" />
                      <span>Campus Quad GPS Evidence</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5">
                      Designated Return Hub: <strong>{activeBooking.campusHub}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={requestGps}
                    disabled={gpsState === "requesting"}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {gpsState === "requesting"
                      ? "Capturing..."
                      : gpsState === "captured"
                      ? "Re-capture GPS"
                      : "Enable Location"}
                  </button>
                </div>

                {gpsState === "captured" && gpsCoords && (
                  <div className="flex items-center gap-2 text-emerald-900 bg-emerald-100/90 px-3 py-2 rounded-xl border border-emerald-300 font-semibold text-[11px]">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                    <span>
                      GPS Captured ✓ {gpsCoords.lat.toFixed(5)}° N, {gpsCoords.lng.toFixed(5)}° W (
                      {new Date(gpsCoords.ts).toLocaleTimeString()})
                    </span>
                  </div>
                )}

                {gpsState === "denied" && (
                  <div className="flex items-start gap-2 text-rose-800 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 text-[11px]">
                    <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      Location access was denied or sensor timed out. Your visual photo will be logged without GPS coordinates. Host will perform visual verification.
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Upload Area */}
              {!photoPreview ? (
                <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-8 sm:p-10 text-center bg-gray-50/60 space-y-3">
                  <ImagePlus className="w-12 h-12 text-emerald-600/60 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Upload Return Photo</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Capture a clear view of the parked vehicle and smart lock at the quad rack
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#053F30] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>Upload from Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleUseDemoPhoto}
                      className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={13} className="text-emerald-700" />
                      <span>Use Quad Demo Photo</span>
                    </button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-2xs bg-gray-100">
                    <img
                      src={photoPreview}
                      alt="Return verification preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/75 text-white hover:bg-black transition-colors cursor-pointer shadow-md"
                      title="Remove photo"
                    >
                      <X size={15} />
                    </button>
                    {gpsState === "captured" && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-emerald-800/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                        <Navigation size={11} />
                        <span>GPS Verified Stamp</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera size={13} />
                      <span>Retake Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload size={13} />
                      <span>Replace Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Hub Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Campus Quad Parking Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Parked safely at Bay 3 quad rack. Smart lock cable secured and key placed in quad safety box."
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-3 px-5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep3}
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Final Review</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 4: FINAL REVIEW                                         */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="p-5 sm:p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Step 4 of 5
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Final Review &amp; Confirmation
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm all return verification details before submitting to the campus fleet system.
                </p>
              </div>

              {/* Complete Summary Review */}
              <div className="space-y-4">
                {/* Vehicle & Trip Summary */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={activeBooking.vehicleImage || "/bike_hunter.jpg"}
                      alt=""
                      className="w-16 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <span className="font-mono text-[10px] font-bold text-gray-500">
                        {activeBooking.id}
                      </span>
                      <p className="text-sm font-bold text-gray-900">{activeBooking.vehicleName}</p>
                      <p className="text-[11px] text-gray-500">
                        {activeBooking.campusHub} · Host: {activeBooking.ownerName}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total Rental Cost</span>
                    <p className="text-base font-black text-emerald-950">₹{activeBooking.totalCost}</p>
                    <p className="text-[11px] text-gray-500">{activeBooking.durationHours || 4}h duration</p>
                  </div>
                </div>

                {/* Return Evidence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Uploaded Photo Review */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      Uploaded Return Photo
                    </span>
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      {photoPreview && (
                        <img
                          src={photoPreview}
                          alt="Return photo"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {gpsState === "captured" && (
                        <span className="absolute bottom-2 left-2 bg-emerald-800/90 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          GPS Stamped ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Condition & Timestamps */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 text-xs">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                      Condition &amp; Timing Verification
                    </span>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                        <span className="text-gray-500">Declared Condition:</span>
                        <span className="font-bold text-emerald-900">
                          {CONDITIONS.find((c) => c.value === condition)?.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                        <span className="text-gray-500">Actual Return Time:</span>
                        <span className="font-bold text-gray-900">{currentTimeFormatted}</span>
                      </div>

                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                        <span className="text-gray-500">Scheduled Deadline:</span>
                        <span className="font-semibold text-rose-800">
                          {activeBooking.mandatoryReturnDeadline || activeBooking.dropoffTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">GPS Evidence Status:</span>
                        <span
                          className={`font-bold ${
                            gpsState === "captured" ? "text-emerald-700" : "text-gray-500"
                          }`}
                        >
                          {gpsState === "captured"
                            ? `Captured ✓ (${gpsCoords?.lat.toFixed(4)}, ${gpsCoords?.lng.toFixed(4)})`
                            : "Visual Inspection Only"}
                        </span>
                      </div>
                    </div>

                    {damageDescription && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                        <p className="font-bold">Reported Damage Notes:</p>
                        <p className="text-amber-800">{damageDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Accuracy Confirmation Checkbox */}
                <label className="flex items-start gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmedAccuracy}
                    onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-950 leading-relaxed">
                    I confirm that the information and return photo provided are accurate.
                  </span>
                </label>

                {/* Upload Progress Simulation */}
                {isSubmitting && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Uploading to MinIO secure storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(3)}
                  className="py-3 px-5 rounded-xl border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft size={15} />
                  <span>Back to Photo</span>
                </button>
                <button
                  type="button"
                  disabled={!confirmedAccuracy || isSubmitting}
                  onClick={handleSubmitReturn}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting Return...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck size={16} />
                      <span>Submit Return Confirmation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* STEP 5: RETURN SUBMISSION SUCCESS                             */}
          {/* ───────────────────────────────────────────────────────────── */}
          {step === 5 && (
            <div className="p-6 sm:p-10 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
                <CheckCheck size={36} className="stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AWAITING VERIFICATION</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight pt-2">
                  Return Submitted Successfully
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  Your vehicle return record has been stored in Wheelzy. Host Marcus Vance has been notified and will verify the physical handover.
                </p>
              </div>

              {/* Submission Information Table */}
              <div className="max-w-md mx-auto bg-gray-50 rounded-2xl border border-gray-200/90 p-4 text-xs space-y-2.5 text-left">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/80">
                  <span className="text-gray-500">Booking ID:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {completedReturnInfo?.bookingId || activeBooking.id}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/80">
                  <span className="text-gray-500">Vehicle Name:</span>
                  <span className="font-bold text-gray-900">
                    {completedReturnInfo?.vehicleName || activeBooking.vehicleName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/80">
                  <span className="text-gray-500">Return Submission Time:</span>
                  <span className="font-bold text-gray-900">
                    {completedReturnInfo?.returnTimestamp || currentTimeFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/80">
                  <span className="text-gray-500">Return Photo Status:</span>
                  <span className="font-bold text-emerald-800">
                    Uploaded &amp; Stored (MinIO)
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/80">
                  <span className="text-gray-500">Verification Status:</span>
                  <span className="font-bold text-emerald-800">
                    Awaiting Host Inspection
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reported Condition:</span>
                  <span className="font-bold text-gray-900">
                    {completedReturnInfo?.condition || "No Visible Damage"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/renter/booking?tab=completed"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  View in My Bookings
                </Link>
                <Link
                  href="/renter/dashboard"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No Active Ride Found</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            You do not have any ongoing active rentals to return right now.
          </p>
          <div className="pt-2 flex justify-center gap-2.5">
            <Link
              href="/renter/browse"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-xs"
            >
              Browse Campus Rides
            </Link>
            <Link
              href="/renter/booking"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              My Bookings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RenterReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading return protocol...</p>
          </div>
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}
