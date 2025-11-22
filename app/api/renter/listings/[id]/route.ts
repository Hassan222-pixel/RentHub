// app/api/renter/listings/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // ✅ FIXED
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const user = await getCurrentUserFromApi();
    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dorm = await Dorm.findOne({ _id: params.id, owner: user._id }).lean();
    if (!dorm) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ dorm });
  } catch (err) {
    console.error("GET /api/renter/listings/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to load listing" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const user = await getCurrentUserFromApi();
    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const dorm = await Dorm.findOneAndUpdate(
      { _id: params.id, owner: user._id },
      body,
      { new: true }
    );

    if (!dorm) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ dorm });
  } catch (err) {
    console.error("PUT /api/renter/listings/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// soft delete / deactivate
export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const user = await getCurrentUserFromApi();
    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dorm = await Dorm.findOneAndUpdate(
      { _id: params.id, owner: user._id },
      { isActive: false },
      { new: true }
    );

    if (!dorm) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/renter/listings/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to deactivate listing" },
      { status: 500 }
    );
  }
}
