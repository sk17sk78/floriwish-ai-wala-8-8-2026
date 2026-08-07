import { Metadata } from "next";
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Floriwish",
  description:
    "Learn more about Floriwish, India's most loved premium gifting and event decoration platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-b from-[#FAF7F2] to-white pt-24 pb-20 md:pt-32 md:pb-28 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Modern Pill Badge */}
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#b76e79]/10 text-[#b76e79] text-sm font-semibold mb-6 border border-[#b76e79]/20 tracking-wide uppercase">
            Welcome to Floriwish
          </span>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Spreading Joy, <br className="hidden md:block" />
            <span className="text-[#b76e79]">One Gift at a Time.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            At Floriwish, we believe that every emotion deserves a beautiful
            expression. We are more than just a gifting platform; we are your
            partners in celebrating life&apos;s most precious moments.
          </p>
        </div>

        {/* Modernized Background Gradients (Glassmorphism feel) */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b76e79] opacity-[0.03] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#b76e79] opacity-[0.04] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
      </section>

      {/* --- OUR STORY & STATS SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          {/* Left: Text Content */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Our Story
            </h2>
            <div className="space-y-6 text-lg text-gray-500 leading-relaxed">
              <p>
                What started as a small local boutique has blossomed into
                India&apos;s fastest-growing gifting network. We realized that
                in today&apos;s fast-paced world, people were struggling to find
                reliable, high-quality ways to show their loved ones they cared.
              </p>
              <p>
                Floriwish was born from a simple idea: to make premium gifting
                accessible, reliable, and deeply personal. Whether it&apos;s a
                midnight cake delivery for a surprise birthday, an elegant
                floral setup for an anniversary, or a simple &quot;thinking of
                you&quot; bouquet, we handle your emotions with the utmost care.
              </p>
            </div>

            {/* Redesigned Quick Stats */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#b76e79]/10 transition-colors hover:border-[#b76e79]/30">
                <h4 className="text-4xl font-extrabold text-[#b76e79] mb-2">
                  15M+
                </h4>
                <p className="font-medium text-gray-700">Smiles Delivered</p>
              </div>
              <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#b76e79]/10 transition-colors hover:border-[#b76e79]/30">
                <h4 className="text-4xl font-extrabold text-[#b76e79] mb-2">
                  500+
                </h4>
                <p className="font-medium text-gray-700">Cities Covered</p>
              </div>
            </div>
          </div>
          {/* Right: Image Collage / Hero Image with Offset Accent */}
          <div className="lg:w-1/2 w-full relative mt-10 lg:mt-0">
            {/* The decorative offset shadow */}
            <div className="absolute inset-0 bg-[#b76e79]/10 translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6 rounded-3xl -z-10 transition-transform hover:translate-x-5 hover:translate-y-5"></div>

            {/* Soft gradient background to frame the image nicely */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-white/60 bg-gradient-to-b from-white to-[#FCFBFA]">
              <NextImage
                src="/user_old.png"
                alt="The Floriwish Experience"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                // Switched to object-contain, anchored to bottom, and added padding so it doesn't touch the edges
                className="object-contain object-bottom p-8 md:p-12 transition-transform duration-700 hover:scale-105"
              />

              {/* The vendor-style gradient fade at the bottom to blend the image seamlessly */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FCFBFA] via-transparent to-transparent pointer-events-none opacity-90"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CORE VALUES SECTION --- */}
      <section className="bg-gradient-to-b from-white to-[#FAF7F2]/50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[#b76e79] font-semibold tracking-wider uppercase text-sm mb-3 block">
              Our Principles
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              The Floriwish Promise
            </h2>
            <p className="text-lg text-gray-500">
              The principles that guide everything we do, from choosing our
              vendors to delivering your packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="group bg-white p-10 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#b76e79]/20">
              <div className="bg-[#fff0f4] w-16 h-16 rounded-2xl flex items-center justify-center text-[#b76e79] mb-8 transition-transform group-hover:scale-110">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Customer Delight
              </h3>
              <p className="text-gray-500 leading-relaxed">
                We don&apos;t just deliver products; we deliver experiences.
                Your satisfaction and the joy of your loved ones are our
                ultimate benchmarks for success.
              </p>
            </div>

            {/* Value 2 */}
            <div className="group bg-white p-10 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#b76e79]/20">
              <div className="bg-[#f0fbf5] w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 transition-transform group-hover:scale-110">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Uncompromised Quality
              </h3>
              <p className="text-gray-500 leading-relaxed">
                From hand-picked flowers to freshly baked cakes, we partner with
                only the finest local artisans and vendors to ensure top-tier
                quality in every order.
              </p>
            </div>

            {/* Value 3 */}
            <div className="group bg-white p-10 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#b76e79]/20">
              <div className="bg-[#f6f0ff] w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-500 mb-8 transition-transform group-hover:scale-110">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Absolute Punctuality
              </h3>
              <p className="text-gray-500 leading-relaxed">
                We know that timing is everything when it comes to surprises.
                Our robust logistics network ensures your gifts arrive exactly
                when they are meant to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      {/* --- CTA SECTION --- */}
      <section className="relative py-24 overflow-hidden bg-[#b76e79]">
        {/* Subtle overlay gradient to give depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Be a Part of Our Journey
          </h2>
          <p className="text-white/90 mb-10 text-xl font-normal max-w-2xl mx-auto leading-relaxed">
            Whether you want to spread smiles as a business partner or grow with
            us as a franchisee, there is a place for you in the Floriwish
            family.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link
              href="/vendor-registration"
              className="bg-white text-[#b76e79] px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Become a Vendor
            </Link>
            <Link
              href="/franchise"
              className="bg-transparent text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/80 hover:bg-white/10 hover:border-white transition-all duration-300"
            >
              Explore Franchise
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
