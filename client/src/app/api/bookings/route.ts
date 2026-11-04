import { NextRequest, NextResponse } from "next/server";
import { dataStore, StoredBooking, STANDARD_HOURLY_RATE } from "@/lib/dataStore";

// GET /api/bookings - query bookings by owner, renter, or status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");
  const renterId = searchParams.get("renterId");
  const status = searchParams.get("status") as StoredBooking["status"] | null;

  let list = dataStore.getBookings();

  if (ownerId) {
    list = list.filter((b) => b.ownerId === ownerId);
  }
  if (renterId) {
    list = list.filter((b) => b.renterId === renterId);
  }
  if (status) {
    list = list.filter((b) => b.status === status);
  }

  return NextResponse.json(list);
}

// POST /api/bookings - submit a new booking request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, renterId, campusHub, pickupTime, dropoffTime, durationHours } = body;

    if (!vehicleId || !renterId) {
      return NextResponse.json(
        { error: "vehicleId and renterId are required." },
        { status: 400 }
      );
    }

    const vehicle = dataStore.getVehicleById(vehicleId);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    if (vehicle.status !== "approved" || !vehicle.isAvailable) {
      return NextResponse.json(
        { error: "Vehicle is not currently available for reservations." },
        { status: 400 }
      );
    }

    const renter = dataStore.getUserById(renterId);
    if (!renter) {
      return NextResponse.json({ error: "Renter user profile not found." }, { status: 404 });
    }

    // Check for scheduling conflicts
    const hasOverlap = dataStore.checkVehicleOverlap(vehicle.id, pickupTime, dropoffTime);
    if (hasOverlap) {
      return NextResponse.json(
        { error: "A reservation already exists or is pending for this time slot." },
        { status: 409 }
      );
    }

    const created = dataStore.createBooking({
      vehicle,
      renter,
      campusHub: campusHub || vehicle.locationHub,
      pickupTime: pickupTime || vehicle.availableFrom,
      dropoffTime: dropoffTime || vehicle.mustReturnBy,
      durationHours: durationHours || vehicle.rentalDurationHours,
      mandatoryReturnDeadline: vehicle.mustReturnBy,
    });

    return NextResponse.json({ success: true, booking: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create booking request." },
      { status: 400 }
    );
  }
}

// PATCH /api/bookings - approve, reject, start, or complete booking
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, action, reason } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: "bookingId and action are required." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const res = dataStore.approveBooking(bookingId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, booking: res.booking });
    }

    if (action === "reject") {
      const res = dataStore.rejectBooking(bookingId, reason);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, booking: res.booking });
    }

    if (action === "start") {
      const res = dataStore.startRide(bookingId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, booking: res.booking });
    }

    if (action === "complete") {
      const updated = dataStore.updateBookingStatus(bookingId, "completed");
      if (!updated) {
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process booking action." },
      { status: 400 }
    );
  }
}

