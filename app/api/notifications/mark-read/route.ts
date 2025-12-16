import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserFromApi } from "@/lib/currentUser";
import { Notification } from "@/models/Notification";

type CurrentUser = { _id: string; role: string };

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;
    if (!user || user.role !== "client") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const ids = (body?.ids as string[] | undefined) || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: true });
    }

    await Notification.updateMany(
      { _id: { $in: ids }, user: user._id },
      { $set: { readAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/notifications/mark-read error:", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
