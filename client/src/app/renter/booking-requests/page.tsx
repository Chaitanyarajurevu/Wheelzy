"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RenterBookingRequestsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/renter/booking?tab=pending");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center font-sans">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-gray-500 font-semibold mt-3 animate-pulse">
        Redirecting to My Bookings (Pending Requests)...
      </p>
    </div>
  );
}
