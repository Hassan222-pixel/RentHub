/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";

// Helper: compute capacity based on dorm type
function getDormCapacity(dormDoc: any): number {
  const roomType = dormDoc.roomType as
    | "private"
    | "double"
    | "shared"
    | undefined;
  if (roomType === "private") return 1;
  if (roomType === "double") return 2;

  // shared -> use maxOccupants if set, otherwise fallback = 1
  if (roomType === "shared") {
    if (typeof dormDoc.maxOccupants === "number" && dormDoc.maxOccupants > 0) {
      return dormDoc.maxOccupants;
    }
    return 1;
  }

  // default safety
  return 1;
}

// For Next.js 16, params is a Promise and must be awaited
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // ✅ Await params to get the real id
    const { id } = await params;

    const dormDoc: any = await Dorm.findById(id).lean();

    // Not found or not active
    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const now = new Date();
    const dormId = dormDoc._id;

    const capacity = getDormCapacity(dormDoc);

    // Active bookings right now for this dorm (only confirmed & already started)
    const activeBookings = await Booking.find({
      dorm: dormId,
      status: "confirmed",
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .select("clientFirstName clientLastName clientPhone startDate endDate")
      .lean();

    const activeCount = activeBookings.length;
    const availableBeds = Math.max(capacity - activeCount, 0);

    // We consider "occupied" (Not available) only when fully full
    const isOccupiedNow = availableBeds <= 0;

    // If fully occupied, we show earliest endDate (when a bed will free up)
    let occupiedUntil: Date | null = null;
    if (isOccupiedNow && activeBookings.length > 0) {
      for (const b of activeBookings) {
        const e = new Date((b as any).endDate);
        if (!occupiedUntil || e < occupiedUntil) {
          occupiedUntil = e;
        }
      }
    }

    // Current tenants list (for UI on /room-details)
    const currentTenants = activeBookings.map((b: any) => ({
      firstName: b.clientFirstName || "",
      lastName: b.clientLastName || "",
      phone: b.clientPhone || "",
      startDate: b.startDate,
      endDate: b.endDate,
    }));

    return NextResponse.json({
      dorm: dormDoc,
      capacity,
      activeBookingsCount: activeCount,
      availableBeds,
      isOccupiedNow,
      occupiedUntil,
      currentTenants,
    });
  } catch (err) {
    console.error("GET /api/dorms/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to load dorm" },
      { status: 500 }
    );
  }
}
