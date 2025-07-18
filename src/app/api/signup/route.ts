import { hash } from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, username, password } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return new NextResponse("User already exists", { status: 409 });
  }

  const hashed = await hash(password, 12);
  await db.collection("users").insertOne({ email, username, password: hashed });

  return new NextResponse("User created", { status: 201 });
}