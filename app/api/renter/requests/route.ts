// app/api/renter/requests/route.ts
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

    const requests = await Booking.find({
      renter: user._id,
      status: "pending",
    })
      .populate("dorm", "title profileImg city")
      .populate("client", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/renter/requests error:", err);
    return NextResponse.json(
      { message: "Failed to load requests" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, action } = await req.json();

    if (!bookingId || !["confirm", "cancel"].includes(action)) {
      return NextResponse.json(
        { message: "bookingId and valid action are required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      renter: user._id,
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { message: "Only pending bookings can be updated" },
        { status: 400 }
      );
    }

    if (action === "confirm") {
      booking.status = "confirmed";
    } else if (action === "cancel") {
      booking.status = "cancelled";
    }

    await booking.save();

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("PATCH /api/renter/requests error:", err);
    return NextResponse.json(
      { message: "Failed to update booking" },
      { status: 500 }
    );
  }
}
