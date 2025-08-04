"use client";
import { useState } from "react";

export default function UploadPage() {
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const handleUpload = async () => {
    if (!imageFile) return alert("Please select an image");

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1]; // remove metadata
      const mimeType = imageFile.type;

      try {
        const res = await fetch("/api/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image: base64String, mimeType }),
        });

        const data = await res.json();
        if (res.ok) {
          setDescription(data.description);
        } else {
          console.error(data.error);
          setDescription("❌ Failed to process image.");
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setDescription("❌ Internal server error.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">📤 Upload Image</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="mb-4 block"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload & Analyze"}
      </button>

      {description && (
        <div className="mt-6 bg-gray-800 p-4 rounded text-sm whitespace-pre-wrap">
          {description}
        </div>
      )}
    </div>
  );
}
