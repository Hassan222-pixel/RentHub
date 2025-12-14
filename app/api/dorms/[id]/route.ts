/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";

function getDormCapacity(dormDoc: any): number {
  const roomType = dormDoc.roomType as
    | "private"
    | "double"
    | "shared"
    | undefined;
  if (roomType === "private") return 1;
  if (roomType === "double") return 2;

  if (roomType === "shared") {
    if (typeof dormDoc.maxOccupants === "number" && dormDoc.maxOccupants > 0) {
      return dormDoc.maxOccupants;
    }
    return 1;
  }
  return 1;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const dormDoc: any = await Dorm.findById(id).lean();

    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const adminAvailability =
      (dormDoc.adminAvailability as
        | "available"
        | "not_available"
        | undefined) || "available";
    const isAdminBlocked = adminAvailability === "not_available";

    const now = new Date();
    const dormId = dormDoc._id;
    const capacity = getDormCapacity(dormDoc);

    const activeBookings = await Booking.find({
      dorm: dormId,
      status: { $in: ["reserved", "confirmed"] },
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .select(
        "clientFirstName clientLastName clientPhone startDate endDate paymentType"
      )
      .lean();

    const activeCount = activeBookings.length;
    const computedAvailableBeds = Math.max(capacity - activeCount, 0);
    const computedOccupiedNow = computedAvailableBeds <= 0;

    const availableBeds = isAdminBlocked ? 0 : computedAvailableBeds;
    const isOccupiedNow = isAdminBlocked ? true : computedOccupiedNow;

    let occupiedUntil: Date | null = null;
    if (isOccupiedNow && activeBookings.length > 0) {
      for (const b of activeBookings) {
        const e = new Date((b as any).endDate);
        if (!occupiedUntil || e < occupiedUntil) occupiedUntil = e;
      }
    }

    const currentTenants = activeBookings.map((b: any) => ({
      firstName: b.clientFirstName || "",
      lastName: b.clientLastName || "",
      phone: b.clientPhone || "",
      startDate: b.startDate,
      endDate: b.endDate,
      paymentType: b.paymentType,
    }));

    return NextResponse.json({
      dorm: dormDoc,
      capacity,
      activeBookingsCount: activeCount,
      availableBeds,
      isOccupiedNow,
      occupiedUntil,
      currentTenants,

      adminAvailability,
      isAdminBlocked,
    });
  } catch (err) {
    console.error("GET /api/dorms/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to load dorm" },
      { status: 500 }
    );
  }
}
