// app/api/renter/listings/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

// In this Next.js version, params is a Promise and must be awaited
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Minimal shape of the user object we care about here
type CurrentUser = {
  _id: string;
  role: string; // or: "renter" | "admin" | "super-admin" | "manager" | "client"
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ await params
    const dorm = await Dorm.findOne({ _id: id, owner: user._id }).lean();

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

export async function PUT(req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ await params
    const body = await req.json();

    const dorm = await Dorm.findOneAndUpdate(
      { _id: id, owner: user._id },
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
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ await params

    const dorm = await Dorm.findOneAndUpdate(
      { _id: id, owner: user._id },
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
