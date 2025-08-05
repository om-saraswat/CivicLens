"use client";
import { useState } from "react";

export default function GetDepartmentPage() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null); // For debugging unexpected JSON

  // 1️⃣ Get browser location
  const getLocationFromBrowser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLon(position.coords.longitude.toFixed(6));
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to fetch location. Please allow location access.");
      }
    );
  };

  // 2️⃣ Fetch department info from backend
  const handleCheckDepartment = async () => {
    if (!lat || !lon || !issue) {
      alert("Please provide location and issue description.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setRawResponse(null);

    try {
      const res = await fetch("/api/Deptartment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          issueDescription: issue,
        }),
      });

      const text = await res.text(); // First get as text to catch HTML errors

      try {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.error || "Failed to fetch department info");
        setResult(data);
      } catch (parseError) {
        setError("Server returned invalid JSON. Check console for raw output.");
        setRawResponse(text);
        console.error("❌ Raw response from server:", text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🏛 Find Responsible Department</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={getLocationFromBrowser}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
        >
          📍 Get Current Location
        </button>
        {lat && lon && (
          <p className="text-gray-300 mt-2">
            Detected: {lat}, {lon}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Describe the Issue:</label>
        <textarea
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="e.g., Large pothole causing traffic on the main road"
          className="w-full p-2 rounded text-white bg-gray-800"
          rows={3}
        />
      </div>

      <button
        onClick={handleCheckDepartment}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium"
      >
        {loading ? "Processing..." : "Check Department"}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {rawResponse && (
        <div className="mt-4 bg-gray-800 text-yellow-400 p-3 rounded text-sm overflow-x-auto">
          <b>Raw Server Response:</b>
          <pre className="whitespace-pre-wrap break-words">{rawResponse}</pre>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-gray-800 p-4 rounded space-y-4">
          <h2 className="text-lg font-semibold">📍 Location Info</h2>
          <p><b>Address:</b> {result.address}</p>

          <h2 className="text-lg font-semibold">🏢 Department Info</h2>
          <p><b>Department:</b> {result.department}</p>
          <p><b>Email:</b> {result.email}</p>

          <h2 className="text-lg font-semibold">✉️ Email Complaint</h2>
          <p><b>Subject:</b> {result.subject}</p>
          <div>
            <b>Body:</b>
            <pre className="bg-gray-700 p-3 mt-1 rounded whitespace-pre-wrap break-words text-sm">{result.body}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
