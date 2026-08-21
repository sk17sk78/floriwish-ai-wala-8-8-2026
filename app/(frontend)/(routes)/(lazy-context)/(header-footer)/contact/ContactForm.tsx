"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/action/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit message");
      }

      setStatus("success");
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === "success") {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-[#f0fbf5] text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          Thank you for reaching out to Floriwish. Our celebration concierge team has received your message and will respond shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="inline-flex items-center gap-2 bg-[#b76e79] hover:bg-[#a25d67] text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-7 sm:p-10 md:p-12 rounded-3xl shadow-sm border border-gray-100 relative">
      <div className="mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Send us a Message
        </h3>
        <p className="text-gray-500 text-sm sm:text-base">
          Fill out the form below and we will get back to you directly.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-3 bg-[#FAF7F2]/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400 text-sm"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 bg-[#FAF7F2]/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400 text-sm"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rahul@example.com"
            className="w-full px-4 py-3 bg-[#FAF7F2]/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400 text-sm"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Inquiry Topic <span className="text-rose-500">*</span>
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#FAF7F2]/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 text-sm cursor-pointer"
            required
          >
            <option value="" disabled>
              Select a subject
            </option>
            <option value="order_status">Order Status & Delivery Tracking</option>
            <option value="custom_order">Custom Cake / Floral Design</option>
            <option value="balloon_decor">Balloon & Event Decoration Booking</option>
            <option value="bulk_corporate">Bulk / Corporate Gifting</option>
            <option value="vendor_franchise">Vendor / Franchise Partnership</option>
            <option value="feedback">Feedback & Suggestions</option>
            <option value="other">Other Inquiry</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Your Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us how we can help you..."
            rows={4}
            className="w-full px-4 py-3 bg-[#FAF7F2]/60 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400 text-sm resize-none"
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-[#b76e79] hover:bg-[#a25d67] text-white font-bold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-3 rounded-xl border border-rose-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage || "Something went wrong. Please try again later."}</span>
          </div>
        )}
      </form>
    </div>
  );
}
