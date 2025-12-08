// app/api/renter/listings/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

// Minimal user shape we care about in this route
type CurrentUser = {
  _id: string;
  role: string; // "renter" | "admin" | ...
};

export async function GET() {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

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

    const user = (await getCurrentUserFromApi()) as CurrentUser | null;

    if (!user || user.role !== "renter") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      // BASIC
      title,
      description,
      city,
      address,
      university,

      // ROOM
      roomType,
      maxOccupants,
      genderPreference,
      allowsSmoking,
      allowsPets,
      houseRules,

      // PRICING
      pricePerNight,
      pricePerWeek,
      pricePerMonth,

      // AVAILABILITY
      availableFrom,
      minStayNights,

      // DEPOSIT
      depositAmount,
      depositCurrency,

      // LOCATION
      latitude,
      longitude,

      // EXTRAS
      amenities,
      images,
      profileImg,
      tour3DUrl,
    } = body;

    // Basic validation
    if (!title || !description || !city) {
      return NextResponse.json(
        { message: "Title, description and city are required" },
        { status: 400 }
      );
    }

    // Optional: make sure there is at least one price
    if (
      pricePerNight == null &&
      pricePerWeek == null &&
      pricePerMonth == null
    ) {
      return NextResponse.json(
        { message: "Please provide at least one price (night/week/month)" },
        { status: 400 }
      );
    }

    const dorm = await Dorm.create({
      owner: user._id,

      // BASIC
      title,
      description,
      city,
      address,
      university,

      // ROOM
      roomType,
      maxOccupants,
      genderPreference,
      allowsSmoking,
      allowsPets,
      houseRules,

      // PRICING
      pricePerNight,
      pricePerWeek,
      pricePerMonth,

      // AVAILABILITY
      // Frontend sends a date string or null; Mongoose can cast
      availableFrom: availableFrom || undefined,
      minStayNights,

      // DEPOSIT
      depositAmount,
      depositCurrency,

      // LOCATION
      latitude,
      longitude,

      // EXTRAS
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      profileImg,
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
