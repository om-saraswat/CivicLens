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
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <img
            src={session?.user?.image ?? "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Hello, {session?.user?.name}
        </h1>
        <p className="text-gray-500 text-sm mb-6">{session?.user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
