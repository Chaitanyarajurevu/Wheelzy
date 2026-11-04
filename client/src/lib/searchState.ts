// ============================================================
// WHEELZY – Search State Persistence (sessionStorage only)
// Stores pending search params across the login redirect flow.
// NEVER stores Aadhaar, passwords, or sensitive personal data.
// ============================================================

export interface PendingSearchState {
  campus: string;
  vehicleType: string; // "All" | "Bike" | "Scooter"
  pickupDate: string;   // YYYY-MM-DD
  pickupTime: string;   // e.g. "09:00 AM"
  dropoffDate: string;  // YYYY-MM-DD
  dropoffTime: string;  // e.g. "05:00 PM"
  selectedVehicleId?: string; // optional — navigate directly to a vehicle
}

const KEY = "wheelzy_pending_search";

export function savePendingSearch(state: PendingSearchState): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore – sessionStorage unavailable (SSR / private mode edge case)
  }
}

export function getPendingSearch(): PendingSearchState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSearchState;
  } catch {
    return null;
  }
}

export function clearPendingSearch(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// ── Date / Time helpers ──────────────────────────────────────

/** Convert YYYY-MM-DD + "9:00 AM" string into a JS timestamp (ms). */
export function parseToTimestamp(date: string, time: string): number {
  if (!date || !time) return 0;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = (match[3] || "").toUpperCase();
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const isoString = `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  const ms = new Date(isoString).getTime();
  return isNaN(ms) ? 0 : ms;
}

/** Format a PendingSearchState into a human-readable summary string. */
export function formatDisplaySchedule(s: PendingSearchState): string {
  const campusPrefix = s.campus ? `${s.campus} · ` : "";
  return `${campusPrefix}${s.vehicleType === "All" ? "All Rides" : s.vehicleType + "s"} · ${s.pickupDate} ${s.pickupTime} → ${s.dropoffDate} ${s.dropoffTime}`;
}

/** Validate a pending search form. Returns error string or null if valid. */
export function validateSearchForm(s: PendingSearchState): string | null {
  if (!s.pickupDate || !s.pickupTime) return "Please select a pickup date and time.";
  if (!s.dropoffDate || !s.dropoffTime) return "Please select a dropoff date and time.";

  const pickupMs = parseToTimestamp(s.pickupDate, s.pickupTime);
  const dropoffMs = parseToTimestamp(s.dropoffDate, s.dropoffTime);

  if (pickupMs <= 0 || dropoffMs <= 0) return "Invalid date or time values.";
  if (dropoffMs <= pickupMs) return "Drop-off must be after pickup time.";

  return null;
}

/** Build the renter browse URL with all search params (including optional vehicleId). */
export function buildBrowseSearchUrl(s: PendingSearchState): string {
  const params = new URLSearchParams();
  if (s.campus) params.set("campus", s.campus);
  if (s.vehicleType) params.set("vehicleType", s.vehicleType);
  if (s.pickupDate) params.set("pickupDate", s.pickupDate);
  if (s.pickupTime) params.set("pickupTime", s.pickupTime);
  if (s.dropoffDate) params.set("dropoffDate", s.dropoffDate);
  if (s.dropoffTime) params.set("dropoffTime", s.dropoffTime);
  params.set("autoSearch", "1");
  if (s.selectedVehicleId) params.set("vehicleId", s.selectedVehicleId);
  return `/renter/browse?${params.toString()}`;
}

