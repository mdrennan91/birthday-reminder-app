// src/app/api/categories/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbconnect from "@/lib/dbconnect";
import Category from "@/models/Category";

/**
 * Handles GET requests to retrieve all categories associated with the authenticated user.
 * 
 * @returns JSON array of category objects or an error message with the appropriate status code
 */
export async function GET() {
  try {
    // Connect to the database
    await dbconnect();

    // Retrieve the current user session
    const session = await getServerSession(authOptions);

    // Ensure the user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all categories for the authenticated user
    const categories = await Category.find({ userId: session.user.id });

    // Return the category list
    return NextResponse.json(categories);
  } catch (err) {
    // Log and return an error if something goes wrong
    console.error("Error loading categories:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new category associated with the authenticated user.
 * 
 * @param req - The incoming HTTP request containing the name and color in JSON format
 * @returns JSON object of the created category or an error message with the appropriate status code
 */
export async function POST(req: Request) {
  try {
    // Retrieve the current user session
    const session = await getServerSession(authOptions);

    // Ensure the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract category data from the request body
    const { name, color } = await req.json();

    // Connect to the database
    await dbconnect();

    // Create a new category with the provided name, color, and user ID
    const newCat = await Category.create({
      name,
      color,
      userId: session.user.id,
    });

    // Return the newly created category
    return NextResponse.json(newCat, { status: 201 });
  } catch (err) {
    // Log and return an error if something goes wrong
    console.error("Error creating category:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
