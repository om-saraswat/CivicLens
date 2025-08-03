"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-950">
      {/* Sidebar */}
      <aside className="w-72 h-screen bg-gray-950 text-white flex flex-col items-center py-8 border-r border-gray-800">
        <img
          src={session?.user?.image ?? "/default-avatar.png"}
          alt="User Avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shadow mb-4"
        />
        <h2 className="text-lg font-bold">{session?.user?.name}</h2>
        <p className="text-gray-400 text-sm text-center px-4 break-words mb-6">
          {session?.user?.email}
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-11/12 bg-white text-black hover:bg-gray-200 font-semibold py-2.5 px-4 rounded-lg shadow-md transition mb-4"
        >
          Dashboard
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="w-11/12 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition"
        >
          Logout
        </button>
      </aside>

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
