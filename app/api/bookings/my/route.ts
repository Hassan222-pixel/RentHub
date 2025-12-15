/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || user.role !== "client") {
      return NextResponse.json({ bookings: [] }, { status: 200 });
    }

    const docs = await Booking.find({
      client: user._id,
      status: { $in: ["reserved", "confirmed"] },
    })
      .populate("dorm", "title profileImg city roomType pricePerMonth")
      .sort({ startDate: -1 })
      .lean();

    const bookings = docs.map((b: any) => ({
      id: b._id.toString(),
      dorm: {
        id: b.dorm?._id?.toString() || "",
        title: b.dorm?.title || "Dorm",
        profileImg: b.dorm?.profileImg || null,
        city: b.dorm?.city || "",
        roomType: b.dorm?.roomType || null,
      },

      startDate: b.startDate,
      endDate: b.endDate,

      status: b.status, // reserved | confirmed
      paymentType: b.paymentType, // deposit | full
      paymentStatus: b.paymentStatus, // paid

      currency: b.currency || "USD",
      totalPrice: b.totalPrice || 0,

      depositAmount: b.depositAmount || 0,
      remainingAmount: b.remainingAmount || 0,
      deadlineToPayRest: b.deadlineToPayRest || null,

      createdAt: b.createdAt,
    }));

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("GET /api/bookings/my error:", err);
    return NextResponse.json({ bookings: [] }, { status: 200 });
  }
}
