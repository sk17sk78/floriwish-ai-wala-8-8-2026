"use client";

// icons
import { ChevronDown, HelpCircle, MessageCircleQuestion, Sparkles } from "lucide-react";

// types
import { ClassNameType } from "@/common/types/reactTypes";

// utils
import { memo, useState } from "react";
import { usePathname } from "next/navigation";

export default function FAQs({
  faqData = [],
  title = "Frequently Asked Questions",
  questionClassName,
  answerClassName,
  inProductPage,
}: {
  faqData: Array<{
    _id: string;
    question: string;
    answer: string | JSX.Element;
  }>;
  title?: string;
  questionClassName?: ClassNameType;
  answerClassName?: ClassNameType;
  inProductPage?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  if (!faqData || faqData.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto py-2 sm:py-4">
      {/* Header Row: Clean Editorial Title */}
      {title && (
        <div className="flex flex-col mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#ad2355] tracking-widest uppercase block">
            Common Questions
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 tracking-tight mt-0.5">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 font-normal mt-0.5">
            Everything you need to know about our products, bookings, and same-day delivery.
          </p>
        </div>
      )}

      {/* Human-Crafted Compact Accordion List */}
      <div className="flex flex-col gap-2 sm:gap-2.5 w-full">
        {faqData.map(({ question, answer }, index) => {
          const isOpen = openIndex === index;
          const cleanQuestion = question.includes(".")
            ? question.substring(question.indexOf(".") + 1).trim()
            : question;

          const qNum = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;

          return (
            <div
              key={index}
              className={`rounded-xl sm:rounded-2xl transition-all duration-200 border overflow-hidden ${
                isOpen
                  ? "bg-[#fafafc] border-[#ad2355]/30 shadow-xs ring-1 ring-[#ad2355]/10"
                  : "bg-white border-zinc-100 hover:border-zinc-200 shadow-2xs hover:shadow-xs"
              }`}
            >
              {/* Question Trigger Row */}
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer group select-none transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Small Q-Number Badge */}
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? "bg-[#ad2355] text-white"
                        : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-800"
                    }`}
                  >
                    {qNum}
                  </span>

                  {/* Question Text */}
                  <span
                    className={`text-xs sm:text-[13.5px] font-semibold leading-snug transition-colors line-clamp-2 ${
                      isOpen
                        ? "text-[#ad2355]"
                        : "text-zinc-800 group-hover:text-zinc-950"
                    } ${questionClassName || ""}`}
                  >
                    {cleanQuestion}
                  </span>
                </div>

                {/* Rotating Chevron Icon Button */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isOpen
                      ? "bg-[#ad2355]/10 text-[#ad2355] rotate-180"
                      : "bg-zinc-100 text-zinc-400 group-hover:text-zinc-700 group-hover:bg-zinc-200/80"
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </button>

              {/* Answer Content Animated */}
              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3 sm:pb-3.5 pt-0.5 text-left border-t border-zinc-100/60 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div
                    className={`text-[11.5px] sm:text-xs text-zinc-600 leading-relaxed font-normal pl-7 sm:pl-9 ${
                      answerClassName || ""
                    }`}
                  >
                    {typeof answer === "string" ? (
                      <p>{answer}</p>
                    ) : (
                      answer
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
