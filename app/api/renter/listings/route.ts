// app/api/renter/listings/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { getCurrentUserFromApi } from "@/lib/currentUser";

// ✅ NEW
import { AdminNotification } from "@/models/AdminNotification";

// Minimal user shape we care about in this route
type CurrentUser = {
  _id: string;
  role: string; // "renter" | "admin" | ...
  // ✅ NEW (getCurrentUserFromApi بيرجع user كامل غالباً)
  name?: string;
  email?: string;
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
      pricePerMonth,

      // AVAILABILITY
      minStayNights,

      // DEPOSIT
      depositAmount,

      // LOCATION
      latitude,
      longitude,

      // BOOLEAN AMENITIES
      hasWifi,
      hasAirConditioning,
      hasHeating,
      hasParking,
      hasLaundry,
      isFurnished,

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

    // At least one price
    if (pricePerNight == null && pricePerMonth == null) {
      return NextResponse.json(
        { message: "Please provide at least one price (night or month)" },
        { status: 400 }
      );
    }

    // Enforce maxOccupants on server as well
    let finalMaxOccupants: number | undefined = undefined;
    if (roomType === "private") {
      finalMaxOccupants = 1;
    } else if (roomType === "double") {
      finalMaxOccupants = 2;
    } else if (roomType === "shared") {
      if (typeof maxOccupants !== "number" || maxOccupants < 1) {
        return NextResponse.json(
          {
            message:
              "Max occupants is required and must be >= 1 for shared rooms",
          },
          { status: 400 }
        );
      }
      finalMaxOccupants = maxOccupants;
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
      maxOccupants: finalMaxOccupants,
      genderPreference,
      allowsSmoking,
      allowsPets,
      houseRules: Array.isArray(houseRules) ? houseRules : [],

      // PRICING
      pricePerNight,
      pricePerMonth,

      // AVAILABILITY
      minStayNights,

      // DEPOSIT
      depositAmount,

      // LOCATION
      latitude,
      longitude,

      // BOOLEAN AMENITIES
      hasWifi: !!hasWifi,
      hasAirConditioning: !!hasAirConditioning,
      hasHeating: !!hasHeating,
      hasParking: !!hasParking,
      hasLaundry: !!hasLaundry,
      isFurnished: !!isFurnished,

      // EXTRAS
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      profileImg,
      tour3DUrl,
    });

    // ✅ NEW: Create admin notification (ADD)
    try {
      await AdminNotification.create({
        type: "add",
        message: `${user.name || "Renter"} added a new dorm: ${dorm.title}`,
        dormId: dorm._id,
        dormTitle: dorm.title,
        actorId: user._id,
        actorName: user.name,
        actorEmail: user.email,
        readBy: [],
      });
    } catch (e) {
      console.error("Failed to create admin notification (add):", e);
      // ما منوقف العملية، بس منسجّل خطأ
    }

    return NextResponse.json({ dorm }, { status: 201 });
  } catch (err) {
    console.error("POST /api/renter/listings error:", err);
    return NextResponse.json(
      { message: "Failed to create listing" },
      { status: 500 }
    );
  }
}
