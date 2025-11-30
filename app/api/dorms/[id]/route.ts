/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/dorms/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";

// نفس فكرة RouteContext اللي عندك
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    const dormDoc = await Dorm.findById(id).lean();

    // لو مش موجود أو مش active
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
