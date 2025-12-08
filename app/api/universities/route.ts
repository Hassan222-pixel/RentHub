// app/api/universities/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { University } from "@/models/University";

export async function GET() {
  try {
    await connectToDatabase();

    const universities = await University.find({})
      .sort({ name: 1 })
      .select("name")
      .lean()
      .exec();

    return NextResponse.json({
      universities: universities.map((u) => ({
        _id: String(u._id),
        name: u.name,
      })),
    });
  } catch (err) {
    console.error("GET /api/universities error:", err);
    return NextResponse.json(
      { message: "Failed to load universities" },
      { status: 500 }
    );
  }
}
