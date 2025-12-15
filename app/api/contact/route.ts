import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";

export async function GET() {
  await connectToDatabase();

  let contact = await Contact.findOne();
  if (!contact) contact = await Contact.create({});

  return NextResponse.json(contact);
}

export async function PUT(req: Request) {
  await connectToDatabase();
  const body = await req.json();

  let contact = await Contact.findOne();
  if (!contact) {
    contact = await Contact.create(body);
  } else {
    Object.assign(contact, body);
    await contact.save();
  }

  return NextResponse.json(contact);
}
