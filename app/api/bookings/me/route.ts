/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromApi } from "@/lib/currentUser";
import { Notification } from "@/models/Notification";

type CurrentUser = {
  _id: string;
  role: string;
};

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || user.role !== "client") {
      return NextResponse.json({ items: [], badgeCount: 0 }, { status: 200 });
    }

    // unread first, newest first
    const items = await Notification.find({ user: user._id })
      .sort({ readAt: 1, createdAt: -1 })
      .limit(60)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: user._id,
      readAt: { $exists: false },
    });

    return NextResponse.json({
      items: items.map((n: any) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        body: n.body,
        dayKey: n.dayKey,
        dormTitle: n.dormTitle || "",
        bookingId: n.booking ? String(n.booking) : null,
        readAt: n.readAt ? new Date(n.readAt).toISOString() : null,
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
      })),
      badgeCount: unreadCount,
    });
  } catch (err) {
    console.error("GET /api/bookings/me error:", err);
    return NextResponse.json({ items: [], badgeCount: 0 }, { status: 200 });
  }
}
