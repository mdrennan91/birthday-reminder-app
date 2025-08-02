import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbconnect from "@/lib/dbconnect";
import Birthday from "@/models/Birthday";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase server client using service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE /api/birthdays/:id
 * Deletes a birthday record and the associated avatar image from Supabase
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Ensure the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB and find the person's record (must belong to this user)
    await dbconnect();
    const person = await Birthday.findOne({
      _id: id,
      userId: session.user.id,
    });

    // Return 404 if the birthday entry is not found
    if (!person) {
      return NextResponse.json({ message: "Birthday not found" }, { status: 404 });
    }

    // If an avatar is associated, attempt to delete it from Supabase Storage
    const avatarToDelete = person.avatarUrl;
    if (avatarToDelete) {
      const { error: deleteError } = await supabase.storage
        .from("images")
        .remove([avatarToDelete]);
      if (deleteError) {
        console.warn("Failed to delete avatar:", deleteError.message);
        // Continue deletion even if avatar deletion fails
      }
    }

    // Delete the birthday record from the database
    await Birthday.deleteOne({ _id: id, userId: session.user.id });

    // Return success response
    return NextResponse.json({ message: "Birthday and avatar deleted" });
  } catch (err) {
    console.error("Error deleting birthday:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/birthdays/:id
 * Updates a birthday record with new values from the request body
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if the user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database and parse the JSON body
    await dbconnect();
    const body = await req.json();

    // Attempt to find and update the record
    const updated = await Birthday.findOneAndUpdate(
      { _id: id, userId: session.user.id }, // Must belong to current user
      { $set: body },                      // Apply updates from request
      { new: true }                        // Return the updated document
    );

    // If not found, return 404
    if (!updated) {
      return NextResponse.json({ message: "Birthday not found" }, { status: 404 });
    }

    // Populate category references with actual documents
    const populated = await updated.populate("categories");

    // Return updated birthday record
    return NextResponse.json(populated);
  } catch (err) {
    console.error("Error updating birthday:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
