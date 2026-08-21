"use client";

import { useState } from "react";
import NextImage from "@/components/custom/NextImage";
import FranchiseEnquiryForm from "./FranchiseEnquiryForm";
import WhyChooseUsSection from "@/components/(frontend)/global/_Templates/WhyChooseUs/WhyChooseUsSection";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Coins,
  Gem,
  GraduationCap,
  Headphones,
  HelpCircle,
  PackageCheck,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  Users,
  Eye,
  Layers
} from "lucide-react";

const STORE_PHOTOS = [
  {
    src: "https://d22rebqllszdz8.cloudfront.net/sample-images/fdecf765809047d5.webp",
    alt: "Floriwish Retail Boutique Storefront",
    title: "Storefront Exterior",
    subtitle: "High-Visibility Luxury Retail Branding",
    tag: "Exterior View",
  },
  {
    src: "https://d22rebqllszdz8.cloudfront.net/sample-images/245e066513a04d06.webp",
    alt: "Floriwish Retail Showroom Interior",
    title: "Showroom Interior",
    subtitle: "Modern Walk-in Gifting Experience",
    tag: "Interior View",
  },
];

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Proven High ROI Model",
    desc: "Robust unit economics with healthy 35-45% gross margins and rapid break-even periods.",
  },
  {
    icon: Store,
    title: "Established Brand Value",
    desc: "Leverage customer trust, nationwide marketing campaigns, and instant brand recognition.",
  },
  {
    icon: GraduationCap,
    title: "Complete Staff Training",
    desc: "Comprehensive SOPs, master florist conditioning training, and inventory management support.",
  },
  {
    icon: Truck,
    title: "Direct Supply Chain",
    desc: "Centralized sourcing of farm-fresh flowers, artisan cakes, packaging, and exotic gifts.",
  },
];

const FRANCHISE_MODELS = [
  {
    title: "Cloud Studio / Dark Workshop",
    investment: "₹5 - ₹10 Lakhs",
    space: "250 - 450 sq.ft.",
    roi: "6 - 9 Months",
    desc: "Ideal for online order fulfillment, rapid deliveries, and lower overhead operating costs.",
    highlight: "Low Overhead",
  },
  {
    title: "Retail Flower & Cake Boutique",
    investment: "₹10 - ₹20 Lakhs",
    space: "400 - 800 sq.ft.",
    roi: "9 - 14 Months",
    desc: "High footfall storefront in prime commercial areas, combining walk-ins with online orders.",
    highlight: "Most Popular",
    popular: true,
  },
  {
    title: "Flagship Luxury Experience Hub",
    investment: "₹20 - ₹35 Lakhs",
    space: "800 - 1500 sq.ft.",
    roi: "12 - 18 Months",
    desc: "Premium experiential center featuring live florist bar, luxury hampers, and event styling.",
    highlight: "Maximum Revenue",
  },
];

const ONBOARDING_STEPS = [
  {
    step: "01",
    title: "Submit Enquiry",
    desc: "Fill the franchise form with your planned city and investment range.",
  },
  {
    step: "02",
    title: "Discovery & Location",
    desc: "Our business development team reviews location feasibility and territory exclusivity.",
  },
  {
    step: "03",
    title: "Agreement & Fit-out",
    desc: "Formal partnership sign-off followed by turnkey architectural & store design guidance.",
  },
  {
    step: "04",
    title: "Training & Grand Launch",
    desc: "Staff training on recipes, floral designs, POS systems, and marketing rollout.",
  },
];

