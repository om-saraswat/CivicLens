"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to /sign-in if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ textAlign: "center", marginTop: 50 }}>Loading...</div>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>Hello {session.user.name}</h1>
      <img src={session.user.image} width={80} style={{ borderRadius: "50%" }} />
      <p>Email: {session.user.email}</p>
      <button onClick={() => signOut({ callbackUrl: "/signin" })}>Logout</button>
    </div>
  );
}
