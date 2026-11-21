"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function OwnerDocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/owner/profile");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4 font-sans">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
        <ShieldCheck size={32} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Redirecting to Profile &amp; Verification</h2>
        <p className="text-xs text-gray-500 mt-1">
          Vehicle documents are managed in My Vehicle, and Student ID is in Profile &amp; Verification.
        </p>
      </div>
      <Link
        href="/owner/profile"
        className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
      >
        Go to Profile &amp; Verification
      </Link>
    </div>
  );
}
