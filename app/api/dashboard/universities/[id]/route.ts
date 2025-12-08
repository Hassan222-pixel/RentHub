// app/api/dashboard/universities/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const payload = await requireAdmin();
    if (!payload) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const uni = await University.findById(id).lean();

    if (!uni) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ university: uni });
  } catch (error) {
    console.error("GET /api/dashboard/universities/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to load university" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const payload = await requireAdmin();
    if (!payload) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const { name, latitude, longitude, image } = await req.json();

    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { message: "Name, latitude and longitude are required" },
        { status: 400 }
      );
    }

    const uni = await University.findByIdAndUpdate(
      id,
      { name, latitude, longitude, image },
      { new: true }
    );

    if (!uni) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ university: uni });
  } catch (error) {
    console.error("PUT /api/dashboard/universities/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update university" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();
    const payload = await requireAdmin();
    if (!payload) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const deleted = await University.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dashboard/universities/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete university" },
      { status: 500 }
    );
  }
}
