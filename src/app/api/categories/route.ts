import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbconnect from "@/lib/dbconnect";
import Category from "@/models/Category";

export async function GET() {
  try {
    await dbconnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const categories = await Category.find({ userId: session.user.id });
    return NextResponse.json(categories);
  } catch (err) {
    console.error("Error loading categories:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try{
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, color } = await req.json();
    await dbconnect();

    const newCat = await Category.create({ name, color, userId: session.user.id });
    return NextResponse.json(newCat, { status: 201 });
  } catch (err) {
    console.error("Error loading categories:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
