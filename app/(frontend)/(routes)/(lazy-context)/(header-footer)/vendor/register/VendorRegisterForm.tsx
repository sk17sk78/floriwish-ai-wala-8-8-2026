"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "@/hooks/useLocation/useLocation";
import { MapPin, Search, ChevronDown, CheckCircle2, ArrowRight, RefreshCcw, Building2 } from "lucide-react";
import Link from "next/link";

export default function VendorRegisterForm() {
  const { cities, onSearch } = useLocation();
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [submittedDetails, setSubmittedDetails] = useState<{
    fullName: string;
    businessName: string;
  } | null>(null);

  // City search states
  const [citySearch, setCitySearch] = useState("");
  const [showCityResults, setShowCityResults] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const filteredCities = useMemo(() => {
    if (citySearch.length < 2) return [];
    return onSearch(citySearch.toLowerCase());
  }, [citySearch, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);

      const fullName = String(fd.get("fullName") || "");
      const businessName = String(fd.get("businessName") || "");

      const payload = {
        fullName,
        email: String(fd.get("email") || ""),
        businessName,
        city: String(fd.get("city") || ""),
        interestedCategory: String(fd.get("interestedCategory") || ""),
        mobile: String(fd.get("mobile") || ""),
        whatsapp: String(fd.get("whatsapp") || ""),
        address: String(fd.get("address") || ""),
        gstNumber: String(fd.get("gstNumber") || ""),
        foundUs: String(fd.get("foundUs") || ""),
        socialPlatform: String(fd.get("socialPlatform") || ""),
        socialLink: String(fd.get("socialLink") || ""),
      };

      const res = await fetch("/api/action/vendor-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Submission failed");
      }

      form.reset();
      setCitySearch("");
      setSubmittedDetails({ fullName, businessName });
      setStatus("success");
      setMessage("Thanks! We received your vendor application.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  // Render Human-Crafted Thank You Screen
  if (status === "success") {
    return (
      <div className="py-12 px-8 bg-[#faf7f2] border border-[#e8ded1] rounded-2xl text-center space-y-6">
        <div className="w-14 h-14 bg-[#b76e79] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 stroke-[2]" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Application Received!
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            Thank you for registering with Floriwish. We have received your vendor application details and our onboarding team will reach out to you within 24 hours.
          </p>
        </div>

        {submittedDetails && (
          <div className="p-4 bg-white rounded-xl border border-[#e5dcd0] max-w-sm mx-auto text-left space-y-1">
            <p className="text-xs uppercase tracking-wider font-bold text-[#b76e79]">
              Application Reference
            </p>
            <p className="text-sm font-bold text-gray-900">
              {submittedDetails.fullName}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Business: <span className="text-gray-800 font-semibold">{submittedDetails.businessName}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setStatus("idle");
              setSubmittedDetails(null);
            }}
            className="px-5 py-3 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
          >
            Submit Another Application
          </button>

          <Link
            href="/"
            className="px-6 py-3 text-xs font-semibold text-white bg-[#b76e79] hover:bg-[#9a5963] rounded-xl transition-colors shadow-sm w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
          >
            <span>Back to Floriwish Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#b76e79]/10 focus:border-[#b76e79] transition-all duration-300 text-gray-900 placeholder-gray-400 text-sm";
  const labelClass = "block text-sm font-medium text-gray-600 mb-2";

  const categories = [
    "Florist",
    "Decoration",
    "Balloon Decoration",
    "Bakery",
    "Gifting",
    "Other",
  ];

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            name="fullName"
            type="text"
            placeholder="John Doe"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="john@example.com"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Business Name */}
      <div>
        <label className={labelClass}>
          Business Name <span className="text-rose-500">*</span>
        </label>
        <input
          name="businessName"
          type="text"
          placeholder="Your brand or shop name"
          className={inputClass}
          required
        />
      </div>

      {/* Row 2: City & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative" ref={cityRef}>
          <label className={labelClass}>
            City <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="city"
              autoComplete="off"
              placeholder="Search or type city..."
              className={inputClass}
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityResults(true);
              }}
              onFocus={() => setShowCityResults(true)}
              required
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {showCityResults && filteredCities.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
              {filteredCities.map((city, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 hover:bg-rose-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                  onClick={() => {
                    setCitySearch(city.name);
                    setShowCityResults(false);
                  }}
                >
                  <MapPin className="w-4 h-4 text-[#b76e79] shrink-0" />
                  <span className="text-sm font-medium text-gray-700">
                    {city.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className={labelClass}>
            Interested Category <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              name="interestedCategory"
              className={`${inputClass} appearance-none cursor-pointer`}
              required
              defaultValue=""
            >
              <option value="" disabled className="text-gray-400">
                Select Category
              </option>
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat.toLowerCase().replace(/\s+/g, "-")}
                >
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm font-medium text-gray-600">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-semibold text-[#b76e79] cursor-pointer hover:text-[#9a5963] transition-colors tracking-wide">
              Verify OTP
            </span>
          </div>
          <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#b76e79]/10 focus-within:border-[#b76e79] transition-all duration-300 overflow-hidden">
            <span className="px-4 py-3.5 bg-gray-100/50 border-r border-gray-200 text-gray-500 font-medium select-none text-sm">
              +91
            </span>
            <input
              name="mobile"
              type="tel"
              placeholder="99999 00000"
              className="w-full px-4 py-3.5 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Whatsapp Number</label>
          <div className="flex rounded-xl border border-gray-200 bg-gray-50/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#b76e79]/10 focus-within:border-[#b76e79] transition-all duration-300 overflow-hidden">
            <span className="px-4 py-3.5 bg-gray-100/50 border-r border-gray-200 text-gray-500 font-medium select-none text-sm">
              +91
            </span>
            <input
              name="whatsapp"
              type="tel"
              placeholder="Optional"
              className="w-full px-4 py-3.5 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Row 4: Address & Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full">
          <label className={labelClass}>
            Address <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="address"
            placeholder="Complete business address"
            rows={5}
            className={`${inputClass} h-[138px] resize-none`}
            required
          ></textarea>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div>
            <label className={labelClass}>GST Number (Optional)</label>
            <input
              name="gstNumber"
              type="text"
              placeholder="e.g. 22AAAAA0000A1Z5"
              className={inputClass}
            />
          </div>
          <div className="relative">
            <label className={labelClass}>How did you find us?</label>
            <div className="relative">
              <select
                name="foundUs"
                className={`${inputClass} appearance-none cursor-pointer`}
                defaultValue=""
              >
                <option value="" disabled className="text-gray-400">
                  Select source
                </option>
                <option value="google">Google Search</option>
                <option value="social">Social Media</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <label className={labelClass}>
          Social Links <span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-48 shrink-0">
            <select
              name="socialPlatform"
              className={`${inputClass} appearance-none cursor-pointer`}
              defaultValue=""
            >
              <option value="" disabled>
                Platform
              </option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
          <div className="flex w-full gap-3">
            <input
              name="socialLink"
              type="url"
              placeholder="https://..."
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              className="shrink-0 bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-[#b76e79] disabled:opacity-70 text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-[#b76e79]/20 hover:shadow-[#b76e79]/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        >
          {status === "submitting"
            ? "Submitting Application..."
            : "Submit Application"}
        </button>
      </div>

      {status === "error" && message && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200">
          {message}
        </div>
      )}
    </form>
  );
}
