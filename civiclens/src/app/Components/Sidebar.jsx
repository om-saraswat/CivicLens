"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <aside className="h-screen w-72 bg-gray-950 text-white flex flex-col items-center py-8 border-r border-gray-800">
      {/* User Profile */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={session?.user?.image ?? "/default-avatar.png"}
          alt="User Avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shadow-md mb-4"
        />
        <h2 className="text-lg font-bold">{session?.user?.name}</h2>
        <p className="text-gray-400 text-sm text-center px-4 break-words">
          {session?.user?.email}
        </p>
      </div>

      {/* Navigation */}
      <nav className="w-full px-4">
        <button
          onClick={() => {
  console.log("Navigating to /dashboard");
  router.push("/dashboard");
}}

          className="w-full bg-white text-black hover:bg-gray-200 font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-200"
        >
          Dashboard
        </button>
      </nav>
    </aside>
  );
}
