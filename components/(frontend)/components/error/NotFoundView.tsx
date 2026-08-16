"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";
import { memo } from "react";

function NotFoundView() {
  return (
    <main
      role="main"
      className="relative w-full min-h-[calc(100dvh-140px)] flex flex-col items-center justify-center text-center px-4 py-4 sm:py-6 md:py-8 select-none"
    >
      <meta name="robots" content="noindex, nofollow" />

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes floatPanda {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes shadowPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(0.85);
            opacity: 0.15;
          }
        }
        .animate-panda-float {
          animation: floatPanda 3s ease-in-out infinite;
          will-change: transform;
        }
        .animate-shadow-pulse {
          animation: shadowPulse 3s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      <div className="max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-3xl w-full flex flex-col items-center justify-center my-auto">
        {/* Big 404 Title */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-7xl xl:text-8xl font-black text-[#5e1628] tracking-tight font-serif leading-none">
          404
        </h1>

        {/* Oops Subtitle */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-extrabold text-zinc-900 mt-1.5 sm:mt-2 lg:mt-1.5 tracking-tight">
          Oops! This page flew away
        </h2>

        {/* Descriptive Text */}
        <p className="text-xs sm:text-sm md:text-base lg:text-xs xl:text-sm text-zinc-600 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md mx-auto mt-1 sm:mt-1.5 leading-relaxed font-medium">
          The page you’re looking for doesn’t exist or may have been moved.
          Let’s get you back to the good stuff.
        </p>

        {/* Animated Panda Illustration: Tuned for Laptops, iPad & Mobile */}
        <div className="relative my-2 sm:my-4 md:my-5 lg:my-2 xl:my-3 flex flex-col items-center justify-center">
          <div className="relative w-72 h-56 sm:w-[380px] sm:h-[280px] md:w-[440px] md:h-[320px] lg:w-[320px] lg:h-[230px] xl:w-[380px] xl:h-[270px] animate-panda-float">
            <Image
              src="/images/floriwish-404-panda.png"
              alt="404 - Page Not Found"
              fill
              priority
              sizes="(max-width: 640px) 288px, (max-width: 768px) 380px, (max-width: 1024px) 440px, (max-width: 1280px) 320px, 380px"
              className="object-contain"
              draggable={false}
            />
          </div>

          {/* Dynamic Floor Shadow */}
          <div className="w-48 sm:w-60 md:w-72 lg:w-52 xl:w-60 h-3.5 sm:h-4 lg:h-3.5 bg-zinc-900/40 rounded-[100%] blur-md -mt-3 sm:-mt-4 animate-shadow-pulse" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-2.5 sm:mt-4 lg:mt-2.5 xl:mt-4 w-full max-w-[290px] sm:max-w-md lg:max-w-sm xl:max-w-md mx-auto">
          {/* Back to Home Button */}
          <Link
            href="/"
            prefetch={false}
            className="w-full sm:flex-1 py-3 sm:py-3.5 lg:py-2.5 xl:py-3 px-6 sm:px-8 rounded-full bg-[#5e1628] hover:bg-[#48101e] text-white font-bold text-sm sm:text-base lg:text-xs xl:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5e1628]/25 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Home width={18} height={18} className="shrink-0" />
            <span>Back to Home</span>
          </Link>

          {/* Contact Support Button */}
          <Link
            href="/contact"
            prefetch={false}
            className="w-full sm:flex-1 py-3 sm:py-3.5 lg:py-2.5 xl:py-3 px-6 sm:px-8 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-sm sm:text-base lg:text-xs xl:text-sm border border-zinc-200 shadow-md shadow-zinc-200/60 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <MessageCircle width={18} height={18} className="shrink-0" />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default memo(NotFoundView);
