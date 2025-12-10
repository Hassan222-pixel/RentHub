/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string; // "client" | "renter" | "super-admin" | ...
};

// Helper: capacity based on dorm type
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

// Helper: from list of bookings, compute intervals where room is FULL (count >= capacity)
function computeFullyBookedIntervals(
  bookings: { startDate: Date; endDate: Date }[],
  capacity: number
): { startDate: Date; endDate: Date }[] {
  if (capacity <= 1) {
    // For private rooms, every booking blocks the whole period
    return bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
    }));
  }

  if (bookings.length === 0) return [];

  type Event = { time: Date; delta: number };

  const events: Event[] = [];
  for (const b of bookings) {
    events.push({ time: b.startDate, delta: +1 });
    events.push({ time: b.endDate, delta: -1 });
  }

  // Sort: by time asc, and if same time => +1 before -1
  events.sort((a, b) => {
    const ta = a.time.getTime();
    const tb = b.time.getTime();
    if (ta !== tb) return ta - tb;
    return b.delta - a.delta;
  });

  const result: { startDate: Date; endDate: Date }[] = [];
  let currentCount = 0;
  let fullStart: Date | null = null;

  for (const ev of events) {
    const prevCount = currentCount;
    currentCount += ev.delta;

    // When we cross from capacity-1 -> capacity => start full interval
    if (prevCount < capacity && currentCount >= capacity) {
      fullStart = ev.time;
    }

    // When we go from capacity -> capacity-1 => end full interval
    if (prevCount >= capacity && currentCount < capacity && fullStart) {
      result.push({ startDate: fullStart, endDate: ev.time });
      fullStart = null;
    }
  }

  return result;
}

// GET /api/bookings?dormId=XXXX
// Now returns only intervals where the dorm is FULLY BOOKED (for DatePicker disabling)
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

    // All confirmed bookings for this dorm
    const bookingDocs = await Booking.find({
      dorm: dormId,
      status: "confirmed",
    })
      .select("startDate endDate")
      .lean();

    const bookings = bookingDocs.map((b: any) => ({
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
    }));

    const fullIntervals = computeFullyBookedIntervals(bookings, capacity);

    // Map back to JSON objects with ISO strings
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

// POST /api/bookings
// Create a new booking request (status: "pending") - MONTHLY only
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as (CurrentUser & any) | null;

    // User must be logged in
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only client can create bookings
    if (user.role !== "client") {
      return NextResponse.json(
        { message: "Only clients can create bookings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      dormId,
      startDate,
      months,
      firstName,
      lastName,
      phone,
    }: {
      dormId?: string;
      startDate?: string;
      months?: number;
      firstName?: string;
      lastName?: string;
      phone?: string;
    } = body;

    if (!dormId || !startDate || !months) {
      return NextResponse.json(
        { message: "dormId, startDate and months are required" },
        { status: 400 }
      );
    }

    if (months < 1 || months > 3) {
      return NextResponse.json(
        { message: "Months must be between 1 and 3" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { message: "Invalid startDate" },
        { status: 400 }
      );
    }

    // Compute end date = start date + months
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);

    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Get dorm info
    const dormDoc: any = await Dorm.findById(dormId).lean();

    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const capacity = getDormCapacity(dormDoc);

    // 1) Prevent the SAME client from booking the SAME dorm more than once
    const existingClientBooking = await Booking.findOne({
      dorm: dormId,
      client: user._id,
      status: { $in: ["pending", "confirmed"] },
    }).lean();

    if (existingClientBooking) {
      return NextResponse.json(
        {
          message: "You already have a booking for this room.",
        },
        { status: 400 }
      );
    }

    // 2) Check how many confirmed bookings overlap this period
    const overlappingConfirmedCount = await Booking.countDocuments({
      dorm: dormId,
      status: "confirmed",
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlappingConfirmedCount >= capacity) {
      return NextResponse.json(
        {
          message: "This room is fully booked in this period",
        },
        { status: 409 }
      );
    }

    // Pricing: monthly-only
    if (!dormDoc.pricePerMonth) {
      return NextResponse.json(
        { message: "Monthly price is not available for this dorm" },
        { status: 400 }
      );
    }

    const totalPrice = dormDoc.pricePerMonth * months;

    // Create booking with status "pending" (request)
    const booking = await Booking.create({
      dorm: dormId,
      renter: dormDoc.owner,
      client: user._id,
      clientFirstName: firstName ?? "",
      clientLastName: lastName ?? "",
      clientPhone: phone ?? "",
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { message: "Failed to create booking" },
      { status: 500 }
    );
  }
}
