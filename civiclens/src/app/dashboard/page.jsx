"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar"
import toast from "react-hot-toast";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }

    if (session?.user) {
      fetchComplaints();
    }
  }, [status, router, session]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/Complaints", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for sending cookies/session
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch complaints");
      }

      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints);
      } else {
        throw new Error(data.error || "Failed to load complaints");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-red-500 text-xl font-semibold mb-2">
            Error Loading Complaints
          </h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => fetchComplaints()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleNewComplaint = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      
      {/* User Profile Section */}
      <div className="flex flex-col items-center mb-12">
        <img
          src={session?.user?.image || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-gray-700 mb-4 shadow-xl"
        />
        <h1 className="text-4xl font-bold mb-2">{session?.user?.name}</h1>
        <p className="text-xl text-gray-400">{session?.user?.email}</p>
      </div>

      {/* Complaints Section */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-200">
            Your Complaints
          </h2>
          <button
            onClick={handleNewComplaint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
          >
            + New Complaint
          </button>
        </div>

        {/* Complaints List */}
        {/* Complaints List */}
<div className="space-y-4">
  {complaints.length === 0 ? (
    <div className="text-center text-gray-400 py-8">
      No complaints found. Create your first complaint!
    </div>
  ) : (
    complaints.map((complaint) => (
      <Link
        key={complaint._id}
        href={`/complaints/${complaint._id}`}
        className="block"
      >
        <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-medium mb-2">
                {complaint.subject}
              </h3>
              <div className="mt-3 flex gap-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    complaint.status === "Pending"
                      ? "bg-yellow-900 text-yellow-200"
                      : complaint.status === "In Progress"
                      ? "bg-blue-900 text-blue-200"
                      : "bg-green-900 text-green-200"
                  }`}
                >
                  {complaint.status}
                </span>
                <span className="text-gray-500">
                  #{complaint.complaintNo}
                </span>
              </div>
            </div>
            <span className="text-gray-500">
              {formatDate(complaint.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    ))
  )}
</div>

      </div>
    </div>
  );
}
