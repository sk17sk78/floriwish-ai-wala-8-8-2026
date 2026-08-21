import { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_NUMBER,
} from "@/common/constants/companyDetails";

export const metadata: Metadata = {
  title: "Contact Us | Floriwish",
  description:
    "Have a question or need assistance with your order? Get in touch with the Floriwish celebration support team via phone, email, or WhatsApp.",
  alternates: {
    canonical: "https://floriwish.com/contact",
  },
  openGraph: {
    title: "Contact Us | Floriwish",
    description:
      "Reach out to Floriwish for order updates, custom floral & cake styling, or event bookings.",
    url: "https://floriwish.com/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      
      {/* ── 1. HERO SECTION (Clean White Canvas) ───────────────────────── */}
      <section className="relative w-full bg-white pt-16 pb-10 md:pt-24 md:pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-block px-4 py-1.5 bg-rose-50 text-[#b76e79] font-semibold text-xs rounded-full mb-6 border border-rose-100 uppercase tracking-wider">
            We&apos;re Here For You
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Get in <span className="text-[#b76e79]">Touch</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Whether you have a question about an order, want a bespoke celebration setup, or just want to connect, we are ready to assist.
          </p>

        </div>
      </section>

      {/* ── 2. MAIN CONTACT SECTION (2-COLUMN GRID) ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-12 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pt-6">
          
          {/* Left Column: Contact Cards & Location */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                How can we help today?
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Connect directly with our celebration concierge team through your preferred channel.
              </p>
            </div>

            {/* Direct Channel Cards */}
            <div className="space-y-4 pt-2">
              
              {/* WhatsApp Instant Support */}
              <a
                href={`https://wa.me/918708388018?text=Hi%20Floriwish,%20I%20have%20an%20inquiry`}
                target="_blank"
              rel="noopener noreferrer"
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#b76e79]/40 hover:shadow-md transition-all flex items-start gap-4 group block"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-base text-gray-900">WhatsApp Chat</h3>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Fastest</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">+91 8708388018</p>
                  <p className="text-xs text-gray-500 mt-0.5">Instant chat for live updates & custom orders</p>
                </div>
              </a>

              {/* Direct Phone Call */}
              <a
                href="tel:+918708388018"
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#b76e79]/40 hover:shadow-md transition-all flex items-start gap-4 group block"
              >
                <div className="w-12 h-12 rounded-xl bg-[#fff0f4] text-[#b76e79] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-gray-900">Call Support</h3>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">+91 8708388018</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#b76e79]" />
                    <span>Mon - Sun (9:00 AM – 9:00 PM)</span>
                  </div>
                </div>
              </a>

              {/* Email Support */}
              <a
                href={`mailto:${COMPANY_EMAIL}`}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#b76e79]/40 hover:shadow-md transition-all flex items-start gap-4 group block"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f6f0ff] text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-gray-900">Email Us</h3>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{COMPANY_EMAIL}</p>
                  <p className="text-xs text-gray-500 mt-0.5">For corporate inquiries, feedback & partnerships</p>
                </div>
              </a>

              {/* Head Office Address */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-gray-900">Head Office</h3>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                    {COMPANY_ADDRESS}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Delhi NCR, India</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Clean Modern Form */}
          <div className="lg:col-span-7 w-full">
            <ContactForm />
          </div>

        </div>
      </section>

      {/* ── 3. QUICK HELP STRIP (FAQ CALLOUT) ─────────────────────────── */}
      <section className="bg-white px-4 pb-20 pt-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#b76e79] flex items-center justify-center mx-auto mb-4 font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Need an Immediate Answer?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Check our Frequently Asked Questions about delivery slots, midnight timing, payment options, and cake customizations.
          </p>
          <div>
            <Link
              href="/faqs"
              className="inline-flex items-center gap-2 bg-[#b76e79] hover:bg-[#a25d67] text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span>Visit FAQs & Help Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
