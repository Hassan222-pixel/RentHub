// app/api/renter/listings/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // ✅ FIXED
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUserFromApi();

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const listings = await Dorm.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("GET /api/renter/listings error:", err);
    return NextResponse.json(
      { message: "Failed to load listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUserFromApi();

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      city,
      address,
      university,
      pricePerNight,
      pricePerMonth,
      amenities,
      images,
      tour3DUrl,
    } = body;

    if (!title || !description || !city) {
      return NextResponse.json(
        { message: "Title, description and city are required" },
        { status: 400 }
      );
    }

    const dorm = await Dorm.create({
      owner: user._id,
      title,
      description,
      city,
      address,
      university,
      pricePerNight,
      pricePerMonth,
      amenities: amenities || [],
      images: images || [],
      tour3DUrl,
    });

    return NextResponse.json({ dorm }, { status: 201 });
  } catch (err) {
    console.error("POST /api/renter/listings error:", err);
    return NextResponse.json(
      { message: "Failed to create listing" },
      { status: 500 }
    );
  }
}
