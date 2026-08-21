import { Metadata } from "next";
import NextImage from "@/components/custom/NextImage";
import { LocationProvider } from "@/hooks/useLocation/useLocation";
import VendorRegisterForm from "./VendorRegisterForm";
import WhyChooseUsSection from "@/components/(frontend)/global/_Templates/WhyChooseUs/WhyChooseUsSection";
import {
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  PhoneCall,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  Users
} from "lucide-react";

export const metadata: Metadata = {
  title: "Partner With Us / Vendor Registration | Floriwish",
  description: "Join the Floriwish Partner Network. Grow your florist, bakery, or decoration business with verified customer orders across 400+ cities in India.",
};

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Instant Daily Order Volume",
    description: "Receive daily orders from verified customers in your city with zero upfront marketing spend.",
  },
  {
    icon: CreditCard,
    title: "Weekly Direct Payouts",
    description: "Transparent, automated weekly settlements directly deposited into your bank account.",
  },
  {
    icon: Store,
    title: "100% Free Onboarding",
    description: "No setup fees, no monthly listing charges. You only fulfill orders and grow your revenue.",
  },
  {
    icon: PhoneCall,
    title: "Dedicated Partner Support",
    description: "Personal account manager assistance and instant WhatsApp alerts for every new order.",
  },
];

const FAQS = [
  {
    q: "Who can register as a vendor on Floriwish?",
    a: "Local florists, artisan bakers, balloon & event decorators, and handcrafted gift creators with an active workshop or retail store across India are welcome to join our network.",
  },
  {
    q: "Is there any registration or onboarding fee?",
    a: "No. Partner registration on Floriwish is 100% free. We do not charge any upfront joining fees or recurring monthly subscription costs.",
  },
  {
    q: "How do I receive and dispatch orders?",
    a: "When a customer places an order in your serviceable area, you receive an instant alert on WhatsApp and email with complete product specifications, delivery slot, and recipient address.",
  },
  {
    q: "How and when are payments settled?",
    a: "All completed orders are settled on a scheduled weekly cycle directly via NEFT/IMPS to your registered bank account, along with itemized statement reports.",
  },
  {
    q: "What documents are required to get started?",
    a: "You just need basic business identification (Aadhaar/PAN), business address proof, and active bank account details for payouts. GST registration is optional for qualifying small vendors.",
  },
];

export default function VendorRegisterPage() {
  return (
    <div className="min-h-screen w-full bg-[#fdfcfb] text-zinc-800 selection:bg-[#ad2355] selection:text-white">
      {/* Top Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[#ad2355]/10 border border-[#ad2355]/20 text-[#ad2355] text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3">
            Floriwish Partner Network
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
            Grow Your Gifting Business <br className="hidden sm:inline" />
            <span className="text-[#ad2355]">With Floriwish</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-600 mt-2.5 leading-relaxed max-w-xl mx-auto">
            Join India&apos;s fastest growing floral & gifting platform. Connect with thousands of active buyers and expand your workshop effortlessly.
          </p>
        </div>

        {/* Main Grid: Left Partner Visual & Benefits / Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Left Column: Lady Visual Showcase + Benefits + Stats */}
          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
            {/* Florist Lady Image Card - Responsive across Mobile & Desktop */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-rose-50 via-zinc-50 to-amber-50/40 border border-zinc-200/80 shadow-xs flex flex-col items-center">
              {/* Partner Story Tag */}
              <div className="w-full p-4 sm:p-5 flex items-center justify-between z-10">
                <span className="text-[11px] sm:text-xs font-bold text-[#ad2355] uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Partner Community</span>
                </span>
                <span className="text-[10px] sm:text-[11px] bg-white/90 border border-zinc-200/80 rounded-full px-2.5 py-0.5 font-medium text-zinc-600 shadow-2xs">
                  Pan-India Network
                </span>
              </div>

              {/* Lady Photo Container */}
              <div className="relative w-full h-[220px] min-[400px]:h-[260px] sm:h-[300px] md:h-[330px] lg:h-[300px]">
                <NextImage
                  src="/user_old.png"
                  alt="Floriwish Florist Partner"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-contain object-bottom select-none"
                  priority
                />
                {/* Soft gradient bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-50 via-zinc-50/60 to-transparent pointer-events-none" />
              </div>

              {/* Floating Quote Badge */}
              <div className="w-full p-4 pt-1 z-10">
                <div className="bg-white/95 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-zinc-200/90 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-zinc-700 italic leading-relaxed">
                    &ldquo;Partnering with Floriwish doubled our daily orders within the first month. Payouts are always on time!&rdquo;
                  </p>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-900 mt-1 block">
                    — Sunita Verma, Master Florist (Pune)
                  </span>
                </div>
              </div>
            </div>

            {/* Why Partner With Us (Benefits) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-zinc-200/80 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ad2355]" />
                <span>Partner Benefits</span>
              </h2>

              <div className="space-y-3.5">
                {BENEFITS.map((item, idx) => {
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
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-800">
                <div>
                  <span className="text-base sm:text-lg font-bold text-white block">400+</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Cities Covered</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white block">100%</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Timely Payouts</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-bold text-white block">24/7</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Partner Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-zinc-200/80 shadow-xs">
              <div className="pb-4 mb-5 border-b border-zinc-100">
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#ad2355] uppercase tracking-wider block">
                  Quick Onboarding
                </span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 tracking-tight mt-0.5">
                  Vendor Application Details
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Fill in your basic business details below. Our onboarding specialist will reach out within 24 hours.
                </p>
              </div>

              <LocationProvider>
                <VendorRegisterForm />
              </LocationProvider>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mt-14 sm:mt-20 pt-8 border-t border-zinc-200/70">
          <div className="text-center mb-6 sm:mb-10">
            <span className="text-[11px] font-semibold text-[#ad2355] uppercase tracking-widest block mb-1">
              Have Questions?
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Everything you need to know about partnering with Floriwish.
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
