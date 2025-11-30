// app/api/renter/bookings/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

export async function GET() {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bookings = await Booking.find({
      renter: user._id,
      status: "confirmed", // 👈 فقط الحجوزات المقبولة
    })
      .populate("dorm")
      .populate("client", "name email")
      .sort({ startDate: 1 })
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
