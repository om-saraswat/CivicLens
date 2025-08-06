"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Components/Sidebar";
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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

        // 1️⃣ Step 1: Image → Description
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

        // 2️⃣ Step 2: Get location and department
        const location = await getLocation();
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

        // 3️⃣ Navigate to /send-email with query params
        const query = new URLSearchParams({
          to: deptData.email || "",
          subject: deptData.subject || "",
          message: deptData.body || "",
        }).toString();

        router.push(`/send-email?${query}`);
      };
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
      );
    });
  };

  return (
    <div className="min-h-screen flex bg-transparent ">
    
      <Sidebar/>
      <main className="flex-1 flex items-center justify-center px-4 ">
        <div className="bg-gray-950 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center text-white border border-gray-800">
          <h1 className="text-3xl font-extrabold mb-6">Report an Issue</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-700"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-2 font-semibold rounded-lg transition ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {loading ? "Processing..." : "Submit Issue"}
            </button>
          </form>

          {statusMessage && (
            <p className="mt-4 text-sm text-gray-400">{statusMessage}</p>
          )}
        </div>
      </main>
    </div>
  );
}
