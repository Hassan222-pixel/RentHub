// app/api/renter/listings/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
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
// ✅ PUT — UPDATE SINGLE LISTING
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

      // MEDIA / AMENITIES
      hasWifi,
      hasAirConditioning,
      hasHeating,
      hasParking,
      hasLaundry,
      isFurnished,
      amenities,
      images,
      profileImg,
      tour3DUrl,
    } = body;

    // Validation
    if (!title || !description || !city) {
      return NextResponse.json(
        { message: "Title, description and city are required" },
        { status: 400 }
      );
    }

    if (pricePerNight == null && pricePerMonth == null) {
      return NextResponse.json(
        { message: "Please provide at least one price (night or month)" },
        { status: 400 }
      );
    }

    // Enforce maxOccupants on server
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

    const updateData: any = {
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

      // MEDIA / AMENITIES
      hasWifi: !!hasWifi,
      hasAirConditioning: !!hasAirConditioning,
      hasHeating: !!hasHeating,
      hasParking: !!hasParking,
      hasLaundry: !!hasLaundry,
      isFurnished: !!isFurnished,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      profileImg,
      tour3DUrl,
    };

    const dorm = await Dorm.findOneAndUpdate(
      { _id: id, owner: user._id },
      updateData,
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
// ✅ DELETE
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
