"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReturnTrackingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/owner/my-vehicles?tab=returns");
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto p-12 text-center text-xs text-gray-500 font-sans">
      Redirecting to Return Tracking in My Vehicle...
    </div>
  );
}
