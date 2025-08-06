import { Suspense } from "react";
import dynamic from "next/dynamic";

const SendEmailClient = dynamic(() => import("./SendEmailClient"), {
  ssr: false, // Disables server-side rendering
});

export default function SendEmailPageWrapper() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading Email Form...</div>}>
      <SendEmailClient />
    </Suspense>
  );
}
