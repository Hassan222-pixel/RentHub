import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { About } from "@/models/About";

export async function GET() {
  await connectToDatabase();
  const about = await About.findOne();
  return NextResponse.json(about);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const { title, content, imageUrl, buttonText } = await req.json();

  const about = await About.findOneAndUpdate(
    {},
    { title, content, imageUrl, buttonText },
    { new: true, upsert: true }
  );

  return NextResponse.json(about);
}
