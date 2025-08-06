"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <div className="border-b border-gray-800">
      <nav className="w-full flex justify-between items-center px-6 py-3 bg-transparent text-white z-50">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-3">
          <img src="/logo3.png" alt="Org Logo" className="h-20 w-20 rounded-xl shadow-sm filter grayscale" />
          <span className="text-2xl font-extrabold tracking-wide">CivicLens</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 relative">
          {/* Theme icon (not toggling, just visual) */}
          {/* <button
            className="p-2 rounded-lg hover:bg-gray-800 transition"
            title="Dark mode icon"
          >
            <Moon size={20} />
          </button> */}

          {status === "authenticated" ? (
            <div className="relative">
              <img
                src={session.user?.image || "/default-avatar.png"}
                alt="User Avatar"
                className="h-10 w-10 rounded-full border border-gray-700 cursor-pointer hover:shadow-md transition"
                onClick={toggleDropdown}
              />

              {/* Styled Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-gray-950 text-white rounded-2xl shadow-2xl py-2 z-50 border border-gray-800">
                  <button
                    className="block w-full text-left px-4 py-2.5 font-medium hover:bg-gray-900 transition rounded-t-2xl"
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/dashboard");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2.5 font-medium hover:bg-gray-900 transition rounded-b-2xl"
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/signin" });
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-white text-black hover:bg-gray-200 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
