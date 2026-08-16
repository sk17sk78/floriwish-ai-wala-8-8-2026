"use client";

import React, { memo } from "react";
import { useAdminTheme } from "@/hooks/useAdminTheme";
import { Moon, Sun } from "lucide-react";

export function AdminThemeToggle({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "icon" | "sidebar";
  className?: string;
}) {
  const { theme, isDark, toggleTheme } = useAdminTheme();

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle Dark/Light Mode"
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
          isDark
            ? "bg-[#18181b] border-zinc-800 text-amber-400 hover:bg-zinc-800"
            : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
        } ${className}`}
      >
        {isDark ? <Sun width={16} height={16} /> : <Moon width={16} height={16} />}
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <div
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer border select-none ${
          isDark
            ? "bg-[#18181b] border-zinc-800 text-zinc-300 hover:bg-zinc-800/80"
            : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon width={15} height={15} className="text-indigo-400" />
          ) : (
            <Sun width={15} height={15} className="text-amber-500" />
          )}
          <span className="text-xs font-semibold">{isDark ? "Dark Mode" : "Light Mode"}</span>
        </div>

        {/* Sliding Pill Switch */}
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
            isDark ? "bg-[#ad2355]" : "bg-zinc-300"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              isDark ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
      </div>
    );
  }

  // Default "pill" style
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
        isDark
          ? "bg-[#18181b] border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
          : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun width={14} height={14} className="text-amber-400" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon width={14} height={14} className="text-zinc-500" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}

export default memo(AdminThemeToggle);
