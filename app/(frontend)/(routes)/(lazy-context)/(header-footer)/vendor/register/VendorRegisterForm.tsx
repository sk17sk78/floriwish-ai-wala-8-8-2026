"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "@/hooks/useLocation/useLocation";
import { MapPin, Search, ChevronDown, CheckCircle2, ArrowRight, Loader2, Building2, Store, Phone, Mail, User } from "lucide-react";
import Link from "next/link";

export default function VendorRegisterForm() {
  const { onSearch } = useLocation();
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
        throw new Error(data?.message || data?.error || "Submission failed. Please try again.");
      }

      form.reset();
      setCitySearch("");
      setSubmittedDetails({ fullName, businessName });
      setStatus("success");
      setMessage("Thanks! We received your vendor application.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please check your connection and try again.");
    }
  };

  // Render Clean Human Thank You Screen
  if (status === "success") {
    return (
      <div className="py-10 px-6 sm:px-8 bg-zinc-50 border border-zinc-200/80 rounded-2xl text-center space-y-5">
        <div className="w-12 h-12 bg-[#ad2355]/10 text-[#ad2355] border border-[#ad2355]/20 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Application Received!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Thank you for registering with Floriwish Partner Network. Our vendor onboarding team will verify your details and reach out to you within 24 hours.
          </p>
        </div>

        {submittedDetails && (
          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 max-w-sm mx-auto text-left space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#ad2355] block">
              Application Details
            </span>
            <p className="text-sm font-semibold text-zinc-900">
              {submittedDetails.fullName}
            </p>
            <p className="text-xs text-zinc-500">
              Business: <span className="text-zinc-800 font-medium">{submittedDetails.businessName}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setSubmittedDetails(null);
            }}
            className="px-4 py-2.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
          >
            Submit Another Application
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

  const categories = [
    "Florist & Fresh Flowers",
    "Bakery & Cakes",
    "Balloon & Party Decoration",
    "Handcrafted Gifts & Hampers",
    "Plants & Garden",
    "Other Speciality Gifting",
  ];

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Full Name <span className="text-zinc-400">*</span>
          </label>
          <input
            name="fullName"
            type="text"
            placeholder="e.g. Rajesh Kumar"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Email Address <span className="text-zinc-400">*</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="e.g. rajesh@example.com"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Row 2: Business Name */}
      <div>
        <label className={labelClass}>
          Business / Shop Name <span className="text-zinc-400">*</span>
        </label>
        <input
          name="businessName"
          type="text"
          placeholder="e.g. Blossom Florist & Decor"
          className={inputClass}
          required
        />
      </div>

      {/* Row 3: City & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative" ref={cityRef}>
          <label className={labelClass}>
            City <span className="text-zinc-400">*</span>
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
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>

          {showCityResults && filteredCities.length > 0 && (
            <div className="absolute z-50 w-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
              {filteredCities.map((city, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2.5 hover:bg-[#ad2355]/5 cursor-pointer flex items-center gap-2.5 transition-colors border-b border-zinc-100 last:border-none"
                  onClick={() => {
                    setCitySearch(city.name);
                    setShowCityResults(false);
                  }}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#ad2355] shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-zinc-800">
                    {city.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className={labelClass}>
            Primary Category <span className="text-zinc-400">*</span>
          </label>
          <div className="relative">
            <select
              name="interestedCategory"
              className={`${inputClass} appearance-none cursor-pointer pr-9`}
              required
              defaultValue=""
            >
              <option value="" disabled className="text-zinc-400">
                Select your business category
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
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Phone Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Mobile Number <span className="text-zinc-400">*</span>
          </label>
          <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 focus-within:bg-white focus-within:border-[#ad2355] focus-within:ring-2 focus-within:ring-[#ad2355]/15 transition-all overflow-hidden">
            <span className="px-3 py-2.5 sm:py-3 bg-zinc-100/70 border-r border-zinc-200 text-zinc-500 font-medium select-none text-xs sm:text-sm">
              +91
            </span>
            <input
              name="mobile"
              type="tel"
              placeholder="98765 43210"
              className="w-full px-3 py-2.5 sm:py-3 bg-transparent outline-none text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>WhatsApp Number (Optional)</label>
          <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 focus-within:bg-white focus-within:border-[#ad2355] focus-within:ring-2 focus-within:ring-[#ad2355]/15 transition-all overflow-hidden">
            <span className="px-3 py-2.5 sm:py-3 bg-zinc-100/70 border-r border-zinc-200 text-zinc-500 font-medium select-none text-xs sm:text-sm">
              +91
            </span>
            <input
              name="whatsapp"
              type="tel"
              placeholder="Same as mobile or alternate"
              className="w-full px-3 py-2.5 sm:py-3 bg-transparent outline-none text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Row 5: Business Address & GST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            Business Workshop / Store Address <span className="text-zinc-400">*</span>
          </label>
          <textarea
            name="address"
            placeholder="Shop no, street, locality, pin code"
            rows={3}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div>
            <label className={labelClass}>GSTIN (Optional)</label>
            <input
              name="gstNumber"
              type="text"
              placeholder="e.g. 22AAAAA0000A1Z5"
              className={inputClass}
            />
          </div>
          <div className="relative">
            <label className={labelClass}>How did you hear about us?</label>
            <div className="relative">
              <select
                name="foundUs"
                className={`${inputClass} appearance-none cursor-pointer pr-9`}
                defaultValue=""
              >
                <option value="" disabled className="text-zinc-400">
                  Select an option
                </option>
                <option value="google">Google Search</option>
                <option value="social">Social Media (Instagram / FB)</option>
                <option value="referral">Vendor Referral / Friend</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 6: Social / Portfolio Link (Optional) */}
      <div>
        <label className={labelClass}>
          Instagram / Website / Catalogue Link (Optional)
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative w-full sm:w-44 shrink-0">
            <select
              name="socialPlatform"
              className={`${inputClass} appearance-none cursor-pointer pr-8`}
              defaultValue="instagram"
            >
              <option value="instagram">Instagram</option>
              <option value="website">Website</option>
              <option value="facebook">Facebook</option>
              <option value="other">Other Link</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <input
            name="socialLink"
            type="url"
            placeholder="https://instagram.com/yourbrand"
            className={`${inputClass} flex-1`}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-[#ad2355] hover:bg-[#8e1944] disabled:opacity-70 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl shadow-md shadow-[#ad2355]/20 hover:shadow-lg hover:shadow-[#ad2355]/30 transition-all duration-200 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <span>Submit Partner Application</span>
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
