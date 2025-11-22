// lib/currentUser.ts
import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { connectToDatabase } from "./mongodb"; // ✅ use mongodb helper
import { User } from "@/models/User";

export async function getCurrentUserFromApi() {
  await connectToDatabase();

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");

  if (!tokenCookie || !tokenCookie.value) return null;

  const payload = verifyToken(tokenCookie.value) as { userId: string } | null;

  if (!payload?.userId) return null;

  const user = await User.findById(payload.userId).lean();
  if (!user) return null;

  return user;
}
