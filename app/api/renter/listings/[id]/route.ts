// app/api/renter/listings/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

// In this Next.js version, params is a Promise and must be awaited
type RouteContext = {
  params: Promise<{ id: string }>;
};

type CurrentUser = {
  _id: string;
  role: string;
};

//
// ✅ GET SINGLE LISTING BY ID
//
export async function GET(_req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const dorm = await Dorm.findOne({
      _id: id,
      owner: user._id,
      // if you use soft delete, keep only active ones:
      // isActive: true,
    })
      .lean()
      .exec();

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

//
// ✅ UPDATE
//
export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const dorm = await Dorm.findOneAndUpdate(
      { _id: id, owner: user._id },
      body,
      { new: true }
    ).exec();

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

//
// ✅ HARD DELETE (remove completely)
//
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const deleted = await Dorm.findOneAndDelete({
      _id: id,
      owner: user._id,
    }).exec();

    if (!deleted) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/renter/listings/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
