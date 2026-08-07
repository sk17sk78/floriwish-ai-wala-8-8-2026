"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
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

    try {
      const res = await fetch("/api/action/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to submit");

      setStatus("success");
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === "success") {
    return (
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-500 mb-8">
          Thank you for reaching out. We have received your message and will get back to you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="bg-[#b76e79] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#a25a65] transition-all"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#b76e79] to-[#d89ba5] rounded-t-[2.5rem]"></div>

      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Send us a Message
      </h3>
      <p className="text-gray-500 mb-8 border-b border-gray-100 pb-6 text-sm md:text-base">
        Fill out the form below and we will get back to you directly.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 99999 00000"
              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400"
            required
          />
        </div>

        {/* Subject */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Subject <span className="text-rose-500">*</span>
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 appearance-none cursor-pointer"
            required
          >
            <option value="" disabled className="text-gray-400">
              Select a topic
            </option>
            <option value="order_status">Order Status / Tracking</option>
            <option value="bulk_order">Bulk / Corporate Order</option>
            <option value="vendor_issue">Vendor / Partner Inquiry</option>
            <option value="feedback">Feedback / Suggestion</option>
            <option value="other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-4 top-8 flex items-center pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your Message <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="How can we help you today?"
            rows={5}
            className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b76e79]/20 focus:border-[#b76e79] transition-all text-gray-900 placeholder-gray-400 resize-none"
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-[#b76e79] text-white font-bold text-lg py-4 rounded-xl hover:bg-[#a25a65] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </div>
        {status === "error" && (
          <p className="text-rose-500 text-sm text-center">
            Something went wrong. Please try again later.
          </p>
        )}
      </form>
    </div>
  );
}
