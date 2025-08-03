"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../app/Components/Sidebar"
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex bg-transparent">
      <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-gray-950 shadow-2xl rounded-2xl p-8 w-full max-w-sm text-center text-white border border-gray-800">
          <h1 className="text-3xl font-extrabold mb-4">Welcome Back!</h1>
          <p className="text-gray-400">Select "Dashboard" to manage complaints or logout above.</p>
        </div>
      </main>
    </div>
  );
}
