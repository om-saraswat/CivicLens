"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to home if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Login to Civic AI Agent</h1>
      <button
        className="bg-white text-black hover:bg-gray-200 font-medium py-2 px-4 rounded shadow transition"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Sign in with Google
      </button>
    </div>
  );
}
