"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import toast from "react-hot-toast";

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
        credentials: "include",
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

  const handleNewComplaint = () => {
    router.push("/");
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-red-500 text-xl font-semibold mb-2">Error Loading Complaints</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={fetchComplaints}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-8 py-8">
      {/* User Profile */}
      <div className="flex flex-col items-center mb-10 text-center">
        <img
          src={session?.user?.image || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-gray-700 mb-4 shadow-xl"
        />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{session?.user?.name}</h1>
        <p className="text-sm sm:text-base text-gray-400">{session?.user?.email}</p>
      </div>

      {/* Complaints Section */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-200">
            Your Complaints
          </h2>
          <button
            onClick={handleNewComplaint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:py-3 sm:px-6 rounded-md text-sm sm:text-base"
          >
            + New Complaint
          </button>
        </div>

        {/* Complaint List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm sm:text-base">
              No complaints found. Create your first complaint!
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-gray-900 p-4 sm:p-6 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium mb-1">{complaint.subject}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
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
                      <span className="text-gray-500 text-sm">
                        #{complaint.complaintNo}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm sm:text-base">
                    {formatDate(complaint.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
