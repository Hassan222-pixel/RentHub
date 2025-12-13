/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

function getDormCapacity(dorm: any): number {
  if (!dorm) return 1;

  const roomType = dorm.roomType as "private" | "double" | "shared" | undefined;

  if (roomType === "private") return 1;
  if (roomType === "double") return 2;

  if (roomType === "shared") {
    if (typeof dorm.maxOccupants === "number" && dorm.maxOccupants > 0) {
      return dorm.maxOccupants;
    }
    return 1;
  }

  return 1;
}

export async function GET() {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requestDocs = await Booking.find({
      renter: user._id,
      status: "pending",
    })
      .populate("dorm", "title profileImg city roomType maxOccupants")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    const requestsWithConflictFlag = await Promise.all(
      requestDocs.map(async (doc) => {
        const obj = doc.toObject();

        const dorm: any = obj.dorm;
        const capacity = getDormCapacity(dorm);

        const overlappingConfirmedCount = await Booking.countDocuments({
          _id: { $ne: doc._id },
          dorm: doc.dorm,
          status: "confirmed",
          startDate: { $lt: doc.endDate },
          endDate: { $gt: doc.startDate },
        });

        const hasConflict = overlappingConfirmedCount >= capacity;

        return {
          ...obj,
          hasConflict,
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
      const dormDoc: any = await Dorm.findById(booking.dorm).lean();
      if (!dormDoc || dormDoc.isActive === false) {
        return NextResponse.json(
          { message: "Dorm not found" },
          { status: 404 }
        );
      }

      const capacity = getDormCapacity(dormDoc);

      const overlappingConfirmedCount = await Booking.countDocuments({
        _id: { $ne: booking._id },
        dorm: booking.dorm,
        status: "confirmed",
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate },
      });

      if (overlappingConfirmedCount >= capacity) {
        return NextResponse.json(
          {
            message:
              "This room already has the maximum confirmed bookings for this period.",
          },
          { status: 409 }
        );
      }

      booking.status = "confirmed";
      booking.cancelReason = undefined;
    } else if (action === "cancel") {
      booking.status = "cancelled";
      booking.cancelReason = "renter_cancelled";
    } else if (action === "spam") {
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
