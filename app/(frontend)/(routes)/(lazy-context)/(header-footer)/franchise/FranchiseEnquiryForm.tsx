"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FranchiseEnquiryForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [submittedName, setSubmittedName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      const name = String(fd.get("name") || "");
      const payload = {
        name,
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        city: String(fd.get("city") || ""),
        investmentRange: String(fd.get("investmentRange") || ""),
        message: String(fd.get("message") || ""),
      };

      const res = await fetch("/api/action/franchise-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Submission failed. Please try again.");
      }

      form.reset();
      setSubmittedName(name);
      setStatus("success");
      setMessage(
        "Thanks! We received your franchise enquiry. Our franchise development manager will reach out within 24 hours."
      );
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please check your connection and try again."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="py-8 px-6 bg-zinc-50 border border-zinc-200/80 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 bg-[#ad2355]/10 text-[#ad2355] border border-[#ad2355]/20 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
            Franchise Enquiry Received!
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Thank you, {submittedName || "Partner"}. We have received your interest in owning a Floriwish franchise. Our expansion team will review your target location and contact you shortly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setSubmittedName("");
            }}
            className="px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
          >
            Submit Another Query
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#ad2355] hover:bg-[#8e1944] rounded-xl transition-colors shadow-xs w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 sm:py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#ad2355] focus:ring-2 focus:ring-[#ad2355]/15 transition-all duration-200 text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm";
  const labelClass = "block text-xs font-medium text-zinc-700 mb-1.5";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Full Name <span className="text-zinc-400">*</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="e.g. Vikram Malhotra"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Phone Number <span className="text-zinc-400">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Email Address <span className="text-zinc-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="e.g. vikram@example.com"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Target City / Location <span className="text-zinc-400">*</span>
          </label>
          <input
            name="city"
            type="text"
            placeholder="e.g. Ahmedabad, Gujarat"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Investment Budget Range <span className="text-zinc-400">*</span>
        </label>
        <div className="relative">
          <select
            name="investmentRange"
            className={`${inputClass} appearance-none cursor-pointer pr-9`}
            required
            defaultValue=""
          >
            <option value="" disabled className="text-zinc-400">
              Select your planned investment capacity
            </option>
            <option value="5-10">₹5 - ₹10 Lakhs (Studio / Cloud Kitchen Model)</option>
            <option value="10-20">₹10 - ₹20 Lakhs (Exclusive Retail Boutique)</option>
            <option value="20-35">₹20 - ₹35 Lakhs (Flagship Experience Hub)</option>
            <option value="35+">₹35+ Lakhs (Master / Multi-Unit City Franchise)</option>
          </select>
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Prior Business Experience / Notes <span className="text-zinc-400">(Optional)</span>
        </label>
        <textarea
          name="message"
          placeholder="Briefly tell us about your current business background or retail experience..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-[#ad2355] hover:bg-[#8e1944] disabled:opacity-70 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl shadow-md shadow-[#ad2355]/20 hover:shadow-lg hover:shadow-[#ad2355]/30 transition-all duration-200 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Franchise Request...</span>
            </>
          ) : (
            <span>Submit Franchise Enquiry</span>
          )}
        </button>
      </div>

      {status === "error" && message && (
        <div className="p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          {message}
        </div>
      )}
    </form>
  );
}
