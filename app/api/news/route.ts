import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { News } from "@/models/News";

// 🔥 CRITICAL — disable ALL caching
export const dynamic = "force-dynamic";

// GET — ALWAYS fetch fresh data
export async function GET() {
  try {
    await connectToDatabase();

    const news = await News.findOne().lean();

    return NextResponse.json(news ?? {}, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to load news" },
      { status: 500 }
    );
  }
}

// PUT — save from dashboard
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let news = await News.findOne();

    if (!news) {
      news = await News.create(body);
    } else {
      Object.assign(news, body);
      await news.save();
    }

    return NextResponse.json(news, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to save news" },
      { status: 500 }
    );
  }
}
