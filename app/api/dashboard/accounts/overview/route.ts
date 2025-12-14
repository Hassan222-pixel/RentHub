/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
};

function toNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// ✅ Money actually received so far (deposit/full)
function getPaidAmount(b: any) {
  // only called when paymentStatus === "paid"
  if (b.status === "confirmed") return toNumber(b.totalPrice);
  // reserved => deposit paid
  return toNumber(b.depositAmount);
}

function toDayKeyUTC(d: Date) {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const yyyy = x.getUTCFullYear();
  const mm = String(x.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(x.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysUTC(date: Date, days: number) {
  const x = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || !["super-admin", "accounts-admin"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ last 30 days window (UTC)
    const todayUTC = new Date();
    const startUTC = addDaysUTC(todayUTC, -29);

    // ✅ Only PAID bookings that affect money
    const bookingsRaw = await Booking.find({
      paymentStatus: "paid",
      status: { $in: ["reserved", "confirmed"] },
      createdAt: { $gte: startUTC }, // daily graph range
    })
      .sort({ createdAt: -1 })
      .populate("dorm", "title")
      .populate("renter", "name email")
      .lean();

    // NOTE: totals should be over ALL time or last 30 days?
    // You want accounts totals overall, so we load ALL PAID bookings for totals + renters + latest.
    const allPaidRaw = await Booking.find({
      paymentStatus: "paid",
      status: { $in: ["reserved", "confirmed"] },
    })
      .sort({ createdAt: -1 })
      .populate("dorm", "title")
      .populate("renter", "name email")
      .lean();

    let totalRevenue = 0; // received (deposit + full)
    let totalPlatformFee = 0; // 8% of received
    let totalRenterShare = 0; // 92% of received

    const rentersMap: Record<
      string,
      {
        renterId: string;
        renterName: string;
        renterEmail: string;
        bookingsCount: number;
        renterRevenue: number; // ✅ renter share only (after 8%)
      }
    > = {};

    for (const b of allPaidRaw as any[]) {
      const paidAmount = getPaidAmount(b);
      const platformFee = Number((paidAmount * 0.08).toFixed(2));
      const renterShare = Number((paidAmount * 0.92).toFixed(2));

      totalRevenue += paidAmount;
      totalPlatformFee += platformFee;
      totalRenterShare += renterShare;

      const renterId = b.renter?._id ? b.renter._id.toString() : "unknown";
      const renterName = (b.renter?.name || "Unknown").toString();
      const renterEmail = (b.renter?.email || "").toString();

      if (!rentersMap[renterId]) {
        rentersMap[renterId] = {
          renterId,
          renterName,
          renterEmail,
          bookingsCount: 0,
          renterRevenue: 0,
        };
      }

      rentersMap[renterId].bookingsCount += 1;
      rentersMap[renterId].renterRevenue += renterShare; // ✅ the real split result
    }

    const renters = Object.values(rentersMap)
      .map((r) => ({
        ...r,
        renterRevenue: Number(r.renterRevenue.toFixed(2)),
      }))
      .sort((a, b) => b.renterRevenue - a.renterRevenue);

    // ✅ Daily stats (last 30 days) using bookingsRaw (already filtered to last 30 days)
    const dailyMap: Record<string, number> = {};
    for (const b of bookingsRaw as any[]) {
      const paidAmount = getPaidAmount(b);
      const dayKey = toDayKeyUTC(new Date(b.createdAt));
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + paidAmount;
    }

    // Fill missing days with 0 so the chart draws a real line
    const dailyStats: { day: string; amount: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = addDaysUTC(startUTC, i);
      const key = toDayKeyUTC(d);
      dailyStats.push({
        day: key,
        amount: Number(((dailyMap[key] || 0) as number).toFixed(2)),
      });
    }

    // Latest bookings (paid) overall (last 20)
    const latestBookings = (allPaidRaw as any[]).slice(0, 20).map((b: any) => {
      const paidAmount = getPaidAmount(b);
      const platformFee = Number((paidAmount * 0.08).toFixed(2));
      const renterShare = Number((paidAmount * 0.92).toFixed(2));

      return {
        id: b._id.toString(),
        dormTitle: b.dorm?.title || "",
        renterName: b.renter?.name || "Unknown",
        renterEmail: b.renter?.email || "",
        clientName: `${b.clientFirstName || ""} ${
          b.clientLastName || ""
        }`.trim(),
        phone: b.clientPhone || "",
        paymentType: b.paymentType,
        status: b.status,
        createdAt: b.createdAt,

        paidAmount: Number(paidAmount.toFixed(2)),
        totalPrice: toNumber(b.totalPrice),
        platformFee,
        renterShare,
        currency: b.currency || "USD",
      };
    });

    return NextResponse.json({
      totals: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalPlatformFee: Number(totalPlatformFee.toFixed(2)),
        totalRenterShare: Number(totalRenterShare.toFixed(2)),
      },
      dailyStats,
      renters,
      latestBookings,
    });
  } catch (err) {
    console.error("GET /api/dashboard/accounts/overview error:", err);
    return NextResponse.json(
      { message: "Failed to load accounts overview" },
      { status: 500 }
    );
  }
}
