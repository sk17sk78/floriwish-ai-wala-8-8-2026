import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Floriwish",
  description:
    "Find answers to frequently asked questions about orders, delivery, payments, and partnering with Floriwish.",
};

// Extracted data array to keep JSX clean and easy to update
const faqData = [
  {
    category: "Orders & Delivery",
    questions: [
      {
        q: "Do you offer same-day or midnight delivery?",
        a: "Yes! We offer both same-day and midnight delivery options across our 500+ covered cities. You can select your preferred delivery time slot during the checkout process.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order is dispatched, you will receive a tracking link via SMS and email. You can also log into your Floriwish account and view real-time updates under the 'My Orders' section.",
      },
      {
        q: "Can I change my delivery address or date after placing an order?",
        a: "Changes can be made up to 24 hours before the scheduled delivery time. Please contact our support team immediately with your Order ID to request any modifications.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major Credit/Debit cards, Net Banking, UPI (Google Pay, PhonePe, Paytm), and popular mobile wallets. All transactions are 100% secure and encrypted.",
      },
      {
        q: "What is your cancellation and refund policy?",
        a: "Orders can be cancelled for a full refund if requested at least 24 hours prior to the delivery date. Custom or personalized items cannot be cancelled once processing has begun. Refunds typically reflect in your account within 5-7 business days.",
      },
      {
        q: "Is there any hidden delivery charge?",
        a: "Standard delivery is completely free! However, special requests like Midnight Delivery, Fixed-Time Delivery, or Early Morning Delivery may incur a nominal convenience fee, which is clearly displayed at checkout.",
      },
    ],
  },
  {
    category: "Products & Customization",
    questions: [
      {
        q: "Can I customize a gift or flower arrangement?",
        a: "Absolutely! Many of our products offer customization options like adding personalized messages, names on cakes, or choosing specific flower combinations. Look for the 'Customize' tag on the product page.",
      },
      {
        q: "Are the flowers delivered fresh?",
        a: "Yes, quality is our top priority. Our flowers are sourced directly from premium growers and are arranged by expert local florists just before delivery to ensure maximum freshness and longevity.",
      },
    ],
  },
  {
    category: "Vendor & Franchise",
    questions: [
      {
        q: "How do I become a vendor on Floriwish?",
        a: "We are always looking for quality partners! Simply navigate to our 'Become a Vendor' page, fill out the application form with your business details, and our onboarding team will get in touch with you.",
      },
      {
        q: "Who can apply for a Floriwish Franchise?",
        a: "Anyone with an entrepreneurial spirit, a passion for customer service, and the required initial investment capacity can apply. Visit our Franchise page to submit an enquiry and view our requirements.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-poppins selection:bg-[#b76e79] selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative w-full bg-gradient-to-br from-[#FAF7F2] via-white to-[#f4e8ea] pt-24 pb-20 md:pt-32 md:pb-28 px-4 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#b76e79] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-300 opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-block px-5 py-2 bg-rose-50 text-[#b76e79] font-semibold text-sm rounded-full mb-6 border border-rose-100 shadow-sm uppercase tracking-wider">
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            How can we <span className="text-[#b76e79]">help you?</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Browse through our frequently asked questions below to find quick
            answers regarding your orders, payments, and our services.
          </p>
        </div>
      </section>

      {/* --- FAQ ACCORDION SECTION --- */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="space-y-16">
          {faqData.map((section, catIdx) => (
            <div key={catIdx} className="relative">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-gray-200 flex-1 hidden sm:block"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight text-center">
                  {section.category}
                </h2>
                <div className="h-px bg-gray-200 flex-1 hidden sm:block"></div>
              </div>

              {/* Questions Container */}
              <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
                {section.questions.map((item, qIdx) => {
                  // Create a unique ID for the pure CSS checkbox hack
                  const uniqueId = `faq-${catIdx}-${qIdx}`;

                  return (
                    <div
                      key={qIdx}
                      className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-300`}
                    >
                      <input
                        type="checkbox"
                        id={uniqueId}
                        className="peer hidden"
                      />

                      <label
                        htmlFor={uniqueId}
                        className="group flex justify-between items-center font-semibold text-base md:text-lg cursor-pointer text-gray-900 px-6 md:px-8 py-5 md:py-6 select-none"
                      >
                        <span className="pr-6 group-hover:text-[#b76e79] transition-colors duration-200">
                          {item.q}
                        </span>
                        <span className="shrink-0 transition-all duration-300 peer-checked:rotate-180 peer-checked:bg-[#b76e79] peer-checked:text-white text-gray-400 group-hover:bg-rose-50 group-hover:text-[#b76e79] bg-gray-50/80 border border-gray-100 rounded-full p-2 shadow-sm">
                          <svg
                            fill="none"
                            height="20"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                            width="20"
                          >
                            <path d="M6 9l6 6 6-6"></path>
                          </svg>
                        </span>
                      </label>

                      {/* Height Animation Container */}
                      <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-in-out peer-checked:grid-rows-[1fr] peer-checked:opacity-100 px-6 md:px-8">
                        <div className="overflow-hidden">
                          <p className="text-gray-600 pb-6 md:pb-8 leading-relaxed pr-2 md:pr-12 text-sm md:text-base">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- STILL NEED HELP CTA --- */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#fff0f4] to-rose-50 rounded-[2.5rem] p-10 md:p-16 text-center border border-rose-100 shadow-sm relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white text-[#b76e79] rounded-2xl shadow-sm border border-rose-100 flex items-center justify-center mx-auto mb-6">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Still have questions?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? Our dedicated
              support team is always ready to assist you.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#b76e79] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#a25a65] hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
