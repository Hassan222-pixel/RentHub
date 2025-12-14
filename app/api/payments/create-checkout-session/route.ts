/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";
import { getDormCapacity, wouldExceedCapacity } from "@/lib/availability";

type CurrentUser = {
  _id: string;
  role: string;
  name?: string;
  email?: string;
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as (CurrentUser & any) | null;
    if (!user || user.role !== "client") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      dormId,
      startDate,
      months,
      firstName,
      lastName,
      phone,
      paymentType,
      bookingMode, // "normal" | "ongoing"
    }: {
      dormId?: string;
      startDate?: string;
      months?: number;
      firstName?: string;
      lastName?: string;
      phone?: string;
      paymentType?: "deposit" | "full";
      bookingMode?: "normal" | "ongoing";
    } = body;

    if (!dormId || !startDate || !months || !paymentType) {
      return NextResponse.json(
        { message: "dormId, startDate, months and paymentType are required" },
        { status: 400 }
      );
    }

    if (!["deposit", "full"].includes(paymentType)) {
      return NextResponse.json(
        { message: "Invalid paymentType" },
        { status: 400 }
      );
    }

    const safeBookingMode: "normal" | "ongoing" =
      bookingMode === "ongoing" ? "ongoing" : "normal";

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
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const dormDoc: any = await Dorm.findById(dormId).lean();
    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const adminAvailability =
      (dormDoc.adminAvailability as
        | "available"
        | "not_available"
        | undefined) || "available";
    if (adminAvailability === "not_available") {
      return NextResponse.json(
        { message: "This room is currently not available (admin)." },
        { status: 409 }
      );
    }

    const capacity = getDormCapacity(dormDoc);

    // Prevent user overlapping their own bookings (any status that matters)
    const overlappingMyBooking = await Booking.findOne({
      dorm: dormId,
      client: user._id,
      status: { $in: ["pending_payment", "reserved", "confirmed"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    }).lean();

    if (overlappingMyBooking) {
      return NextResponse.json(
        { message: "You already have a booking that overlaps these dates." },
        { status: 400 }
      );
    }

    // ✅ Correct capacity check (reserved/confirmed only), uses peak overlap not countDocuments
    const existing = await Booking.find({
      dorm: dormId,
      status: { $in: ["reserved", "confirmed"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    })
      .select("startDate endDate")
      .lean();

    const exceeds = wouldExceedCapacity(
      existing.map((b: any) => ({
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
      })),
      capacity,
      start,
      end
    );

    if (exceeds) {
      return NextResponse.json(
        { message: "This room is fully booked for some dates in this period." },
        { status: 409 }
      );
    }

    if (!dormDoc.pricePerMonth) {
      return NextResponse.json(
        { message: "Monthly price is not available for this dorm" },
        { status: 400 }
      );
    }

    const baseMonthly = dormDoc.pricePerMonth;
    let pricePerStudentPerMonth = baseMonthly;

    if (dormDoc.roomType === "double" || dormDoc.roomType === "shared") {
      pricePerStudentPerMonth = baseMonthly / Math.max(capacity, 1);
    }

    const totalPrice = pricePerStudentPerMonth * months;

    const depositFromDorm: number | undefined = dormDoc.depositAmount;
    let depositAmount = 0;
    let remainingAmount = 0;

    if (paymentType === "deposit") {
      depositAmount = depositFromDorm ?? 50;
      if (depositAmount <= 0 || depositAmount >= totalPrice) {
        depositAmount = Math.round(totalPrice * 0.2);
      }
      remainingAmount = totalPrice - depositAmount;
    }

    const platformFee = Number((totalPrice * 0.08).toFixed(2));
    const renterShare = Number((totalPrice * 0.92).toFixed(2));

    let deadlineToPayRest: Date | undefined = undefined;
    if (paymentType === "deposit") {
      const deadline = new Date(start);
      deadline.setDate(deadline.getDate() - 5);
      deadlineToPayRest = deadline;
    }

    const trimmedFirstName = (firstName || "").trim();
    const trimmedLastName = (lastName || "").trim();
    const trimmedPhone = (phone || "").trim();

    const booking = await Booking.create({
      dorm: dormId,
      renter: dormDoc.owner,
      client: user._id,

      clientFirstName: trimmedFirstName,
      clientLastName: trimmedLastName,
      clientPhone: trimmedPhone,

      startDate: start,
      endDate: end,

      totalPrice,
      paymentType,
      paymentStatus: "unpaid",
      currency: dormDoc.depositCurrency || "USD",

      depositAmount: paymentType === "deposit" ? depositAmount : undefined,
      remainingAmount: paymentType === "deposit" ? remainingAmount : 0,
      deadlineToPayRest,

      platformFee,
      renterShare,

      status: "pending_payment",
      isTestPayment: true,

      // ✅ store mode properly
      bookingMode: safeBookingMode,
      // backward compat
      isOngoing: safeBookingMode === "ongoing",
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const amountToCharge = paymentType === "full" ? totalPrice : depositAmount;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: dormDoc.depositCurrency?.toLowerCase() || "usd",
            unit_amount: Math.round(amountToCharge * 100),
            product_data: {
              name: `${dormDoc.title} (${
                paymentType === "full" ? "Full payment" : "Deposit"
              })`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/room/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/room/payment-cancelled`,
      metadata: {
        bookingId: booking._id.toString(),
        dormId,
        clientId: user._id.toString(),
        paymentType,
        bookingMode: safeBookingMode,
      },
      customer_email: user.email,
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/payments/create-checkout-session error:", err);
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
