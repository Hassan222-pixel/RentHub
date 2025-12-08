// app/api/renter/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string; // "renter" | ...
};

// NOTE for Next.js 16:
// `params` is now a Promise and must be awaited.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    // Only renters can use this endpoint
    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Await the params Promise to access the real `id`
    const { id } = await params;
    const bookingId = id;

    console.log(
      "DELETE /api/renter/bookings/",
      bookingId,
      "requested by renter",
      user._id
    );

    // Delete by _id
    const result = await Booking.deleteOne({ _id: bookingId });

    console.log("Mongo deleteOne result:", result);

    return NextResponse.json({
      message:
        result.deletedCount === 1
          ? "Booking deleted successfully"
          : "No booking was deleted (not found in DB)",
      deletedCount: result.deletedCount,
      bookingId,
    });
  } catch (err) {
    console.error("DELETE /api/renter/bookings/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
