import { Metadata } from "next";
import FranchiseEnquiryForm from "./FranchiseEnquiryForm";

export const metadata: Metadata = {
  title: "Franchise Opportunities | Floriwish",
  description:
    "Join the Floriwish family and start your own successful gifting business with our franchise program.",
};

export default function FranchisePage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      {/* --- HERO & FORM SECTION --- */}
      <section className="relative w-full bg-gradient-to-br from-[#FAF7F2] via-white to-[#f4e8ea] px-4 py-16 md:py-24 overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#b76e79] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#b76e79] opacity-5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Content */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start w-full text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 bg-rose-50 text-[#b76e79] font-medium text-sm rounded-full mb-6 border border-rose-100 shadow-sm">
              Partner with the Best
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-6 tracking-tight leading-tight">
              Own a <span className="text-[#b76e79]">Floriwish</span> Franchise
            </h1>
            <p className="text-gray-600 mb-12 text-lg md:text-lg max-w-lg leading-relaxed">
              Become a part of India&apos;s fastest-growing premium gifting
              network and turn your passion into a thriving business.
            </p>

            {/* Support Grid - Modern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-lg">
              {[
                {
                  title: "High ROI",
                  desc: "Proven business model with quick break-even periods.",
                  icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                },
                {
                  title: "Brand Power",
                  desc: "Leverage the trust and reach of the Floriwish brand.",
                  icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                },
                {
                  title: "Training",
                  desc: "Comprehensive training on operations and floral design.",
                  icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253",
                },
                {
                  title: "24/7 Support",
                  desc: "Our dedicated team is here to help you scale seamlessly.",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/70 backdrop-blur-sm p-6 sm:p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 sm:w-10 sm:h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#b76e79] mb-4">
                    <svg
                      className="w-6 h-6 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-lg sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-base sm:text-sm text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Elevated Form */}
          <div className="lg:w-1/2 w-full max-w-xl mx-auto lg:mx-0">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#b76e79] to-[#d89ba5] rounded-t-3xl"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                Start Your Journey
              </h2>
              <p className="text-gray-500 mb-8 text-sm">
                Fill out the form below and our team will get back to you
                shortly.
              </p>
              <FranchiseEnquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY FRANCHISE SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
            Why Partner with Us?
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Floriwish is more than just a gifting brand; we are a community
            dedicated to spreading joy. Join us in our journey and build a
            highly profitable, sustainable business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Global Reach",
              desc: "Benefit from our strong online presence and extensive customer base across India and beyond.",
              icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.659M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              title: "Seamless Supply Chain",
              desc: "Access our established network of premium vendors and logistics partners for flawless daily operations.",
              icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
            },
            {
              title: "Marketing Support",
              desc: "Get end-to-end marketing, social media assets, and branding support to drive local demand.",
              icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-[#b76e79]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="mx-4 mb-16">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#b76e79] to-[#a25a65] rounded-3xl px-6 py-20 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative background elements inside CTA */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Grow with Floriwish?
            </h2>
            <p className="text-rose-100 mb-10 text-lg md:text-xl font-normal">
              Join hands with India&apos;s most loved gifting brand and start
              your entrepreneurial journey today.
            </p>
            <button className="bg-white text-[#b76e79] px-10 py-4 rounded-xl font-bold text-lg hover:bg-rose-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              Apply for Franchise
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
