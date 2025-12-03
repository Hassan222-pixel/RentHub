import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to Blog.ts
const filePath = path.join(process.cwd(), "models/Blog.ts");

// Safely extracts array from the TypeScript file
function extractArray(file: string) {
  const start = file.indexOf("export const blogData");
  const open = file.indexOf("[", start);
  const close = file.indexOf("];", open) + 2;

  if (open === -1 || close === -1) return [];

  const arrayString = file.slice(open, close);

  // evaluate JS array safely
  return eval(arrayString);
}

export async function GET() {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const blogs = extractArray(text);

    return NextResponse.json(blogs);
  } catch (err) {
    console.error("GET /api/blog error:", err);
    return NextResponse.json([]);
  }
}

export async function PUT(req: Request) {
  try {
    const blogs = await req.json();

    const newContent = `
export interface BlogItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export const blogData: BlogItem[] = ${JSON.stringify(blogs, null, 2)};
`;

    fs.writeFileSync(filePath, newContent, "utf8");

    return NextResponse.json({ message: "Saved successfully" });
  } catch (err) {
    console.error("PUT /api/blog error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
