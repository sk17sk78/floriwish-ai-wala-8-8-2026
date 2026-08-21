import { Metadata } from "next";
import Link from "next/link";
import NextImage from "@/components/custom/NextImage";
import {
  Clock,
  MapPin,
  Heart,
  Flower2,
  Cake,
  PartyPopper,
  Camera,
  PenLine,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Floriwish",
  description:
    "Learn more about Floriwish, India's most loved gifting, flower delivery, and celebration decoration platform.",
  alternates: {
    canonical: "https://floriwish.com/about",
  },
  openGraph: {
    title: "About Us | Floriwish - Handcrafted Celebrations",
    description:
      "From morning-fresh flowers to midnight cake deliveries — discover how Floriwish crafts unforgettable celebrations across India.",
    url: "https://floriwish.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      
      {/* ── 1. CLEAN HERO (Matches Contact Page) ───────────────────────── */}
      <section className="relative w-full bg-white pt-16 pb-10 md:pt-24 md:pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-block px-4 py-1.5 bg-rose-50 text-[#b76e79] font-semibold text-xs rounded-full mb-6 border border-rose-100 uppercase tracking-wider">
            The Floriwish Story
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Crafting Celebrations, <br className="hidden sm:inline" />
            <span className="text-[#b76e79]">Delivering Love.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We started Floriwish with one heartfelt mission: to ensure distance never comes between you and your special moments.
          </p>

        </div>
      </section>

      {/* ── 2. OUR STORY & BOUTIQUE IMAGE (2-Column Grid) ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-14 border-t border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Clean Story */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold text-[#b76e79] uppercase tracking-wider block">
              Who We Are
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
              From a local flower boutique to a nationwide celebration network.
            </h2>

            <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
              <p>
                We realized that typical online gifting had become impersonal — flowers sitting in cold-storage warehouses for days and mass-produced cakes arriving late.
              </p>
              <p>
                We built Floriwish differently. We partnered directly with passionate neighborhood florists, master bakers, and balloon styling artists across 150+ cities.
              </p>
              <p className="font-semibold text-gray-900">
                Every bouquet is hand-tied that morning, every cake is baked fresh to order, and every delivery carries your personal emotion.
              </p>
            </div>

            {/* Clean 3-Item Stats Cards */}
            <div className="pt-2 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#b76e79]">150+</p>
                <p className="text-xs text-gray-500 mt-0.5">Cities Covered</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#b76e79]">11:59</p>
                <p className="text-xs text-gray-500 mt-0.5">Midnight Surprises</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#b76e79]">50K+</p>
                <p className="text-xs text-gray-500 mt-0.5">Smiles Delivered</p>
              </div>
            </div>
          </div>

          {/* Right: Boutique Image */}
          <div className="lg:col-span-5 w-full">
            <div className="relative h-[320px] sm:h-[380px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <NextImage
                src="https://d22rebqllszdz8.cloudfront.net/sample-images/fdecf765809047d5.webp"
                alt="Floriwish Boutique Storefront"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. THREE CORE PROMISES (Matching Card Design) ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#b76e79] uppercase tracking-wider block mb-2">
            Our Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            The Floriwish Standard
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#b76e79]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#fff0f4] text-[#b76e79] flex items-center justify-center mb-4 font-bold">
              <Flower2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Sunrise Fresh Blooms
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Hand-picked daily at 5:00 AM from growers. No old, cold-stored stems.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#b76e79]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#f0fbf5] text-green-600 flex items-center justify-center mb-4 font-bold">
              <Cake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Oven-Fresh Bakes
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Baked just 3 hours prior to your delivery slot. Zero pre-made frozen bases.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#b76e79]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#f6f0ff] text-purple-600 flex items-center justify-center mb-4 font-bold">
              <PartyPopper className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Artisan Event Styling
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Skilled decorator artists arrive on location to style your special moments.
            </p>
          </div>

        </div>
      </section>

      {/* ── 4. CLEAN TRUST STRIP (3 SIMPLE HIGHLIGHTS) ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-14 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#b76e79] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">WhatsApp Preview</h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Real photos of your bouquet or cake shared before dispatch upon request.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#b76e79] flex items-center justify-center shrink-0">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Handwritten Note</h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Your greeting penned with real ink on premium cardstock, not a printed receipt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#b76e79] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Human Support</h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Direct phone and WhatsApp assistance from our celebration coordinators.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. STREAMLINED CLEAN CTA ──────────────────────────────────── */}
      <section className="px-4 pb-20 pt-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm mt-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Ready to Celebrate with Floriwish?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Browse our hand-tied fresh bouquets, delicious cakes, or connect with our team today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/flower"
              className="inline-flex items-center gap-2 bg-[#b76e79] hover:bg-[#a25d67] text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span>Explore Flowers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center bg-white text-gray-700 hover:text-[#b76e79] border border-gray-200 px-7 py-3 rounded-xl font-semibold text-sm hover:border-[#b76e79]/40 transition-all duration-200"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
