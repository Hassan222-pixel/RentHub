/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Load all pending requests for this renter
    const requestDocs = await Booking.find({
      renter: user._id,
      status: "pending",
    })
      .populate("dorm", "title profileImg city")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    // For each pending request, check if there is already a confirmed booking
    // for the same dorm and overlapping dates.
    const requestsWithConflictFlag = await Promise.all(
      requestDocs.map(async (doc) => {
        const conflictExists = await Booking.exists({
          _id: { $ne: doc._id },
          dorm: doc.dorm, // Mongoose will use the dorm _id
          status: "confirmed",
          startDate: { $lt: doc.endDate },
          endDate: { $gt: doc.startDate },
        });

        const obj = doc.toObject();
        return {
          ...obj,
          hasConflict: !!conflictExists,
        };
      })
    );

    return NextResponse.json({ requests: requestsWithConflictFlag });
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

    if (!bookingId || !["confirm", "cancel", "spam"].includes(action)) {
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
      // Before confirming, make sure there is no other confirmed booking
      // for the same dorm and overlapping dates.
      const overlappingConfirmed = await Booking.findOne({
        _id: { $ne: booking._id },
        dorm: booking.dorm,
        status: "confirmed",
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate },
      }).lean();

      if (overlappingConfirmed) {
        return NextResponse.json(
          {
            message:
              "This room already has a confirmed booking that overlaps this period.",
          },
          { status: 409 }
        );
      }

      booking.status = "confirmed";
      booking.cancelReason = undefined;
    } else if (action === "cancel") {
      // Normal rejection
      booking.status = "cancelled";
      booking.cancelReason = "renter_cancelled";
    } else if (action === "spam") {
      // Mark as conflict / spam for the client
      booking.status = "cancelled";
      booking.cancelReason = "conflict";
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
