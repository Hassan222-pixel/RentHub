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

function calcPaidAmount(b: any) {
  // ✅ ONLY what was actually paid now
  if (b.paymentType === "deposit") return toNumber(b.depositAmount);
  return toNumber(b.totalPrice);
}

function calcPlatformFee(paidAmount: number) {
  return Number((paidAmount * 0.08).toFixed(2));
}

function calcRenterShare(paidAmount: number) {
  return Number((paidAmount * 0.92).toFixed(2));
}

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || !["super-admin", "accounts-admin"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Only paid bookings
    const bookings = await Booking.find({
      paymentStatus: "paid",
      status: { $in: ["reserved", "confirmed"] },
    })
      .populate("dorm", "title")
      .populate("renter", "name email")
      .sort({ createdAt: -1 })
      .lean();

    let totalRevenue = 0; // ✅ paid money only
    let totalPlatformFee = 0;
    let totalRenterShare = 0;

    // ✅ monthly revenue based on paid money only
    const monthlyMap: Record<string, number> = {};

    // ✅ renters breakdown (based on paid money only)
    const rentersMap: Record<
      string,
      {
        renterId: string;
        renterName: string;
        renterEmail: string;
        bookingsCount: number;
        renterRevenue: number; // 92% of paid money
      }
    > = {};

    bookings.forEach((b: any) => {
      const paidAmount = calcPaidAmount(b);
      const platformFee = calcPlatformFee(paidAmount);
      const renterShare = calcRenterShare(paidAmount);

      totalRevenue += paidAmount;
      totalPlatformFee += platformFee;
      totalRenterShare += renterShare;

      // monthly key
      const createdAt = new Date(b.createdAt);
      const key = `${createdAt.getFullYear()}-${String(
        createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + paidAmount;

      // renters aggregation
      const renterId =
        b.renter?._id?.toString?.() || b.renter?.toString?.() || "";
      const renterName = b.renter?.name || "Unknown";
      const renterEmail = b.renter?.email || "";

      if (renterId) {
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
        rentersMap[renterId].renterRevenue += renterShare;
      }
    });

    const monthlyStats = Object.entries(monthlyMap)
      .map(([month, amount]) => ({
        month,
        amount: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => (a.month > b.month ? 1 : -1));

    const renters = Object.values(rentersMap)
      .map((r) => ({
        ...r,
        renterRevenue: Number(r.renterRevenue.toFixed(2)),
      }))
      .sort((a, b) => b.renterRevenue - a.renterRevenue);

    const latestBookings = bookings.slice(0, 20).map((b: any) => {
      const paidAmount = calcPaidAmount(b);
      const platformFee = calcPlatformFee(paidAmount);
      const renterShare = calcRenterShare(paidAmount);

      const dormTitle = b.dorm?.title || "—";
      const renterName = b.renter?.name || "—";
      const renterEmail = b.renter?.email || "";
      const clientName = `${b.clientFirstName || ""} ${
        b.clientLastName || ""
      }`.trim();

      return {
        id: b._id.toString(),
        dormTitle,
        renterName,
        renterEmail,
        clientName,
        phone: b.clientPhone || "",
        paymentType: b.paymentType,
        status: b.status,
        createdAt: b.createdAt,

        // ✅ IMPORTANT
        paidAmount,
        totalPrice: toNumber(b.totalPrice),

        // ✅ based on paid only
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
      monthlyStats,
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
