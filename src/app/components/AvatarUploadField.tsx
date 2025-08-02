import { useRef } from "react";
import { uploadAvatar } from "@/lib/uploadAvatar";

// Props for the AvatarUploadField component
interface AvatarUploadFieldProps {
  personId: string; // ID of the person the avatar is associated with
  avatarUrl: string; // Current avatar URL (if any)
  setAvatarUrl: (url: string) => void; // Callback to update avatar URL
  setError: (msg: string) => void; // Callback to set an error message
}

// AvatarUploadField allows the user to upload an avatar via click or drag-and-drop
export default function AvatarUploadField({
  personId,
  avatarUrl,
  setAvatarUrl,
  setError,
}: AvatarUploadFieldProps) {
  // Reference to the hidden file input for programmatic click
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Handle file upload using the provided helper function
  const handleUpload = async (file: File) => {
    const result = await uploadAvatar(file, personId);
    if (result.path) {
      // Update the avatar URL and clear any error
      setAvatarUrl(result.path);
      setError("");
    } else {
      // Show error message on failure
      setError(result.error || "Upload failed");
    }
  };

  return (
    <div className="col-span-2">
      {/* Drop area and clickable upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleUpload(file);
        }}
        className="border-2 border-dashed border-gray-400 rounded p-4 text-center hover:bg-gray-50 cursor-pointer"
        onClick={() => inputRef.current?.click()} // Trigger file input click
      >
        <p className="text-sm">Click or drag and drop to upload avatar image</p>
      </div>

      {/* Hidden file input triggered by click on drop zone */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*" // Only allow image files
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      {/* Success message when image is uploaded */}
      {avatarUrl && <p className="text-sm text-green-600 mt-1">Image uploaded ✅</p>}
    </div>
  );
}
