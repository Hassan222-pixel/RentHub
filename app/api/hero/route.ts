import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Hero } from "@/models/Hero";

export async function GET() {
  await connectToDatabase();
  const hero = await Hero.findOne();
  return NextResponse.json(hero);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const { title, subtitle, backgroundImage } = await req.json();

  const hero = await Hero.findOneAndUpdate(
    {},
    { title, subtitle, backgroundImage },
    { new: true, upsert: true }
  );

  return NextResponse.json(hero);
}
