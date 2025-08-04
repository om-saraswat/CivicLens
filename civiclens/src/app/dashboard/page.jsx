"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <p className="text-gray-400 text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const handleNewComplaint = () => {
    router.push('/complaints/new');

  };

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      {/* Large User Profile Section */}
      <div className="flex flex-col items-center mb-12">
        <img 
          src={session?.user?.image || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-gray-700 mb-4 shadow-xl"
        />
        <h1 className="text-4xl font-bold mb-2">{session?.user?.name}</h1>
        <p className="text-xl text-gray-400">{session?.user?.email}</p>
      </div>

      {/* Complaints Section with New Complaint Button */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-200">Your Complaints</h2>
          <button 
            onClick={handleNewComplaint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
          >
            + New Complaint
          </button>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {/* Sample Complaints */}
          <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-medium mb-2">Road Maintenance Issue</h3>
                <p className="text-gray-400">Pothole on Main Street needs immediate attention</p>
                <span className="inline-block mt-3 text-yellow-500">In Progress</span>
              </div>
              <span className="text-gray-500">2 days ago</span>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-medium mb-2">Street Light Malfunction</h3>
                <p className="text-gray-400">Street light flickering at Corner Avenue</p>
                <span className="inline-block mt-3 text-yellow-500">In Progress</span>
              </div>
              <span className="text-gray-500">5 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}