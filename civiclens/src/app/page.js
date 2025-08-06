"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Components/Sidebar";
import { UploadCloud } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-gray-400 text-lg animate-pulse">Checking session...</p>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    setStatusMessage("⏳ Processing image and generating complaint...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];
        const mimeType = image.type;

        setStatusMessage("🔍 Analyzing image...");
        const res = await fetch("/api/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image: base64String, mimeType }),
        });

        const imgData = await res.json();
        if (!imgData.description) {
          setLoading(false);
          setStatusMessage("❌ Failed to analyze image.");
          return;
        }

        setStatusMessage("📍 Getting location...");
        const location = await getLocation();

        setStatusMessage("🏢 Finding responsible department...");
        const deptRes = await fetch("/api/Deptartment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: location.lat,
            lon: location.lon,
            issueDescription: imgData.description,
          }),
        });

        const deptData = await deptRes.json();
        if (deptData.error) {
          setLoading(false);
          setStatusMessage("❌ Failed to determine department.");
          return;
        }

        sessionStorage.setItem("departmentData", JSON.stringify(deptData));

        setStatusMessage("📧 Preparing email...");
        const query = new URLSearchParams({
          to: deptData.email || "",
          subject: deptData.subject || "",
          message: deptData.body || "",
          department: deptData.department || "Unknown Department",
          address: deptData.address || "",
          location: deptData.address || `Lat: ${location.lat}, Lon: ${location.lon}`,
          lat: deptData.lat || location.lat,
          lon: deptData.lon || location.lon,
        }).toString();

        router.push(`/send-email?${query}`);
      };
    } catch (err) {
      console.error("❌ Error in handleSubmit:", err);
      setStatusMessage("❌ Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(new Error("Failed to get location"));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-[0_0_10px_rgba(249,249,249,0.5)] w-full max-w-xl p-10 space-y-8">

          <h1 className="text-3xl font-bold text-center">Report an Issue</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="w-full">
              {preview ? (
                <div className="relative w-full h-72 border border-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center h-72 w-full border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-red-500 transition-colors"
                >
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-400 font-medium text-sm">
                    Click to upload image
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !image}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading || !image
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {loading ? "Processing..." : "Submit Issue"}
            </button>
          </form>

          {statusMessage && (
            <div className="text-sm text-center text-gray-400 pt-2">
              {statusMessage}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
