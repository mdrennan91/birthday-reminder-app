// src/app/api/birthdays/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbconnect from "@/lib/dbconnect";
import Birthday from "@/models/Birthday"; // Your Mongoose model for birthday entries

/**
 * GET /api/birthdays
 * Fetch all birthdays that belong to the currently authenticated user.
 */
export async function GET() {
  try {
    // Establish MongoDB connection
    await dbconnect();

    // Get the current session for the user
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return 401 Unauthorized
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Query the database for birthdays associated with this user
    const people = await Birthday.find({ userId: session.user.id }).populate("categories").lean();

    // Return the list of birthdays
    return NextResponse.json(people);
  } catch (err) {
    console.error("Error loading birthdays:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/birthdays
 * Create a new birthday entry for the authenticated user.
 * Expects a JSON body with name, birthday, contact info, and optional tags.
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    // Check for user authentication
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse incoming request JSON
    const {
      name,
      birthday,
      phone,
      email,
      address,
      notes,
      avatarUrl,
      categories, 
    } = await req.json();

    // Connect to the database
    await dbconnect();

    // Create the new birthday in MongoDB
    const newBirthday = await Birthday.create({
      userId: session.user.id,
      name,
      birthday,
      phone,
      email,
      address,
      notes,
      avatarUrl,
      categories, 
    });

    // Return the newly created birthday document
    const populated = await newBirthday.populate("categories");
    return NextResponse.json(populated, { status: 201 });
  } catch (err) {
    console.error("Error creating birthday:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
