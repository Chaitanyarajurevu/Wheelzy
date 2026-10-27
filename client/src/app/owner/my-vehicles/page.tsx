"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyVehiclesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/owner/listings");
  }, [router]);
  return null;
}
