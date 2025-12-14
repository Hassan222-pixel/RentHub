import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Footer } from "@/models/Footer";

export async function GET() {
  await connectToDatabase();

  let footer = await Footer.findOne();

  // Create default footer if not exists
  if (!footer) {
    footer = await Footer.create({
      description:
        "Donec in tempus leo. Aenean ultricies mauris sed quam lacinia lobortis.",
      properties: [],
    });
  }

  return NextResponse.json(footer);
}

export async function PUT(req: Request) {
  await connectToDatabase();
  const body = await req.json();

  let footer = await Footer.findOne();
  if (!footer) {
    footer = await Footer.create(body);
  } else {
    Object.assign(footer, body);
    await footer.save();
  }

  return NextResponse.json(footer);
}
