import { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Floriwish",
  description:
    "Have a question or need help with your order? Get in touch with the Floriwish support team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative w-full bg-gradient-to-br from-[#FAF7F2] via-white to-[#f4e8ea] pt-24 pb-20 md:pt-32 md:pb-28 px-4 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#b76e79] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-300 opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-5 py-2 bg-rose-50 text-[#b76e79] font-semibold text-sm rounded-full mb-6 border border-rose-100 shadow-sm uppercase tracking-wider">
            We&apos;re Here For You
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Get in <span className="text-[#b76e79]">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Whether you have a question about an order, want to partner with us,
            or just want to say hello, we&apos;re ready to listen.
          </p>
        </div>
      </section>

      {/* --- MAIN CONTACT SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative -mt-10 z-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Column: Contact Information Cards */}
          <div className="lg:w-5/12 w-full pt-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              We&apos;re here to help!
            </h2>
            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
              Reach out to us through any of the channels below. Our dedicated
              support team usually responds within a few hours.
            </p>

            <div className="space-y-6">
              {/* Address Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-5 group">
                <div className="bg-[#fff0f4] w-14 h-14 rounded-2xl flex items-center justify-center text-[#b76e79] shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Head Office
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    Dwarka Mor, Near Mohan Garden,
                    <br />
                    New Delhi, India - 110059
                  </p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-5 group">
                <div className="bg-[#f0fbf5] w-14 h-14 rounded-2xl flex items-center justify-center text-green-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Call Us
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    +91 8708388018
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Mon - Sun (9:00 AM to 9:00 PM)
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-5 group">
                <div className="bg-[#f6f0ff] w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Email Us
                  </h3>
                  <a
                    href="mailto:Info@Floriwish.com"
                    className="block text-gray-600 hover:text-[#b76e79] transition-colors leading-relaxed"
                  >
                    Info@Floriwish.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Contact Form */}
          <div className="lg:w-7/12 w-full">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* --- QUICK HELP CTA --- */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto bg-gray-50/80 rounded-[2.5rem] p-10 md:p-16 text-center border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Subtle background flair */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Need an immediate answer?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Check out our frequently asked questions. We might have already
              answered what you are looking for!
            </p>
            <Link
              href="/faq"
              className="inline-block bg-white text-[#b76e79] px-10 py-4 rounded-xl font-bold text-lg border border-gray-200 hover:border-[#b76e79] hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              Visit Help Center / FAQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
