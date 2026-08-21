import { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Phone,
  ArrowRight,
  Truck,
  CreditCard,
  Flower2,
  Store
} from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) | Floriwish",
  description:
    "Find answers to frequently asked questions about flower delivery, midnight timings, cake orders, custom decorations, and payments on Floriwish.",
  alternates: {
    canonical: "https://floriwish.com/faqs",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQs) | Floriwish",
    description:
      "Quick answers to all your questions about orders, same-day delivery, midnight surprises, and party decorations on Floriwish.",
    url: "https://floriwish.com/faqs",
  },
};

const FAQ_SECTIONS = [
  {
    category: "Orders & Delivery",
    icon: Truck,
    questions: [
      {
        q: "Do you offer same-day and midnight delivery?",
        a: "Yes! We offer guaranteed same-day delivery (within 2-3 hours) and exact 11:59 PM midnight delivery across 150+ covered cities in India. You can choose your exact preferred delivery slot during checkout.",
      },
      {
        q: "How can I track my order in real-time?",
        a: "Once your order is prepared and dispatched with our delivery rider, you will receive real-time tracking updates via WhatsApp and SMS. You can also track your status anytime under 'My Orders' on Floriwish.",
      },
      {
        q: "Can I customize the delivery time or address after booking?",
        a: "Yes, you can request changes up to 3 hours before your scheduled delivery slot. Simply contact our celebration support team via WhatsApp or call with your Order ID.",
      },
    ],
  },
  {
    category: "Freshness & Products",
    icon: Flower2,
    questions: [
      {
        q: "Are the flowers delivered fresh?",
        a: "100% yes. We do not store flowers in deep-freeze warehouses. Our local florists handpick fresh blooms at 5:00 AM daily from growers and arrange them just before your delivery time.",
      },
      {
        q: "Are the cakes freshly baked or pre-made?",
        a: "Every cake on Floriwish is baked fresh in licensed local artisan bakeries just 3 hours prior to dispatch. We never use pre-made frozen cake bases.",
      },
      {
        q: "Can I get a handwritten message card?",
        a: "Yes! Every order includes a complimentary greeting card written by hand with real pen and ink on textured luxury cardstock.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    icon: CreditCard,
    questions: [
      {
        q: "What payment options do you support?",
        a: "We support all secure Indian payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and popular wallets. All transactions are 256-bit encrypted.",
      },
      {
        q: "What is your replacement or refund policy?",
        a: "If an item arrives damaged or does not meet our high-quality standards, we provide an immediate free replacement or a full refund upon photo verification on WhatsApp.",
      },
      {
        q: "Are there any hidden delivery charges?",
        a: "Standard delivery during normal daytime slots is completely free! Nominal convenience charges apply only for specialized fixed-time or midnight delivery slots.",
      },
    ],
  },
  {
    category: "Decorations & Partnerships",
    icon: Store,
    questions: [
      {
        q: "How does balloon and event decoration work?",
        a: "Our professional decorator artists arrive directly at your home or venue with full styling kits to transform your space as per your chosen theme.",
      },
      {
        q: "How can local florists or bakers partner with Floriwish?",
        a: "We actively empower local boutique owners! Visit our 'Become a Vendor' or 'Explore Franchise' page to submit your details and join our nationwide artisan network.",
      },
    ],
  },
];

export default function FAQPage() {
  // Generate JSON-LD Structured Data for Google Rich Snippets
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_SECTIONS.flatMap((sec) =>
      sec.questions.map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a,
        },
      }))
    ),
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      {/* JSON-LD Schema for Google Search Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* ── 1. CLEAN HERO (White Canvas with Floriwish Rose Pill) ──────── */}
      <section className="relative w-full bg-white pt-16 pb-10 md:pt-24 md:pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-block px-4 py-1.5 bg-rose-50 text-[#b76e79] font-semibold text-xs rounded-full mb-6 border border-rose-100 uppercase tracking-wider">
            Help Center & FAQs
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Frequently Asked <span className="text-[#b76e79]">Questions</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Find quick, clear answers regarding deliveries, midnight surprises, fresh bakes, custom decorations, and payments.
          </p>

        </div>
      </section>

      {/* ── 2. FAQ SECTIONS (Clean White Symmetrical Cards) ────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-8 md:py-14 border-t border-gray-100">
        <div className="space-y-12">
          {FAQ_SECTIONS.map((sec, secIdx) => {
            const SectionIcon = sec.icon;

            return (
              <div key={secIdx} className="space-y-4">
                
                {/* Category Header with Clean Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#b76e79] flex items-center justify-center shrink-0">
                    <SectionIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {sec.category}
                  </h2>
                </div>

                {/* Questions Container */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {sec.questions.map((item, qIdx) => {
                    const uniqueId = `faq-${secIdx}-${qIdx}`;

                    return (
                      <div
                        key={qIdx}
                        className="group hover:bg-[#FAF7F2]/40 transition-colors duration-150"
                      >
                        <input
                          type="checkbox"
                          id={uniqueId}
                          className="peer hidden"
                        />

                        <label
                          htmlFor={uniqueId}
                          className="flex justify-between items-center font-semibold text-sm sm:text-base text-gray-900 px-5 sm:px-6 py-4 sm:py-5 cursor-pointer select-none gap-4"
                        >
                          <span className="group-hover:text-[#b76e79] transition-colors duration-150">
                            {item.q}
                          </span>
                          <span className="shrink-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 peer-checked:rotate-180 peer-checked:bg-[#b76e79] peer-checked:text-white peer-checked:border-[#b76e79] transition-all duration-200">
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </label>

                        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-200 ease-in-out peer-checked:grid-rows-[1fr] peer-checked:opacity-100 px-5 sm:px-6">
                          <div className="overflow-hidden">
                            <p className="text-gray-600 pb-5 text-sm sm:text-[15px] leading-relaxed pr-2 sm:pr-8">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. CLEAN STILL NEED HELP CTA (Matching About & Contact) ───── */}
      <section className="px-4 pb-20 pt-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm mt-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#b76e79] flex items-center justify-center mx-auto mb-4 font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Still have questions?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Our dedicated celebration concierge team is reachable 7 days a week for order updates, custom requests, and delivery assistance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#b76e79] hover:bg-[#a25d67] text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/918708388018?text=Hi%20Floriwish,%20I%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-300 px-7 py-3 rounded-xl font-semibold text-sm shadow-2xs hover:shadow-xs transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
