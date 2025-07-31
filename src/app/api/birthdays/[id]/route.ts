// src/app/api/birthdays/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbconnect from "@/lib/dbconnect";
import Birthday from "@/models/Birthday";

/**
 * DELETE /api/birthdays/:id
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    const deleted = await Birthday.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json({ message: "Birthday not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Birthday deleted successfully" });
  } catch (err) {
    console.error("Error deleting birthday:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/birthdays/:id
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await dbconnect();

    const updated = await Birthday.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: data },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Birthday not found" }, { status: 404 });
    }

    const populated = await updated.populate("categories");
    return NextResponse.json(populated);
  } catch (err) {
    console.error("Error updating birthday:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