const FAQS = [
  {
    q: "Who can apply for a Floriwish Franchise?",
    a: "Entrepreneurs, existing florist/bakery owners wanting to upgrade to a national brand, or business professionals with adequate investment capacity and passion for customer delight.",
  },
  {
    q: "Does Floriwish offer territory exclusivity?",
    a: "Yes. Every franchise partner is granted a defined geographical pin-code territory where online and app orders from that zone are directed exclusively to your outlet.",
  },
  {
    q: "How does the supply chain and procurement work?",
    a: "We have direct tie-ups with premium flower farms in Ooty/Bangalore, international bloom importers, and certified packaging vendors to ensure wholesale cost benefits for your store.",
  },
  {
    q: "What training and ongoing support is provided?",
    a: "We provide comprehensive 10-day staff training on floral conditioning, cake assembly, CRM order handling, POS billing, plus dedicated account managers for daily operational support.",
  },
  {
    q: "What is the expected timeline from signing to store opening?",
    a: "Typically 3 to 6 weeks, depending on store size, interior fit-outs, and staff onboarding.",
  },
];

export default function FranchisePage() {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  return (
    <div className="min-h-screen w-full bg-[#fdfcfb] text-zinc-800 selection:bg-[#ad2355] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[#ad2355]/10 border border-[#ad2355]/20 text-[#ad2355] text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3">
            Business Expansion Opportunities
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
            Own a <span className="text-[#ad2355]">Floriwish</span> Franchise
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-600 mt-2.5 leading-relaxed max-w-xl mx-auto">
            Become a part of India&apos;s fastest growing premium floral & gifting brand. Turn your entrepreneurial vision into a highly profitable local enterprise.
          </p>
        </div>

        {/* Hero Grid: Left Store Visual & Pillars + Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Real Store Showroom Showcase + Pillars + Stats */}
          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
            {/* Real Store Photo Showcase with View Switcher */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-zinc-200/80 shadow-xs flex flex-col gap-3">
              {/* Photo Header & View Switcher */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] sm:text-xs font-bold text-[#ad2355] uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Retail Store Concept</span>
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg">
                  {STORE_PHOTOS.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? "bg-white text-zinc-900 shadow-2xs"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {photo.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Active Image Display */}
              <div className="relative w-full h-[220px] min-[400px]:h-[250px] sm:h-[290px] md:h-[310px] rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200/60 bg-zinc-100">
                <NextImage
                  src={STORE_PHOTOS[activePhotoIdx].src}
                  alt={STORE_PHOTOS[activePhotoIdx].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-500 hover:scale-102 select-none"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                  <span className="text-xs font-bold block leading-tight">
                    {STORE_PHOTOS[activePhotoIdx].title}
                  </span>
                  <span className="text-[10.5px] text-zinc-300 font-normal">
                    {STORE_PHOTOS[activePhotoIdx].subtitle}
                  </span>
                </div>
              </div>

              {/* Dual Thumbnail Grid */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {STORE_PHOTOS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative h-14 sm:h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activePhotoIdx === idx
                        ? "border-[#ad2355] ring-2 ring-[#ad2355]/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <NextImage
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-1 left-1.5 text-[9.5px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Franchise with Floriwish (Pillars) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#ad2355] uppercase tracking-wider block mb-1">
                Franchise Advantages
              </span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight mb-4">
                Why Partner With Floriwish?
              </h2>

              <div className="space-y-3.5">
                {PILLARS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#ad2355]/10 border border-[#ad2355]/20 flex items-center justify-center text-[#ad2355] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-xs sm:text-[13px] font-bold text-zinc-900">
                          {item.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-500 font-normal leading-relaxed mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics Card */}
            <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-300">
                  National Brand Power
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-800">
                <div>
                  <span className="text-base sm:text-lg font-bold text-white block">35-45%</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Gross Margins</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white block">400+</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Cities Network</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white block">6-12 Mo</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Avg Break-even</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-zinc-200/80 shadow-xs">
              <div className="pb-4 mb-5 border-b border-zinc-100">
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#ad2355] uppercase tracking-wider block">
                  Confidential Inquiry
                </span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 tracking-tight mt-0.5">
                  Franchise Application Details
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Express your interest below. Our franchise expansion head will connect with you for a personalized briefing.
                </p>
              </div>

              <FranchiseEnquiryForm />
            </div>
          </div>
        </div>

        {/* --- STORE ARCHITECTURE & FIT-OUT SPOTLIGHT --- */}
        <section className="mt-14 sm:mt-20 pt-8 border-t border-zinc-200/70">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[11px] font-semibold text-[#ad2355] uppercase tracking-widest block mb-1">
              Turnkey Store Architecture
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              Aesthetic, High-Converting Store Design
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
              Every Floriwish store is engineered for maximum visual appeal, customer comfort, and streamlined order fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exterior Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs group">
              <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px]">
                <NextImage
                  src={STORE_PHOTOS[0].src}
                  alt={STORE_PHOTOS[0].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full">
                  Exterior Storefront
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1.5">
                  High-Impact Street Visibility
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  Illuminated 3D brand signage, modern matte black framing, and floor-to-ceiling glass display ensuring your store stands out in any premium high street or commercial zone.
                </p>
              </div>
            </div>

            {/* Interior Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs group">
              <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px]">
                <NextImage
                  src={STORE_PHOTOS[1].src}
                  alt={STORE_PHOTOS[1].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full">
                  Interior Showroom
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1.5">
                  Optimized Retail Experience
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  Temperature-controlled floral display stations, specialized bakery chillers, curated gift hamper shelving, and integrated digital order screens for fast walk-ins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- FRANCHISE MODELS SECTION --- */}
        <section className="mt-14 sm:mt-20 pt-8 border-t border-zinc-200/70">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[11px] font-semibold text-[#ad2355] uppercase tracking-widest block mb-1">
              Custom Formats
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              Flexible Franchise Formats
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
              Choose the right model that matches your city size, location, and investment budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {FRANCHISE_MODELS.map((model, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-all duration-200 ${
                  model.popular
                    ? "border-[#ad2355] ring-2 ring-[#ad2355]/15 shadow-sm"
                    : "border-zinc-200/80 shadow-2xs hover:border-zinc-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        model.popular
                          ? "bg-[#ad2355] text-white"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {model.highlight}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-1">
                    {model.title}
                  </h3>
                  <p className="text-xs text-zinc-500 font-normal leading-relaxed mb-5">
                    {model.desc}
                  </p>

                  <div className="space-y-2.5 border-t border-zinc-100 pt-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-normal">Initial Investment</span>
                      <span className="font-bold text-zinc-900">{model.investment}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-normal">Space Required</span>
                      <span className="font-semibold text-zinc-800">{model.space}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-normal">Target ROI Timeline</span>
                      <span className="font-semibold text-emerald-700">{model.roi}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- ONBOARDING STEPS SECTION --- */}
        <section className="mt-14 sm:mt-20 pt-8 border-t border-zinc-200/70">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="text-[11px] font-semibold text-[#ad2355] uppercase tracking-widest block mb-1">
              Simple Journey
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              How To Get Started
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
              4 straightforward steps from initial enquiry to your grand opening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {ONBOARDING_STEPS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-2xs relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-xl font-extrabold text-[#ad2355] block mb-2 font-mono">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="max-w-4xl mx-auto mt-14 sm:mt-20 pt-8 border-t border-zinc-200/70">
          <div className="text-center mb-6 sm:mb-10">
            <span className="text-[11px] font-semibold text-[#ad2355] uppercase tracking-widest block mb-1">
              Got Questions?
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              Franchise FAQ
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Everything you need to know about setting up a Floriwish outlet.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white hover:bg-zinc-50/60 rounded-2xl border border-zinc-200/80 p-4 sm:p-5 transition-all cursor-pointer shadow-2xs"
              >
                <summary className="font-semibold text-xs sm:text-sm md:text-base text-zinc-900 flex items-center justify-between list-none outline-none">
                  <span>{faq.q}</span>
                  <span className="transition-transform duration-200 group-open:rotate-180 text-zinc-400 group-hover:text-[#ad2355] ml-2 shrink-0">
                    <svg
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mt-2.5 pt-2.5 border-t border-zinc-100">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <WhyChooseUsSection />
      </div>
    </div>
  );
}
