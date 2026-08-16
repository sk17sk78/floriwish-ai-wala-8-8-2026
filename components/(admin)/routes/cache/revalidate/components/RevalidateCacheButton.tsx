"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import { ReactNode } from "react";

export default function RevalidateCacheButton({
  type,
  label,
  icon,
  onClick
}: {
  type: "cache" | "sitemap";
  label: string;
  icon?: ReactNode;
  onClick: () => Promise<boolean | any>;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await onClick();
      toast({
        variant: "success",
        title: "Success",
        description: `${label} ${type === "cache" ? "cache" : "sitemap"} refreshed successfully.`
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed",
        description: `Failed to refresh ${label} ${type === "cache" ? "cache" : "sitemap"}. Please try again.`
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className={`flex items-center justify-between p-3.5 px-4 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50 transition-all text-xs font-medium text-stone-800 shadow-xs cursor-pointer ${
        isLoading ? "opacity-70 cursor-not-allowed bg-stone-50" : "active:scale-98"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-stone-600 shrink-0">{icon}</span>}
        <span className="font-semibold text-stone-900">{label}</span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 shrink-0 ml-2">
        {isLoading ? (
          <>
            <RefreshCw width={13} height={13} className="animate-spin text-[#5e1628]" />
            <span className="text-[#5e1628] font-medium">Refreshing...</span>
          </>
        ) : (
          <span className="text-stone-400 font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">Sync</span>
        )}
      </div>
    </button>
  );
}
