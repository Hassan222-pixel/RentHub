/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
  email?: string;
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || user.role !== "client") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const bookingId = body?.bookingId as string | undefined;

    if (!bookingId) {
      return NextResponse.json(
        { message: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking: any = await Booking.findOne({
      _id: bookingId,
      client: user._id,
    })
      .populate("dorm", "title depositCurrency")
      .lean();

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only for deposit bookings that are still reserved
    if (booking.status !== "reserved" || booking.paymentType !== "deposit") {
      return NextResponse.json(
        { message: "This booking does not require remaining payment." },
        { status: 400 }
      );
    }

    const remaining = Number(booking.remainingAmount || 0);
    if (remaining <= 0) {
      return NextResponse.json(
        { message: "No remaining amount to pay." },
        { status: 400 }
      );
    }

    const currency = (
      booking.currency ||
      booking.dorm?.depositCurrency ||
      "USD"
    )
      .toString()
      .toLowerCase();

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(remaining * 100),
            product_data: {
              name: `${booking.dorm?.title || "Dorm"} (Remaining payment)`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/room/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/client/profile`,
      metadata: {
        bookingId: booking._id.toString(),
        paymentType: "remaining",
        paymentKind: "remaining",
      },
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/payments/create-remaining-session error:", err);
    return NextResponse.json(
      { message: "Failed to create remaining checkout session" },
      { status: 500 }
    );
  }
}
