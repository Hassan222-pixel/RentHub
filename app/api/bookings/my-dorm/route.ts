/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    // Only clients can have this check
    if (!user || user.role !== "client") {
      return NextResponse.json({ hasBooking: false }, { status: 200 });
    }

    const { searchParams } = new URL(req.url);
    const dormId = searchParams.get("dormId");

    if (!dormId) {
      return NextResponse.json(
        { message: "dormId query parameter is required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      dorm: dormId,
      client: user._id,
      status: { $in: ["pending", "confirmed"] },
    })
      .select("status startDate endDate")
      .lean();

    if (!booking) {
      return NextResponse.json({ hasBooking: false });
    }

    return NextResponse.json({
      hasBooking: true,
      booking: {
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
      },
    });
  } catch (err) {
    console.error("GET /api/bookings/my-dorm error:", err);
    return NextResponse.json(
      { message: "Failed to check booking" },
      { status: 500 }
    );
  }
}
