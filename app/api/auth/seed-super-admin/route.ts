// app/api/auth/seed-super-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    console.log("Seed super admin route called");
    await connectToDatabase();

    const existingSuperAdmin = await User.findOne({ role: "super-admin" });
    if (existingSuperAdmin) {
      return NextResponse.json(
        { message: "Super admin already exists" },
        { status: 400 }
      );
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "super-admin",
      permissions: ["*"], // super admin has all permissions
    });

    return NextResponse.json(
      { message: "Super admin created", id: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed super admin error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
