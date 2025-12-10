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

  if (roomType === "shared") {
    if (typeof dormDoc.maxOccupants === "number" && dormDoc.maxOccupants > 0) {
      return dormDoc.maxOccupants;
    }
    return 1;
  }

  return 1;
}

// GET /api/dorms?q=&roomType=
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const roomType = searchParams.get("roomType");

    // Base filter: only active dorms
    const filter: any = {
      isActive: true,
    };

    // Optional room type filter
    if (
      roomType &&
      ["private", "double", "shared"].includes(roomType.toLowerCase())
    ) {
      filter.roomType = roomType.toLowerCase();
    }

    // Optional text search
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { university: { $regex: q, $options: "i" } },
      ];
    }

    const dormDocs: any[] = await Dorm.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "title description profileImg roomType city university pricePerNight pricePerWeek pricePerMonth maxOccupants genderPreference"
      )
      .lean();

    const now = new Date();
    const dormIds = dormDocs.map((d) => d._id);

    // All active (current) confirmed bookings for these dorms
    const activeBookings = await Booking.find({
      dorm: { $in: dormIds },
      status: "confirmed",
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .select("dorm")
      .lean();

    // Count bookings per dorm
    const bookingsCountMap: Record<string, number> = {};
    for (const b of activeBookings) {
      const key = (b as any).dorm.toString();
      bookingsCountMap[key] = (bookingsCountMap[key] || 0) + 1;
    }

    const dorms = dormDocs.map((d) => {
      const idStr = d._id.toString();
      const capacity = getDormCapacity(d);
      const activeCount = bookingsCountMap[idStr] || 0;
      const availableBeds = Math.max(capacity - activeCount, 0);
      const isOccupiedNow = availableBeds <= 0;

      return {
        _id: idStr,
        title: d.title,
        description: d.description,
        profileImg: d.profileImg || null,
        roomType: d.roomType || null,
        city: d.city || "",
        university: d.university || "",
        pricePerNight: d.pricePerNight ?? null,
        pricePerWeek: d.pricePerWeek ?? null,
        pricePerMonth: d.pricePerMonth ?? null,
        maxOccupants: d.maxOccupants ?? null,
        genderPreference: d.genderPreference ?? null,
        capacity,
        availableBeds,
        isOccupiedNow,
      };
    });

    return NextResponse.json({ dorms });
  } catch (err) {
    console.error("GET /api/dorms error:", err);
    return NextResponse.json(
      { message: "Failed to load dorms" },
      { status: 500 }
    );
  }
}
