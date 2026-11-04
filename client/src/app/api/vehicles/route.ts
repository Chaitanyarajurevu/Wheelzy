import { NextRequest, NextResponse } from "next/server";
import { dataStore, StoredVehicle } from "@/lib/dataStore";

// GET /api/vehicles - returns vehicles (optional filter by ownerId)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");

  if (ownerId) {
    const single = dataStore.getOwnerVehicle(ownerId);
    return NextResponse.json(single ? [single] : []);
  }

  const campus = searchParams.get("campus");
  const approvedOnly = searchParams.get("available") === "true";

  if (approvedOnly) {
    return NextResponse.json(dataStore.getApprovedAvailableVehicles(campus || undefined));
  }

  return NextResponse.json(dataStore.getVehicles());
}

// POST /api/vehicles - registers a new vehicle with strict 1-vehicle-per-owner backend enforcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ownerId) {
      return NextResponse.json(
        { error: "Owner identity is required." },
        { status: 400 }
      );
    }

    // Backend validation: Check whether owner already has a registered vehicle
    const existingVehicle = dataStore.getOwnerVehicle(body.ownerId);
    if (existingVehicle) {
      return NextResponse.json(
        { error: "You can register only one vehicle on Wheelzy." },
        { status: 400 }
      );
    }

    if (!body.name || !body.model || !body.category) {
      return NextResponse.json(
        { error: "Vehicle make, model, and category are required." },
        { status: 400 }
      );
    }

    const created = dataStore.addVehicle(body);
    return NextResponse.json({ success: true, vehicle: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to register vehicle." },
      { status: 400 }
    );
  }
}

// PATCH /api/vehicles - activates or deactivates availability
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, action, schedule } = body;

    if (!vehicleId || !action) {
      return NextResponse.json(
        { error: "vehicleId and action are required." },
        { status: 400 }
      );
    }

    if (action === "activate") {
      if (!schedule || !schedule.availableFromDate || !schedule.returnDate) {
        return NextResponse.json(
          { error: "All availability start and return deadline fields are mandatory." },
          { status: 400 }
        );
      }
      const res = dataStore.activateVehicleAvailability(vehicleId, schedule);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, vehicle: res.vehicle });
    }

    if (action === "deactivate") {
      const res = dataStore.deactivateVehicleAvailability(vehicleId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, vehicle: res.vehicle });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update vehicle status." },
      { status: 400 }
    );
  }
}

