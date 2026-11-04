"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RenterHistoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/renter/booking?tab=completed");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Opening Booking History...</p>
      </div>
    </div>
  );
}
