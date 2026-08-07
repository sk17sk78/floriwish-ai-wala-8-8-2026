"use client";

import { useState } from "react";

export default function FranchiseEnquiryForm() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      const payload = {
        name: String(fd.get("name") || ""),
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
        throw new Error(data?.message || data?.error || "Submission failed");
      }

      form.reset();
      setStatus("success");
      setMessage(
        "Thanks! We received your franchise enquiry. We will be in touch soon.",
      );
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Phone <span className="text-rose-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="john@example.com"
          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Target City <span className="text-rose-500">*</span>
          </label>
          <input
            name="city"
            type="text"
            placeholder="e.g. Mumbai"
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
            required
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Investment <span className="text-rose-500">*</span>
          </label>
          <select
            name="investmentRange"
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 appearance-none cursor-pointer"
            required
            defaultValue=""
          >
            <option value="" disabled className="text-gray-400">
              Select Range
            </option>
            <option value="5-10">5 - 10 Lakhs</option>
            <option value="10-20">10 - 20 Lakhs</option>
            <option value="20+">20+ Lakhs</option>
          </select>
          <div className="absolute inset-y-0 right-4 top-7 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Message <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <textarea
          name="message"
          placeholder="Tell us a bit about your background..."
          rows={3}
          className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400 resize-none"
        ></textarea>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-[#b76e79] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[#9a5963] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          {status === "submitting" ? "Submitting..." : "Submit Enquiry"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            status === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
