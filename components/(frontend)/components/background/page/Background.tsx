// components
import dynamic from "next/dynamic";

// types
import { type ReactNode } from "react";

// Defer StickyButtons (usePathname + regex + WhatsApp logic) out of critical JS bundle
const StickyButtons = dynamic(
  () => import("../components/StickyButtons"),
  { ssr: false }
);

export default async function Background({
  children,
  showStickyButtons
}: {
  children: ReactNode;
  showStickyButtons?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-stretch justify-start min-h-device bg-white`}
    >
      {children}
      {Boolean(showStickyButtons) && <StickyButtons />}
    </div>
  );
}
