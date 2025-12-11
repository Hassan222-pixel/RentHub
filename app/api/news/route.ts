// app/api/news/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { News } from "@/models/News";

export async function GET() {
  try {
    await connectToDatabase();

    let news = await News.findOne();

    if (!news) {
      news = await News.create({});
    }

    return NextResponse.json(news, { status: 200 });
  } catch (err) {
    console.error("GET /api/news error:", err);
    return NextResponse.json(
      { message: "Failed to load news data" },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json(news, { status: 200 });
  } catch (err) {
    console.error("PUT /api/news error:", err);
    return NextResponse.json(
      { message: "Failed to save news data" },
      { status: 500 }
    );
  }
}
