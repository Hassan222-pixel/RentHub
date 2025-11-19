/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    console.log("GET /api/auth/me called");

    // ⬇️ IMPORTANT: await cookies() in Next 16
    const cookieStore = await cookies();

    const tokenCookie = cookieStore.get("token");
    console.log("Token cookie:", tokenCookie);

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    const token = tokenCookie.value;
    const payload = verifyToken(token);

    console.log("Decoded payload:", payload);

    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        permissions: [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
