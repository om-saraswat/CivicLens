"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComplaintsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null; // or a loading spinner if you want
}
