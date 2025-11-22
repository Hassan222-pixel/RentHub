// app/api/renter/bookings/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // ✅ FIXED
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUserFromApi();
    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bookings = await Booking.find({ renter: user._id })
      .populate("dorm")
      .populate("client", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("GET /api/renter/bookings error:", err);
    return NextResponse.json(
      { message: "Failed to load bookings" },
      { status: 500 }
    );
  }
}
