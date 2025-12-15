import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Hero } from "@/models/Hero";

// GET hero data
export async function GET() {
  try {
    await connectToDatabase();

    let hero = await Hero.findOne();

    // Create default doc if none exists
    if (!hero) {
      hero = await Hero.create({});
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json(
      { message: "Failed to load hero data" },
      { status: 500 }
    );
  }
}

// UPDATE hero data
export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const {
      backgroundImage = "",
      highlightedH2 = "",
      titleH1 = "",
      subtitleH2 = "",
    } = body;

    // Find existing hero doc
    let hero = await Hero.findOne();

    if (!hero) {
      // Create new doc
      hero = await Hero.create({
        backgroundImage,
        highlightedH2,
        titleH1,
        subtitleH2,
      });
    } else {
      // Update fields
      hero.backgroundImage = backgroundImage;
      hero.highlightedH2 = highlightedH2;
      hero.titleH1 = titleH1;
      hero.subtitleH2 = subtitleH2;

      await hero.save();
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("PUT /api/hero error:", error);
    return NextResponse.json(
      { message: "Failed to save hero" },
      { status: 500 }
    );
  }
}
