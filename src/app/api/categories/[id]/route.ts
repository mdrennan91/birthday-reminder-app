import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/dbconnect";
import Category from "@/models/Category";

type Context = { params: { id: string } };

export async function PUT(req: NextRequest, context: unknown) {
  const { id } = await (context as Context).params;
  const { name, color } = await req.json();

  await dbconnect();
  await Category.findByIdAndUpdate(id, { name, color });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, context: unknown) {
  const { id } = await (context as Context).params;

  await dbconnect();
  await Category.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
