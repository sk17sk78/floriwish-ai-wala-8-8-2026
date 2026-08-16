"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/auth/useAdminAuth";
import { Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { ROOT_ADMIN_ROUTE } from "@/common/routes/admin/staticLinks";

export default function FrontendAdminLoginPage() {
  const { replace } = useRouter();
  const {
    data: { isAuthenticated },
    method: { login }
  } = useAdminAuth();

  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userName || !password) return;

    setIsLoading(true);
    setLoginError("");
    try {
      await login({ userName, password });
    } catch (err: any) {
      console.error("Login failed", err);
      setLoginError(err?.message || "Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) replace(ROOT_ADMIN_ROUTE);

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full text-left">
      {/* Error notification if any */}
      {loginError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium">
          {loginError}
        </div>
      )}

      {/* Username Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-700">
          Username
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your username"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-200/90 rounded-xl text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355] focus:ring-2 focus:ring-[#ad2355]/10 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-700">
          Password
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-zinc-200/90 rounded-xl text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm focus:outline-none focus:border-[#ad2355] focus:ring-2 focus:ring-[#ad2355]/10 shadow-2xs transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-zinc-400 hover:text-zinc-700 transition-colors p-1 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isLoading || !userName || !password}
        className="w-full mt-2 py-2.5 px-4 bg-[#ad2355] hover:bg-[#8e1944] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
