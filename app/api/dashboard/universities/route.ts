/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/dashboard/universities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { University } from "@/models/University";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const ADMIN_ROLES = [
  "super-admin",
  "accounts-admin",
  "managers-admin",
] as const;

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token) as { role?: string } | null;
  if (!payload || !payload.role || !ADMIN_ROLES.includes(payload.role as any)) {
    return null;
  }
  return payload;
}

export async function GET() {
  try {
    await connectToDatabase();
    const payload = await requireAdmin();
    if (!payload) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const universities = await University.find().sort({ name: 1 }).lean();
    return NextResponse.json({ universities });
  } catch (error) {
    console.error("GET /api/dashboard/universities error:", error);
    return NextResponse.json(
      { message: "Failed to load universities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const payload = await requireAdmin();
    if (!payload) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, area, latitude, longitude, image } = await req.json();

    if (!name || !area || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { message: "Name, area, latitude and longitude are required" },
        { status: 400 }
      );
    }

    const uni = await University.create({
      name,
      area, // ✅ NEW
      latitude,
      longitude,
      image,
    });

    return NextResponse.json({ university: uni }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/universities error:", error);
    return NextResponse.json(
      { message: "Failed to create university" },
      { status: 500 }
    );
  }
}
