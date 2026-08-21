"use client";

// icons
import { ArrowLeft, MessageCircle, Phone, ShoppingCart } from "lucide-react";
import { WhatsappSVG } from "@/common/svgs/svg";

// hooks
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// utils
import { whatsappContact } from "@/common/utils/_contactDetails";

// components
import { HorizontalSpacing } from "@/components/(frontend)/global/_Spacings/HorizontalSpacings";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useCart } from "@/hooks/useOptimizedCart/useCart";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// types
import { ContentDocument } from "@/common/types/documentation/contents/content";
import { COMPANY_NUMBER } from "@/common/constants/companyDetails";

export default function CartHeader() {
  const router = useRouter();
  const {
    location: {
      data: { selectedCity }
    }
  } = useAppStates();
  const { items, checkout } = useCart();

  // Current step: 1=Cart, 2=Details, 3=Payment
  // Dynamically calculate based on cart completion
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Check if all items have date and time selected
    const allItemsHaveDateTime = items.length > 0 && items.every(item => {
      const hasDate = !!item.delivery?.date;
      const hasSlot = !!item.delivery?.slot && 
                      (typeof item.delivery.slot === 'string' 
                        ? item.delivery.slot.length > 0 
                        : !!(item.delivery.slot as any)?._id);
      return hasDate && hasSlot;
    });

    // Check if delivery address/contact is filled
    const hasDeliveryDetails = !!(
      checkout?.name &&
      checkout?.name.trim().length > 0 &&
      checkout?.location?.address &&
      checkout?.location?.address.trim().length > 0 &&
      checkout?.location?.pincode &&
      checkout?.location?.pincode.trim().length > 0 &&
      checkout?.contact?.mobileNumber &&
      checkout?.contact?.mobileNumber.trim().length > 0
    );

    // Determine current step with smooth transition
    let newStep = 1;
    if (hasDeliveryDetails) {
      newStep = 3; // Move to Payment step
    } else if (allItemsHaveDateTime) {
      newStep = 2; // Move to Details step
    }

    if (newStep !== currentStep) {
      setCurrentStep(newStep);
    }
  }, [items, checkout, currentStep]);

  const whatsappMessage = () =>
    `Hello, I am looking for these:\n${items.map(
      ({ content, pricePerUnit }) =>
        `\nName: ${(content as ContentDocument).name || ""}\nPrice: ${pricePerUnit || ""}`
    )}\n${selectedCity ? `City: ${selectedCity.name}` : ""}`;

  return (
    <div className="lg:col-span-2 sticky top-0 z-50 bg-white shadow-sm">

      {/* ── Top bar ── */}
      <HorizontalSpacing>
        <div className="max-w-[1280px] mx-auto h-14 flex items-center justify-between">

          {/* Left: back + icon + title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft width={18} height={18} className="text-zinc-600" />
            </button>

            {/* Cart icon in rose circle */}
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <ShoppingCart width={15} height={15} className="text-rose-500" strokeWidth={2} />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-zinc-800 leading-tight">My Cart</span>
              <span className="text-[11px] font-semibold text-rose-500 leading-tight">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {/* Right: Help button */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 border border-zinc-200 rounded-full text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                <MessageCircle width={14} height={14} />
                <span>Help</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2 rounded-xl shadow-xl border-zinc-100 z-[100]">
              <div className="flex flex-col gap-1">
                <Link
                  href={whatsappContact(whatsappMessage())}
                  target="_blank"
              rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-50 transition-all text-green-700"
                >
                  <WhatsappSVG dimensions={16} />
                  <span className="text-sm font-medium">WhatsApp</span>
                </Link>
                <Link
                  href={`tel:${COMPANY_NUMBER}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50 transition-all text-blue-600"
                >
                  <Phone width={16} height={16} />
                  <span className="text-sm font-medium">Call Support</span>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </HorizontalSpacing>

      {/* ── Stepper ── */}
      <div className="border-t border-zinc-100">
        <HorizontalSpacing>
          <div className="max-w-[1280px] mx-auto flex items-center h-9">

            {/* Step 1 — Cart */}
            <div className="flex items-center gap-1.5 relative">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 relative overflow-hidden transition-all duration-300 ${
                currentStep >= 1 
                  ? 'bg-rose-500 text-white' 
                  : 'border border-zinc-300 text-zinc-400'
              } ${currentStep === 1 ? 'animate-bounce-subtle' : ''}`}>
                1
                {/* Shimmer effect - only on current step */}
                {currentStep === 1 && <span className="absolute inset-0 shimmer-effect" />}
              </span>
              <span className={`text-[12px] font-bold transition-colors ${
                currentStep >= 1 ? 'text-rose-500' : 'text-zinc-400'
              }`}>Cart</span>
              {/* Active underline */}
              {currentStep === 1 && (
                <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-full animate-pulse" />
              )}
            </div>

            {/* Connecting Line 1 → 2 */}
            <div className="flex-1 h-px bg-zinc-200 mx-3 relative overflow-hidden">
              {currentStep >= 2 && (
                <div className="absolute inset-0 bg-rose-500" />
              )}
              {currentStep === 1 && (
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-transparent animate-progress-line" />
              )}
            </div>

            {/* Step 2 — Details */}
            <div className="flex items-center gap-1.5 relative">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 relative overflow-hidden transition-all duration-300 ${
                currentStep >= 2 
                  ? 'bg-rose-500 text-white' 
                  : 'border border-zinc-300 text-zinc-400'
              } ${currentStep === 2 ? 'animate-bounce-subtle' : ''}`}>
                2
                {/* Shimmer effect - only on current step */}
                {currentStep === 2 && <span className="absolute inset-0 shimmer-effect" />}
              </span>
              <span className={`text-[12px] font-medium transition-colors ${
                currentStep >= 2 ? 'text-rose-500 font-bold' : 'text-zinc-400'
              }`}>Details</span>
              {/* Active underline */}
              {currentStep === 2 && (
                <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-full animate-pulse" />
              )}
            </div>

            {/* Connecting Line 2 → 3 */}
            <div className="flex-1 h-px bg-zinc-200 mx-3 relative overflow-hidden">
              {currentStep >= 3 && (
                <div className="absolute inset-0 bg-rose-500" />
              )}
              {currentStep === 2 && (
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-transparent animate-progress-line" />
              )}
            </div>

            {/* Step 3 — Payment */}
            <div className="flex items-center gap-1.5 relative">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 relative overflow-hidden transition-all duration-300 ${
                currentStep >= 3 
                  ? 'bg-rose-500 text-white' 
                  : 'border border-zinc-300 text-zinc-400'
              } ${currentStep === 3 ? 'animate-bounce-subtle' : ''}`}>
                3
                {/* Shimmer effect - only on current step */}
                {currentStep === 3 && <span className="absolute inset-0 shimmer-effect" />}
              </span>
              <span className={`text-[12px] font-medium transition-colors ${
                currentStep >= 3 ? 'text-rose-500 font-bold' : 'text-zinc-400'
              }`}>Payment</span>
              {/* Active underline */}
              {currentStep === 3 && (
                <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-full animate-pulse" />
              )}
            </div>

          </div>
        </HorizontalSpacing>
      </div>

      {/* CSS for shimmer, progress, and bounce animations */}
      <style jsx>{`
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes progress-line {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-progress-line {
          animation: progress-line 2s ease-in-out infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
