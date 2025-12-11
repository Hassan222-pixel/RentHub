import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { About } from "@/models/About";

/**
 * GET /api/about
 * Returns the current About document (or creates an empty one on first call).
 */
export async function GET() {
  try {
    console.log("🔥 GET /api/about called");

    await connectToDatabase();

    // Try to find the latest About document
    let about = await About.findOne().sort({ updatedAt: -1 });

    // If none exists, create an empty one with defaults
    if (!about) {
      console.log("📌 No About doc found, creating a new one with defaults.");
      about = await About.create({});
    }

    console.log("✅ GET /api/about returning JSON");
    return NextResponse.json(about);
  } catch (err: any) {
    console.error("❌ ERROR in GET /api/about:", err);
    return NextResponse.json(
      { message: "Failed to load about data", error: err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/about
 * Updates or creates the About document.
 */
export async function PUT(req: Request) {
  try {
    console.log("🔥 PUT /api/about called");

    await connectToDatabase();
    const body = await req.json();

    console.log("📝 Received body:", JSON.stringify(body, null, 2));

    let about = await About.findOne().sort({ updatedAt: -1 });

    if (!about) {
      console.log("📌 No existing document — creating new one.");
      about = await About.create(body);
    } else {
      console.log("📌 Updating existing document:", about._id);

      // Assign ALL FIELDS manually
      about.bannerTitle = body.bannerTitle;
      about.bannerBackgroundImage = body.bannerBackgroundImage;

      about.aboutTitle = body.aboutTitle;
      about.aboutSubtitle = body.aboutSubtitle;
      about.aboutParagraph1 = body.aboutParagraph1;
      about.aboutParagraph2 = body.aboutParagraph2;
      about.aboutImage = body.aboutImage;

      // IMPORTANT: Overwrite arrays COMPLETELY
      about.stats = body.stats;
      about.realtors = body.realtors;

      console.log("📌 Saving new values to MongoDB...");
      await about.save();
    }

    console.log("✅ Saved successfully:");
    console.log(JSON.stringify(about, null, 2));

    return NextResponse.json(about);
  } catch (err: any) {
    console.error("❌ ERROR in PUT /api/about:", err);
    return NextResponse.json(
      { message: "Failed to save", error: err.message },
      { status: 500 }
    );
  }
}
