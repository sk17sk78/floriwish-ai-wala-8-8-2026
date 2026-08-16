"use client";

import { ADMIN_VERIFIED } from "@/common/constants/cookieKeys";
import { ROOT_ADMIN_ROUTE } from "@/common/routes/admin/staticLinks";
import { type Children } from "@/common/types/reactTypes";
import HeaderLogo from "@/components/(_common)/Logo/HeaderLogo";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginLayout({ children }: { children: Children }) {
  const { replace } = useRouter();

  useEffect(() => {
    const adminVerified = sessionStorage.getItem(ADMIN_VERIFIED);
    if (adminVerified === "true") {
      replace(ROOT_ADMIN_ROUTE);
    }
  }, [replace]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 bg-[#fafafc] text-zinc-900 relative">
      {/* Top Header with Brand Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <HeaderLogo atFooter />
      </div>

      {/* Centered Clean Login Card */}
      <div className="relative z-10 my-auto w-full max-w-sm sm:max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-200/80 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Sign In to Admin
          </h1>
          <p className="text-xs sm:text-[13px] text-zinc-500 font-normal">
            Enter your credentials to access the store management dashboard.
          </p>
        </div>

        {/* Children (Form fields) */}
        <div>
          {children}
        </div>

        {/* Back to website */}
        <div className="pt-3 text-center border-t border-zinc-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#ad2355] transition-colors duration-200 group no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Return to Main Website</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 text-[11px] sm:text-xs text-zinc-400 text-center pb-2">
        &copy; {new Date().getFullYear()} Floriwish. All rights reserved.
      </div>
    </div>
  );
}
