"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SendEmailPage() {
  const searchParams = useSearchParams();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTo(searchParams.get("to") || "");
    setSubject(searchParams.get("subject") || "");
    setMessage(searchParams.get("message") || "");
  }, [searchParams]);

  const sendEmail = async () => {
    setStatus("Sending...");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("✅ Email sent successfully!");
        setTo("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("❌ Failed to send: " + data.error);
      }
    } catch (error) {
      setStatus("❌ Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-6">
      <div className="w-full max-w-xl bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">
          Send CivicLens Email
        </h1>

        {/* Recipient */}
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Recipient Email
        </label>
        <input
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        {/* Subject */}
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Subject
        </label>
        <input
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {/* Message */}
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Message
        </label>
        <textarea
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="6"
        />

        <button
          onClick={sendEmail}
          className="w-full py-3 mt-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition"
        >
          Send Email
        </button>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-300">{status}</p>
        )}
      </div>
    </div>
  );
}
