import React from "react";

const whyChooseUsData = [
  {
    title: "Trusted Business",
    iconWrapper:
      "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
    hoverBorder: "hover:border-emerald-100",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    description: "100% Secure Payments with Bank-Grade Encryption",
    isLink: false,
    link: "#",
  },
  {
    title: "Swift Gift Delivery",
    iconWrapper:
      "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white",
    hoverBorder: "hover:border-rose-100",
    icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    description: "Delivering Smiles & Gifts Across India",
    isLink: false,
    link: "#",
  },
  {
    title: "Dedicated Support",
    iconWrapper:
      "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white",
    hoverBorder: "hover:border-indigo-100",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    description: "Get Expert Assistance — Talk to Us Now →",
    isLink: true,
    link: "/contact",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative">
      {/* Optional: Subtle background glow for the section */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

      <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto flex flex-col items-center">
        <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
          Our Promise
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold font-poppins text-gray-900 mb-4 tracking-tight">
          Why Choose Us
        </h2>
        <p className="text-gray-500 text-sm md:text-base md:max-w-md mx-auto leading-relaxed">
          Experience premium service with complete peace of mind. We provide the
          tools you need to succeed.
        </p>
      </div>

      {/* Optimized grid for tablet: Use 3 columns from sm (640px) to accommodate iPads. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
        {whyChooseUsData.map((feature, idx) => (
          <div
            key={idx}
            className={`group bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center ${feature.hoverBorder}`}
          >
            <div
              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${feature.iconWrapper}`}
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={feature.icon}
                />
              </svg>
            </div>

            <h3 className="font-semibold text-base md:text-xl text-gray-900 mb-2 md:mb-3 font-poppins line-clamp-1">
              {feature.title}
            </h3>

            {feature.isLink ? (
              <a
                className="font-poppins text-[13px] md:text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors line-clamp-2 md:line-clamp-none"
                href={feature.link}
              >
                {feature.description}
              </a>
            ) : (
              <p className="font-poppins text-[13px] md:text-sm text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
                {feature.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
