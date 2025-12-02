/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";

// For Next.js 16, params is a Promise and must be awaited
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // ✅ Await params to get the real id
    const { id } = await params;

    const dormDoc = await Dorm.findById(id).lean();

    // Not found or not active
    if (!dormDoc || (dormDoc as any).isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    return NextResponse.json({ dorm: dormDoc });
  } catch (err) {
    console.error("GET /api/dorms/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to load dorm" },
      { status: 500 }
    );
  }
}
