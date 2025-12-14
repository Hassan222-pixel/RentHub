/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";

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

function toMonthStart(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// Compute intervals where room is FULL (count >= capacity)
function computeFullyBookedIntervals(
  bookings: { startDate: Date; endDate: Date }[],
  capacity: number
): { startDate: Date; endDate: Date }[] {
  if (bookings.length === 0) return [];

  // For private rooms, any booking blocks the whole interval
  if (capacity <= 1) {
    return bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
    }));
  }

  type Event = { time: Date; delta: number };
  const events: Event[] = [];

  for (const b of bookings) {
    events.push({ time: b.startDate, delta: +1 });
    events.push({ time: b.endDate, delta: -1 });
  }

  // Sort by time asc; if same time => +1 before -1
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

    if (prevCount < capacity && currentCount >= capacity) {
      fullStart = ev.time;
    }

    if (prevCount >= capacity && currentCount < capacity && fullStart) {
      result.push({ startDate: fullStart, endDate: ev.time });
      fullStart = null;
    }
  }

  return result;
}

// Merge overlapping/touching [start,end] intervals
function mergeIntervals(intervals: { startDate: Date; endDate: Date }[]) {
  if (intervals.length <= 1) return intervals;

  const sorted = [...intervals].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  const merged: { startDate: Date; endDate: Date }[] = [];
  let cur = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // Since DatePicker makes end inclusive (end set to 23:59), treat touching as merge.
    // If next.start <= cur.end => overlap/touch
    if (next.startDate.getTime() <= cur.endDate.getTime()) {
      if (next.endDate.getTime() > cur.endDate.getTime()) {
        cur.endDate = next.endDate;
      }
    } else {
      merged.push(cur);
      cur = { ...next };
    }
  }

  merged.push(cur);
  return merged;
}

// Find earliest date >= todayMidnight that is NOT inside any fully-booked interval
// (intervals are month-start aligned; DatePicker treats end as inclusive day,
// so first allowed day is endDate + 1 day)
function computeAvailableFromDate(
  fullIntervals: { startDate: Date; endDate: Date }[],
  todayMidnight: Date
): Date {
  if (fullIntervals.length === 0) return todayMidnight;

  const merged = mergeIntervals(fullIntervals);

  let candidate = new Date(todayMidnight);
  candidate.setHours(0, 0, 0, 0);

  // If candidate falls inside any interval => jump to end+1day and continue
  for (const iv of merged) {
    const s = new Date(iv.startDate);
    const e = new Date(iv.endDate);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    const inInterval =
      candidate.getTime() >= s.getTime() && candidate.getTime() <= e.getTime();

    if (inInterval) {
      candidate = addDays(e, 1);
      // continue scanning, because there might be another interval after it
      continue;
    }

    // If candidate is before this interval, it is already valid (stop)
    if (candidate.getTime() < s.getTime()) {
      break;
    }
  }

  return candidate;
}

// GET /api/dorms?q=&roomType=
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const roomType = searchParams.get("roomType");

    const filter: any = { isActive: true };

    if (
      roomType &&
      ["private", "double", "shared"].includes(roomType.toLowerCase())
    ) {
      filter.roomType = roomType.toLowerCase();
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { university: { $regex: q, $options: "i" } },
      ];
    }

    const dormDocs: any[] = await Dorm.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "title description profileImg roomType city university pricePerNight pricePerWeek pricePerMonth maxOccupants genderPreference adminAvailability"
      )
      .lean();

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const dormIds = dormDocs.map((d) => d._id);

    // For "beds now" (occupied now):
    const activeBookingsNow = await Booking.find({
      dorm: { $in: dormIds },
      status: { $in: ["reserved", "confirmed"] },
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .select("dorm")
      .lean();

    const bookingsCountMap: Record<string, number> = {};
    for (const b of activeBookingsNow) {
      const key = (b as any).dorm.toString();
      bookingsCountMap[key] = (bookingsCountMap[key] || 0) + 1;
    }

    // For "availableFrom" (same month-aligned logic as DatePicker):
    const allBookingDocs = await Booking.find({
      dorm: { $in: dormIds },
      status: { $in: ["reserved", "confirmed"] },
    })
      .select("dorm startDate endDate")
      .lean();

    const bookingsByDorm: Record<string, { startDate: Date; endDate: Date }[]> =
      {};

    for (const b of allBookingDocs) {
      const dormId = (b as any).dorm.toString();
      const rawStart = new Date((b as any).startDate);
      const rawEnd = new Date((b as any).endDate);

      // ✅ Month-align EXACTLY like /api/bookings
      const start = toMonthStart(rawStart);
      const endCandidate = toMonthStart(rawEnd);

      const end =
        endCandidate.getTime() > start.getTime()
          ? endCandidate
          : addMonths(start, 1);

      if (!bookingsByDorm[dormId]) bookingsByDorm[dormId] = [];
      bookingsByDorm[dormId].push({ startDate: start, endDate: end });
    }

    const dorms = dormDocs.map((d) => {
      const idStr = d._id.toString();
      const capacity = getDormCapacity(d);

      const adminAvailability =
        (d.adminAvailability as "available" | "not_available" | undefined) ||
        "available";

      const isAdminBlocked = adminAvailability === "not_available";

      const activeCountNow = bookingsCountMap[idStr] || 0;
      const computedAvailableBeds = Math.max(capacity - activeCountNow, 0);
      const computedOccupiedNow = computedAvailableBeds <= 0;

      // ✅ card availability: admin block overrides
      const availableBeds = isAdminBlocked ? 0 : computedAvailableBeds;
      const isOccupiedNow = isAdminBlocked ? true : computedOccupiedNow;

      // ✅ availableFrom: based on fully-booked intervals (DatePicker-compatible)
      let availableFrom: string | null = null;
      if (!isAdminBlocked) {
        const alignedBookings = bookingsByDorm[idStr] || [];
        const fullIntervals = computeFullyBookedIntervals(
          alignedBookings,
          capacity
        );

        const fromDate = computeAvailableFromDate(fullIntervals, today);
        availableFrom = fromDate.toISOString();
      }

      return {
        _id: idStr,
        title: d.title,
        description: d.description,
        profileImg: d.profileImg || null,
        roomType: d.roomType || null,
        city: d.city || "",
        university: d.university || "",
        pricePerNight: d.pricePerNight ?? null,
        pricePerWeek: d.pricePerWeek ?? null,
        pricePerMonth: d.pricePerMonth ?? null,
        maxOccupants: d.maxOccupants ?? null,
        genderPreference: d.genderPreference ?? null,

        capacity,
        availableBeds,
        isOccupiedNow,

        // ✅ NEW
        availableFrom,

        adminAvailability,
        isAdminBlocked,
      };
    });

    return NextResponse.json({ dorms });
  } catch (err) {
    console.error("GET /api/dorms error:", err);
    return NextResponse.json(
      { message: "Failed to load dorms" },
      { status: 500 }
    );
  }
}
