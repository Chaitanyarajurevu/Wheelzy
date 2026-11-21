"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function StudentVerificationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/verification?tab=student");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center font-sans">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6 animate-pulse" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Redirecting to Verification Center...</h2>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        Student &amp; Aadhaar verification is now managed inside the unified Verification Center.
      </p>
      <Link
        href="/admin/verification?tab=student"
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
      >
        <span>Open Student Verification</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
