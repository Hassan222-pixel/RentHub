/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

// ✅ Lean dorm shape (what we select from Mongo)
type DormLean = {
  _id: any;
  title?: string;
  city?: string;
  roomType?: string | null;
  adminAvailability?: "available" | "not_available" | string;
};

function isAdminRole(role?: string) {
  return (
    role === "super-admin" ||
    role === "accounts-admin" ||
    role === "managers-admin"
  );
}

function money(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function computePaidAmount(b: any) {
  // "adesh dafa3"
  // - confirmed + paid => totalPrice
  // - reserved + paid => depositAmount
  // - pending_payment => 0
  if (b.paymentStatus !== "paid") return 0;

  if (b.status === "confirmed") return money(b.totalPrice);
  if (b.status === "reserved") return money(b.depositAmount);

  // fallback
  if (b.paymentType === "full") return money(b.totalPrice);
  return money(b.depositAmount);
}

// GET: (1) list dorms that have bookings
// GET: (2) if dormId is passed => return booking details for that dorm
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dormId = searchParams.get("dormId");

    // ✅ DETAILS MODE: /api/dashboard/bookings?dormId=XXXX
    if (dormId) {
      // ✅ Cast lean result to DormLean so TS knows title exists
      const dorm = (await Dorm.findById(dormId)
        .select("title city roomType adminAvailability")
        .lean()) as DormLean | null;

      if (!dorm) {
        return NextResponse.json(
          { message: "Dorm not found" },
          { status: 404 },
        );
      }

      const bookings = await Booking.find({
        dorm: dormId,
        status: { $in: ["pending_payment", "reserved", "confirmed"] },
      })
        .sort({ startDate: 1 })
        .select(
          "clientFirstName clientLastName clientPhone startDate endDate totalPrice paymentType paymentStatus depositAmount remainingAmount status currency createdAt",
        )
        .lean();

      const items = bookings.map((b: any) => {
        const paidAmount = computePaidAmount(b);

        return {
          bookingId: b._id.toString(),
          clientFirstName: b.clientFirstName || "",
          clientLastName: b.clientLastName || "",
          clientPhone: b.clientPhone || "",
          startDate: new Date(b.startDate).toISOString(),
          endDate: new Date(b.endDate).toISOString(),
          totalPrice: money(b.totalPrice),
          depositAmount: money(b.depositAmount),
          remainingAmount: money(b.remainingAmount),
          paidAmount,
          paymentType: b.paymentType,
          paymentStatus: b.paymentStatus,
          status: b.status,
          currency: b.currency || "USD",
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
        };
      });

      return NextResponse.json({
        dorm: {
          dormId,
          title: dorm.title || "",
          city: dorm.city || "",
          roomType: dorm.roomType || null,
          adminAvailability: dorm.adminAvailability || "available",
        },
        bookings: items,
      });
    }

    // ✅ LIST MODE
    const agg = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["pending_payment", "reserved", "confirmed"] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$dorm",
          bookingsCount: { $sum: 1 },
          latestIsOngoing: { $first: "$isOngoing" },
          latestBookingCreatedAt: { $first: "$createdAt" },
        },
      },
    ]);

    const dormIds = agg.map((a: any) => a._id);

    // ✅ Cast array lean result
    const dormDocs = (await Dorm.find({ _id: { $in: dormIds } })
      .select("title city roomType adminAvailability")
      .lean()) as DormLean[];

    const dormMap: Record<string, DormLean> = {};
    for (const d of dormDocs) dormMap[d._id.toString()] = d;

    const items = agg
      .map((a: any) => {
        const dorm = dormMap[a._id.toString()];
        if (!dorm) return null;

        const mode = a.latestIsOngoing === true ? "ongoing" : "normal";

        return {
          dormId: a._id.toString(),
          title: dorm.title || "",
          city: dorm.city || "",
          roomType: dorm.roomType || null,
          adminAvailability: dorm.adminAvailability || "available",
          bookingsCount: a.bookingsCount || 0,
          latestBookingMode: mode,
          latestBookingCreatedAt: a.latestBookingCreatedAt
            ? new Date(a.latestBookingCreatedAt).toISOString()
            : null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/dashboard/bookings error:", err);
    return NextResponse.json(
      { message: "Failed to load booking dorms" },
      { status: 500 },
    );
  }
}

// PATCH: update adminAvailability for a dorm
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const dormId = body?.dormId as string | undefined;
    const adminAvailability = body?.adminAvailability as
      | "available"
      | "not_available"
      | undefined;

    if (!dormId || !adminAvailability) {
      return NextResponse.json(
        { message: "dormId and adminAvailability are required" },
        { status: 400 },
      );
    }

    if (!["available", "not_available"].includes(adminAvailability)) {
      return NextResponse.json(
        { message: "Invalid adminAvailability" },
        { status: 400 },
      );
    }

    const dorm = await Dorm.findById(dormId);
    if (!dorm) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    dorm.adminAvailability = adminAvailability;
    dorm.adminAvailabilityUpdatedAt = new Date();
    await dorm.save();

    return NextResponse.json({
      dormId: dorm._id.toString(),
      adminAvailability: dorm.adminAvailability,
      adminAvailabilityUpdatedAt: dorm.adminAvailabilityUpdatedAt,
    });
  } catch (err) {
    console.error("PATCH /api/dashboard/bookings error:", err);
    return NextResponse.json(
      { message: "Failed to update availability" },
      { status: 500 },
    );
  }
}
