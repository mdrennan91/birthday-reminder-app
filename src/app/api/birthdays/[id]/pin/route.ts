// src/app/api/birthdays/[id]/pin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbconnect from "@/lib/dbconnect";
import Birthday from "@/models/Birthday";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { pinned } = await req.json();

    if (typeof pinned !== "boolean") {
      return NextResponse.json({ message: "Invalid pinned value" }, { status: 400 });
    }

    await dbconnect();

    const birthday = await Birthday.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { pinned },
      { new: true }
    ).lean();

    if (!birthday) {
      return NextResponse.json({ message: "Birthday not found" }, { status: 404 });
    }

    return NextResponse.json(birthday);
  } catch (err) {
    console.error("Error updating pinned state:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
