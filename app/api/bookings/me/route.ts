/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

// GET /api/bookings/me
// Returns booking notifications for the logged-in client (e.g. conflicts)
export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    // If not logged in as client, just return empty notifications array
    if (!user || user.role !== "client") {
      return NextResponse.json({ notifications: [] }, { status: 200 });
    }

    const bookingDocs = await Booking.find({
      client: user._id,
      status: "cancelled",
      cancelReason: "conflict", // only conflicted bookings
    })
      .populate("dorm", "title")
      .sort({ updatedAt: -1 })
      .lean();

    const notifications = bookingDocs.map((b: any) => ({
      id: b._id.toString(),
      dormTitle: b.dorm?.title || "this room",
      startDate: b.startDate,
      endDate: b.endDate,
    }));

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("GET /api/bookings/me error:", err);
    // In case of error, fail gracefully with an empty list
    return NextResponse.json({ notifications: [] }, { status: 200 });
  }
}
