"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
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
    <div className="flex justify-center items-center h-screen bg-transparent text-white px-4 -mt-26">
      <div className="bg-gray-950 p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <img src="/logo3.png" alt="Logo" className="w-16 h-16 mb-4" />

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-center mb-6">Login to CivicLens</h1>

        {/* Google Sign-In Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-200 mb-4"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 488 512"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M488 261.8C488 403.3 391.6 504 248 504 110.8 504 8 401.2 8 264S110.8 24 248 24c66.9 0 122.3 24 164.1 63.1l-66.6 63.9C320.6 123.1 287.5 112 248 112c-84.2 0-152.5 70.6-152.5 157.6S163.8 427.2 248 427.2c74.3 0 122.2-42.5 131.6-102.1H248v-81.3h240C487.5 251.6 488 256.8 488 261.8z" />
          </svg>
          Continue with Google
        </button>

        {/* Terms & Privacy Text */}
        <p className="text-xs text-gray-500 text-center mt-2 px-2">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-300">terms</a> and{" "}
          <a href="/privacy" className="underline hover:text-gray-300">privacy policy</a>.
        </p>
      </div>
    </div>
  );
}
