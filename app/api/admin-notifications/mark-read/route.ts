// app/api/admin-notifications/mark-read/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromApi } from "@/lib/currentUser";
import { AdminNotification } from "@/models/AdminNotification";

type CurrentUser = {
  _id: string;
  role: string;
};

export async function POST(req: Request) {
  await connectToDatabase();

  const user = (await getCurrentUserFromApi()) as CurrentUser | null;
  if (!user || user.role !== "super-admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;

  if (id) {
    await AdminNotification.updateOne(
      { _id: id },
      { $addToSet: { readBy: user._id } }
    );
  } else {
    await AdminNotification.updateMany({}, { $addToSet: { readBy: user._id } });
  }

  return NextResponse.json({ success: true });
}
