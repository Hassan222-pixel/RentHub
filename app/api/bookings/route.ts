/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Dorm } from "@/models/Dorm";
import {
  getDormCapacity,
  computeFullyBookedIntervals,
  type Interval,
} from "@/lib/availability";

// GET /api/bookings?dormId=XXXX
// Returns ONLY intervals where the dorm is FULLY BOOKED (for DatePicker disabling)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const dormId = searchParams.get("dormId");

    if (!dormId) {
      return NextResponse.json(
        { message: "dormId query parameter is required" },
        { status: 400 }
      );
    }

    const dormDoc: any = await Dorm.findById(dormId).lean();
    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const capacity = getDormCapacity(dormDoc);

    // Only bookings that reserve a bed: reserved OR confirmed
    const bookingDocs = await Booking.find({
      dorm: dormId,
      status: { $in: ["reserved", "confirmed"] },
    })
      .select("startDate endDate")
      .lean();

    const bookings: Interval[] = bookingDocs
      .map((b: any) => ({
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
      }))
      .filter((b) => b.startDate < b.endDate);

    const fullIntervals = computeFullyBookedIntervals(bookings, capacity);

    const responseBookings = fullIntervals.map((iv) => ({
      startDate: iv.startDate.toISOString(),
      endDate: iv.endDate.toISOString(),
    }));

    return NextResponse.json({ bookings: responseBookings });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { message: "Failed to load bookings" },
      { status: 500 }
    );
  }
}
