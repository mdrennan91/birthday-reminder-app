import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/dbconnect";
import Category from "@/models/Category";

// Define the shape of the expected context object passed to dynamic route handlers
type Context = { params: { id: string } };


//Handles HTTP PUT requests to update an existing category.

export async function PUT(req: NextRequest, context: unknown) {
  // Extract the `id` parameter from the dynamic route context
  const { id } = (context as Context).params;

  // Parse the request body for new values
  const { name, color } = await req.json();

  // Establish database connection
  await dbconnect();

  // Update the specified category in the database
  await Category.findByIdAndUpdate(id, { name, color });

  return NextResponse.json({ success: true });
}


// Handles HTTP DELETE requests to remove an existing category.

export async function DELETE(req: NextRequest, context: unknown) {
  // Extract the `id` parameter from the dynamic route context
  const { id } = (context as Context).params;

  // Establish database connection
  await dbconnect();

  // Delete the category from the database
  await Category.findByIdAndDelete(id);

  // Return success response
  return NextResponse.json({ success: true });
}
