/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";

// GET /api/dorms?q=&roomType=
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const roomType = searchParams.get("roomType");

    // Base filter: only active dorms
    const filter: any = {
      isActive: true,
    };

    // Optional room type filter
    if (
      roomType &&
      ["private", "double", "shared"].includes(roomType.toLowerCase())
    ) {
      filter.roomType = roomType.toLowerCase();
    }

    // Optional text search
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { university: { $regex: q, $options: "i" } },
      ];
    }

    const dormDocs = await Dorm.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "title description profileImg roomType city university pricePerNight pricePerWeek pricePerMonth"
      )
      .lean();

    const dorms = dormDocs.map((d: any) => ({
      _id: d._id.toString(),
      title: d.title,
      description: d.description,
      profileImg: d.profileImg || null,
      roomType: d.roomType || null,
      city: d.city || "",
      university: d.university || "",
      pricePerNight: d.pricePerNight ?? null,
      pricePerWeek: d.pricePerWeek ?? null,
      pricePerMonth: d.pricePerMonth ?? null,
    }));

    return NextResponse.json({ dorms });
  } catch (err) {
    console.error("GET /api/dorms error:", err);
    return NextResponse.json(
      { message: "Failed to load dorms" },
      { status: 500 }
    );
  }
}
