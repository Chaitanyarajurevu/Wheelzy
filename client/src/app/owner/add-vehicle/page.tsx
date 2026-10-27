"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Upload, PlusCircle, CheckCircle2, Shield, Info, ArrowLeft } from "lucide-react";
import { dataStore, StoredVehicle } from "@/lib/dataStore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

export default function AddVehiclePage() {
  const router = useRouter();
  const { user } = useAuth();
  const ownerId = (user && user.role === "owner") ? user.id : "usr-owner-marcus";

  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<"Bike" | "Scooter">("Scooter");
  const [vehicleType, setVehicleType] = useState<StoredVehicle["vehicleType"]>("Electric Scooter");
  const [campus, setCampus] = useState(user?.campus || "UC Berkeley");
  const [hub, setHub] = useState("Sproul Plaza Hub");
  const [hourlyPrice, setHourlyPrice] = useState("4.00");
  const [rcNumber, setRcNumber] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("2027-12-31");
  const [selectedPhoto, setSelectedPhoto] = useState("/scooter_xiaomi.jpg");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !model || !hourlyPrice) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);

    dataStore.addVehicle({
      name,
      model,
      category,
      vehicleType,
      campus,
      locationHub: hub,
      hourlyPrice: parseFloat(hourlyPrice),
      imageUrl: selectedPhoto,
      isAvailable: false,
      status: "pending_approval",
      ownerId,
      ownerName: user?.name || "Marcus Vance",
      ownerCollege: user?.collegeYear ? `${campus} · ${user.collegeYear}` : campus,
      ownerAvatar: user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      features: ["Verified Lock", "Helmet Included", "Campus Geofenced"],
      documents: {
        rcNumber: rcNumber || `RC-${Math.floor(10000 + Math.random() * 90000)}`,
        rcMinioKey: `minio://wheelzy-docs/vehicles/rc_${Date.now()}.pdf`,
        insuranceExpiry,
        verified: false,
      },
    });

    toast.success("Ride submitted for administrative verification!");
    setTimeout(() => {
      router.push("/owner/listings");
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-sans">
      <div className="flex items-center gap-3">
        <Link
          href="/owner/listings"
          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add a Ride to Wheelzy</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Register your two-wheeler to begin earning peer-to-peer campus rental income.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Vehicle Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Car size={16} className="text-emerald-600" />
            <span>Vehicle Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Make & Model</label>
              <input
                type="text"
                required
                placeholder="e.g. Xiaomi Mi Electric Pro 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Trim / Specification</label>
              <input
                type="text"
                required
                placeholder="e.g. 45km Range Dual Brake"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as "Bike" | "Scooter";
                  setCategory(cat);
                  if (cat === "Bike") setSelectedPhoto("/bike_trek.jpg");
                  else setSelectedPhoto("/scooter_xiaomi.jpg");
                }}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="Scooter">Scooter (Electric / Motor)</option>
                <option value="Bike">Bicycle / Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              >
                <option value="Electric Scooter">Electric Scooter</option>
                <option value="Hybrid Bicycle">Hybrid Bicycle</option>
                <option value="Motor Scooter">Motor Scooter</option>
                <option value="Motorcycle">Motorcycle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Campus Location */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Pricing & Designated Campus Quad Hub
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hourly Price ($/hour)</label>
              <input
                type="number"
                step="0.5"
                required
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
              <span className="text-[10px] text-gray-400">Recommended student rate: $3.50 – $6.00/hr</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Designated Pickup Hub</label>
              <input
                type="text"
                required
                value={hub}
                onChange={(e) => setHub(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
              <span className="text-[10px] text-gray-400">Campus location where ride is kept locked</span>
            </div>
          </div>
        </div>

        {/* MinIO Document Upload Simulation */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
            Vehicle Registration & MinIO Document Storage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">RC / Serial Number</label>
              <input
                type="text"
                placeholder="e.g. CA-RC-88192"
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Insurance Validity</label>
              <input
                type="date"
                value={insuranceExpiry}
                onChange={(e) => setInsuranceExpiry(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center bg-emerald-50/20">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-800">Upload Registration Document (PDF/JPG)</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Securely stored in MinIO S3 bucket (<span className="font-mono text-emerald-700">minio://wheelzy-docs/</span>)
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-green-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Submit Vehicle for Admin Approval</span>
        </button>
      </form>
    </div>
  );
}
