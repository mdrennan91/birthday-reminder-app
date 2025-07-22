import { hash } from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import dbconnect from "@/lib/dbconnect"; 
import { createDefaultCategories } from "@/lib/createDefaultCategories";

export async function POST(req: Request) {
  const { email, username, password } = await req.json();

  const client = await clientPromise;
  const db = client.db("UserManagementSystem");

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return new NextResponse("User already exists", { status: 409 });
  }

  const hashed = await hash(password, 12);
  const result = await db.collection("users").insertOne({ email, username, password: hashed });

  // Connect to Mongoose before using models
  await dbconnect();

  // Insert default categories for this user
  await createDefaultCategories(result.insertedId.toString());

  return new NextResponse("User created", { status: 201 });
}
