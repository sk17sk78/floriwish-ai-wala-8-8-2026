"use client";

import React from "react";
import Link from "next/link";
import {
  Clock3,
  Headphones,
  Leaf,
  ShieldCheck,
} from "lucide-react";

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link?: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Leaf,
    title: "100% Freshness Guarantee",
    description: "Farm-fresh blooms & handcrafted cakes conditioned to perfection.",
  },
  {
    icon: Clock3,
    title: "Express Same-Day Delivery",
    description: "On-time doorstep delivery across 400+ Indian cities in 2 hours.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure Checkout",
    description: "Bank-grade encrypted payments with instant WhatsApp updates.",
  },
  {
    icon: Headphones,
    title: "Dedicated Human Support",
    description: "Direct assistance for custom orders, timings & live tracking.",
    link: "/contact",
  },
];

export default function WhyChooseUsSection() {
  return (
    <div className="w-full max-w-6xl mx-auto pt-2 pb-6 sm:pb-8">
      {/* Sleek, Human Luxury Trust Bar */}
      <div className="bg-[#fafafc] border border-zinc-200/70 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-7 shadow-2xs">
        {/* Subtle Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 mb-4 sm:mb-6 pb-3 sm:pb-3.5 border-b border-zinc-200/60">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#ad2355] tracking-widest uppercase block">
              The Floriwish Promise
            </span>
            <h2 className="text-sm min-[380px]:text-base sm:text-lg md:text-xl font-bold text-zinc-900 tracking-tight mt-0.5">
              Why 2,00,000+ Customers Trust Us
            </h2>
          </div>
          <p className="text-[10.5px] sm:text-xs text-zinc-500 font-normal">
            Handcrafted with love • Delivered with care
          </p>
        </div>

        {/* 2x2 Grid on Mobile (1 Left, 1 Right, 2 Underneath) & 4-Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 lg:gap-6 lg:divide-x lg:divide-zinc-200/70">
          {FEATURES.map((item, idx) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`h-full flex flex-col sm:flex-row items-start gap-2 sm:gap-3.5 p-2.5 min-[380px]:p-3 sm:p-0 rounded-xl sm:rounded-none bg-white sm:bg-transparent border border-zinc-100 sm:border-0 shadow-2xs sm:shadow-none ${
                  idx > 0 ? "lg:pl-6" : ""
                } group text-left`}
              >
                {/* Refined Minimalist Icon Bubble */}
                <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-50 sm:bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center shrink-0 text-zinc-700 group-hover:text-[#ad2355] group-hover:border-[#ad2355]/30 group-hover:bg-[#ad2355]/5 transition-all duration-200">
                  <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 stroke-[2]" />
                </div>

                {/* Text Content */}
                <div className="flex flex-col min-w-0">
                  <h3 className="text-[11px] min-[380px]:text-xs sm:text-[13px] font-bold text-zinc-900 group-hover:text-[#ad2355] transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-[11.5px] text-zinc-500 font-normal leading-snug sm:leading-relaxed mt-0.5 sm:mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );

            if (item.link) {
              return (
                <Link key={idx} href={item.link} className="no-underline block h-full">
                  {content}
                </Link>
              );
            }

            return <div key={idx} className="h-full">{content}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
