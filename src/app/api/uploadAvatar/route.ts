import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import dbConnect from "@/lib/dbconnect";
import PersonModel from "@/models/Birthday";
import { v4 as uuidv4 } from "uuid";

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Handles POST requests to upload an avatar image
export async function POST(req: Request) {
  try {
    // Parse multipart form data
    const formData = await req.formData();

    const personId = formData.get("personId")?.toString(); // Get person ID
    const file = formData.get("image"); // Get image file

    // Validate required fields and type
    if (!personId || !file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing personId or image file" },
        { status: 400 }
      );
    }

    // Allow only certain image formats
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 }
      );
    }

    // Convert file Blob to buffer for upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename with correct extension
    const ext = file.name?.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${ext}`;

    // Connect to MongoDB
    await dbConnect();

    // Step 1: Find existing person and previous avatar (if any)
    const person = await PersonModel.findById(personId);
    const oldAvatar = person?.avatarUrl;

    // Step 2: Upload the new avatar to Supabase storage bucket
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filename, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload to Supabase failed" },
        { status: 500 }
      );
    }

    // Step 3: Delete old avatar from Supabase storage (if one exists)
    if (oldAvatar) {
      const { error: deleteError } = await supabase.storage
        .from("images")
        .remove([oldAvatar]);
      if (deleteError) {
        console.warn("Failed to delete old avatar:", deleteError.message);
      }
    }

    // Step 4: Update the avatar filename in the database
    await PersonModel.findByIdAndUpdate(
      personId,
      { $set: { avatarUrl: filename } },
      { new: true, runValidators: true }
    );

    // Step 5: Generate a temporary signed URL for the uploaded image (1 hour expiry)
    const { data: signedUrlData } = await supabase.storage
      .from("images")
      .createSignedUrl(filename, 60 * 60); // 60 minutes

    // Respond with the filename and signed preview URL
    return NextResponse.json({
      message: "Uploaded successfully",
      path: filename,
      signedUrl: signedUrlData?.signedUrl,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
