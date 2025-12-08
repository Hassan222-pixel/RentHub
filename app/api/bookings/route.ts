// app/api/bookings/route.ts
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

// GET /api/bookings?dormId=XXXX
// This is used by the client booking page to know which dates are already booked.
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

    // Only confirmed bookings should block the calendar
    const bookings = await Booking.find({
      dorm: dormId,
      status: "confirmed",
    })
      .select("startDate endDate")
      .lean();

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { message: "Failed to load bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings
// Create a new booking request (status: "pending")
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
    const { dormId, startDate, endDate } = body;

    if (!dormId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "dormId, startDate and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ message: "Invalid dates" }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Get dorm info (owner + prices)
    const dormDoc = await Dorm.findById(dormId).lean();

    if (!dormDoc || (dormDoc as any).isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const dorm: any = dormDoc;

    // Check if there is any confirmed booking overlapping this date range
    const overlapping = await Booking.findOne({
      dorm: dormId,
      status: "confirmed",
      startDate: { $lt: end }, // existing.start < newEnd
      endDate: { $gt: start }, // existing.end > newStart
    }).lean();

    if (overlapping) {
      return NextResponse.json(
        { message: "This room is not available in this period" },
        { status: 409 }
      );
    }

    // Compute duration in days
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = end.getTime() - start.getTime();
    const days = Math.ceil(diffMs / msPerDay);

    if (days <= 0) {
      return NextResponse.json(
        { message: "Booking duration must be at least 1 day" },
        { status: 400 }
      );
    }

    // Simple pricing logic
    let totalPrice = 0;

    if (dorm.pricePerMonth && days >= 28) {
      const months = Math.ceil(days / 30);
      totalPrice = months * dorm.pricePerMonth;
    } else if (dorm.pricePerWeek && days >= 7) {
      const weeks = Math.ceil(days / 7);
      totalPrice = weeks * dorm.pricePerWeek;
    } else if (dorm.pricePerNight) {
      totalPrice = days * dorm.pricePerNight;
    } else {
      return NextResponse.json(
        { message: "No valid pricing found for this dorm" },
        { status: 400 }
      );
    }

    // Create booking with status "pending" (request)
    const booking = await Booking.create({
      dorm: dormId,
      renter: dorm.owner,
      client: user._id,
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
