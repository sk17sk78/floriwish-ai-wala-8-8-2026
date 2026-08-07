"use client";

// utils
import { lazy, Suspense } from "react";

// components
const SupportMessageCount = lazy(() => import("./SupportMessageCount"));

export default function SupportMessageLabel() {
  return (
    <span className="flex items-center justify-between pr-2.5 gap-2 w-full">
      <span>Contact Us Form</span>
      <Suspense fallback={<></>}>
        <SupportMessageCount />
      </Suspense>
    </span>
  );
}
