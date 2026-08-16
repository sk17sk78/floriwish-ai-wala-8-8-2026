"use client";

// icons
import { LogOut } from "lucide-react";
import { AdminThemeToggle } from "@/components/(admin)/theme/AdminThemeToggle";

export default function AdminSidebarFooter({
  isLocked,
  isMobile,
  userName,
  logout
}: {
  isLocked: boolean;
  isMobile?: boolean;
  userName?: string;
  logout: () => void;
}) {
  return (
    <div className="justify-end pt-2.5 relative space-y-2 w-full">
      <div className="absolute top-0 left-0 h-px w-[calc(100%_-_12px)] bg-zinc-200 dark:bg-zinc-800" />

      {/* Dark / Light Mode Toggle */}
      <div className={`w-full px-1 ${isLocked || isMobile ? "block" : "hidden group-hover:block"}`}>
        <AdminThemeToggle variant="sidebar" />
      </div>

      <div
        className={`relative grid grid-cols-[50px_10px_1fr] max-sm:w-full sm:grid-cols-[calc(68px_-_24px)_12px_calc(300px_-_36px_-_calc(68px_-_24px))] items-center rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 p-1`}
      >
        <span
          className={`h-[calc(68px_-_24px)] grid place-items-center rounded-xl transition-all duration-300`}
        >
          <div className="rounded-full sm:scale-[1.1] bg-rose-100 dark:bg-rose-950/60 overflow-hidden aspect-square w-8 relative flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold text-xs">
            {userName?.slice(0, 1)?.toUpperCase() || "U"}
          </div>
        </span>
        <span
          className={
            isLocked || isMobile
              ? ""
              : `opacity-0 group-hover:opacity-100 transition-opacity duration-100 group-hover:duration-300`
          }
        ></span>
        <span
          className={`text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate ${
            isLocked || isMobile
              ? ""
              : `opacity-0 group-hover:opacity-100 transition-opacity duration-100 group-hover:duration-300`
          }`}
        >
          {userName}
        </span>

        <button
          type="button"
          aria-label="Logout"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors duration-200 cursor-pointer"
          onClick={logout}
        >
          <LogOut
            strokeWidth={1.8}
            width={16}
            height={16}
          />
        </button>
      </div>
    </div>
  );
}
