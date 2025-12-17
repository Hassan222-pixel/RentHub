// app/api/admin-notifications/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromApi } from "@/lib/currentUser";
import { AdminNotification } from "@/models/AdminNotification";

type CurrentUser = {
  _id: string;
  role: string;
};

export async function GET() {
  await connectToDatabase();

  const user = (await getCurrentUserFromApi()) as CurrentUser | null;
  if (!user || user.role !== "super-admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const list = await AdminNotification.find({})
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const unreadCount = await AdminNotification.countDocuments({
    readBy: { $ne: user._id },
  });

  return NextResponse.json({ notifications: list, unreadCount });
}
