import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { About } from "@/models/About";

// GET
export async function GET() {
  try {
    await connectToDatabase();
    let about = await About.findOne();

    if (!about) {
      about = await About.create({});
    }

    return NextResponse.json(about);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to load about data" },
      { status: 500 }
    );
  }
}

// PUT (update)
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let about = await About.findOne();

    if (!about) {
      about = await About.create(body);
    } else {
      Object.assign(about, body);
      await about.save();
    }

    return NextResponse.json(about);
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to save about data" },
      { status: 500 }
    );
  }
}
