"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// ✅ Your current SendEmailPage component code (unchanged) goes here
export default function SendEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [departmentData, setDepartmentData] = useState(null);

  useEffect(() => {
    const urlTo = searchParams.get("to");
    const urlSubject = searchParams.get("subject");
    const urlMessage = searchParams.get("message");
    const urlDepartment = searchParams.get("department");
    const urlLocation = searchParams.get("location");
    const urlAddress = searchParams.get("address");
    const urlLat = searchParams.get("lat");
    const urlLon = searchParams.get("lon");

    if (urlTo || urlSubject || urlMessage) {
      setTo(urlTo || "");
      setSubject(urlSubject || "");
      setMessage(urlMessage || "");
      setDepartmentData({
        department: urlDepartment || "Unknown Department",
        email: urlTo || "",
        address: urlAddress || urlLocation || "",
        lat: urlLat || "",
        lon: urlLon || ""
      });
    } else {
      const savedDeptData = sessionStorage.getItem('departmentData');
      if (savedDeptData) {
        try {
          const deptData = JSON.parse(savedDeptData);
          setTo(deptData.email || "");
          setSubject(deptData.subject || "");
          setMessage(deptData.body || "");
          setDepartmentData(deptData);
          sessionStorage.removeItem('departmentData');
        } catch (error) {
          setDepartmentData({
            department: "Unknown Department",
            email: "",
            address: "",
            lat: "",
            lon: ""
          });
        }
      } else {
        setDepartmentData({
          department: "Unknown Department",
          email: "",
          address: "",
          lat: "",
          lon: ""
        });
      }
    }
  }, [searchParams]);

  const sendEmail = async () => {
    setLoading(true);
    setStatus("Sending...");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          message,
          deptName: departmentData?.department || "Unknown Department",
          location: departmentData?.address || searchParams.get("location") || "",
          lat: departmentData?.lat || "",
          lon: departmentData?.lon || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Complaint registered successfully!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        toast.error("Failed to send: " + data.error);
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-[#111827] border border-gray-700 rounded-2xl shadow-[0_0_10px_rgba(249,249,249,0.5)] p-8 text-gray-100">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Send CivicLens Email
        </h1>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-300">
            Recipient Email
          </label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 hover:border-3 transition-colors duration-200"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-300">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 hover:border-3 transition-colors duration-200"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-300">
            Message
          </label>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 hover:border-3 transition-colors duration-200"
          />
        </div>

        <button
          onClick={sendEmail}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          {loading ? "Sending..." : "Send Email"}
        </button>

        {status && (
          <p className="text-center text-sm mt-4 text-gray-400">{status}</p>
        )}
      </div>
    </div>
  );
}
