/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { message: "session_id is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata || !session.metadata.bookingId) {
      return NextResponse.json(
        { message: "Booking metadata not found on session" },
        { status: 400 }
      );
    }

    const bookingId = session.metadata.bookingId;
    const paymentType = session.metadata.paymentType as
      | "deposit"
      | "full"
      | undefined;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "pending_payment") {
      return NextResponse.json({ booking });
    }

    if (session.payment_status !== "paid") {
      booking.paymentStatus = "failed";
      booking.status = "cancelled";
      booking.cancelReason = "payment_failed";
      await booking.save();

      return NextResponse.json(
        { message: "Payment not completed", booking },
        { status: 400 }
      );
    }

    booking.paymentStatus = "paid";
    booking.status = paymentType === "full" ? "confirmed" : "reserved";
    booking.stripePaymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : undefined;

    await booking.save();

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("GET /api/payments/confirm error:", err);
    return NextResponse.json(
      { message: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
