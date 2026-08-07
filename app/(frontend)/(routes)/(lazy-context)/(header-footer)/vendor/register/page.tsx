import { Metadata } from "next";
import NextImage from "@/components/custom/NextImage";
import { LocationProvider } from "@/hooks/useLocation/useLocation";
import VendorRegisterForm from "./VendorRegisterForm";
import WhyChooseUsSection from "@/components/(frontend)/global/_Templates/WhyChooseUs/WhyChooseUsSection";
import PopularSearchesSection from "@/components/(frontend)/global/_Templates/PopularSearches/PopularSearchesSection";

export const metadata: Metadata = {
  title: "Vendor Registration | Floriwish",
  description: "Register as a vendor on Floriwish and grow your business.",
};

export default function VendorRegisterPage() {
  return (
    <div className="min-h-screen w-full bg-[#FCFBFA] pb-12 text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      {/* --- HERO & FORM SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-10 items-center lg:items-start">
          {/* Left Content - Story & Stats */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start w-full relative z-10 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 bg-rose-50 text-[#b76e79] rounded-full text-sm font-semibold tracking-wide mb-6">
              Partner with Floriwish
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Grow your business <br />
              <span className="text-[#b76e79] font-serif italic pr-2">
                beautifully.
              </span>
            </h1>
            <p className="text-gray-500 mb-12 text-lg md:text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
              Join India&apos;s fastest-growing premium gifting platform. Get
              immediate access to millions of active buyers and elevate your
              brand presence.
            </p>

            {/* Stats - Minimalist Grid */}
            <div className="relative w-full max-w-[400px] h-[300px] hidden lg:block opacity-90 mt-auto">
              <NextImage
                src="/user_old.png"
                alt="Floriwish Vendor"
                fill
                sizes="400px"
                className="object-contain object-bottom"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBFA] via-transparent to-transparent pointer-events-none"></div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 w-full max-w-lg mb-12 mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#b76e79] mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">15M+</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Customers Reached
                </p>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#b76e79] mb-4">
                  <svg
                    className="w-6 h-6"
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
                <h3 className="text-2xl font-bold text-gray-900 mb-1">500+</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Cities & Towns Covered
                </p>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#b76e79] mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">200+</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Gifting Categories
                </p>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#b76e79] mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">2.5M+</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Orders Delivered
                </p>
              </div>
            </div>

            {/* Subtle decorative image */}
          </div>

          {/* Right Content - Form Card */}
          <div className="lg:w-1/2 w-full relative">
            {/* Background glow for premium feel */}
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-100 to-[#b76e79]/20 rounded-[2.5rem] blur-xl opacity-50"></div>

            <div className="relative bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Vendor Application
                </h2>
                <p className="text-gray-500">
                  Fill out the form below and our team will get back to you
                  within 24 hours.
                </p>
              </div>
              <LocationProvider>
                <VendorRegisterForm />
              </LocationProvider>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Common Questions
          </h2>
          <p className="text-gray-500">
            Everything you need to know about becoming a vendor.
          </p>
        </div>

        <div className="space-y-4">
          {[
            "Who can register as a vendor on Floriwish?",
            "Is there any registration fee?",
            "How do I get orders from Floriwish?",
            "How do I get paid for completed orders?",
            "Do I need to handle customer service?",
          ].map((question, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
            >
              <input
                type="checkbox"
                id={`faq-${idx}`}
                className="peer hidden"
              />
              <label
                htmlFor={`faq-${idx}`}
                className="group flex justify-between items-center font-medium text-lg cursor-pointer text-gray-800 py-5 px-6"
              >
                <span>{question}</span>
                <span className="transition-transform duration-300 peer-checked:rotate-180 text-gray-400 group-hover:text-[#b76e79]">
                  <svg
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </label>
              <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-in-out peer-checked:grid-rows-[1fr] peer-checked:opacity-100">
                <div className="overflow-hidden">
                  <p className="text-gray-500 pb-6 px-6 leading-relaxed text-sm">
                    Placeholder answer for {question}. This text will smoothly
                    slide down and fade in when the user clicks the accordion.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <WhyChooseUsSection />
      <PopularSearchesSection />
    </div>
  );
}
