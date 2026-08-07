"use client";

// icons
import { ArrowLeft, Phone } from "lucide-react";
import { WhatsappSVG } from "@/common/svgs/svg";

// utils
import { whatsappContact } from "@/common/utils/_contactDetails";

// hooks
import { useRouter } from "next/navigation";

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

import { ContentDocument } from "@/common/types/documentation/contents/content";
import { COMPANY_NUMBER } from "@/common/constants/companyDetails";

export default function CartHeader() {
  const router = useRouter();
  const {
    location: {
      data: { selectedCity }
    }
  } = useAppStates();
  const { items } = useCart();

  const whatsappMessage = () =>
    `Hwllo, I am looking for these:
  ${items.map(({ content, pricePerUnit }) => `\nName: ${(content as ContentDocument).name || ""}\nPrice: ${pricePerUnit || ""}`)}
  \n${selectedCity ? `City: ${selectedCity.name}` : ""}`;

  return (
    <div className="lg:col-span-2 sticky top-0 z-50 bg-white">
      <HorizontalSpacing className="border-b border-charcoal-3/10">
        <div className="max-w-[1400px] mx-auto pt-4 pb-4 flex items-center justify-between lg:py-5">
        <div className="flex items-center font-medium justify-start gap-4">
          <div
            className="cursor-pointer p-2 hover:bg-charcoal-3/5 rounded-full transition-all duration-300"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft width={20} height={20} />
          </div>
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-2">
              <span className="lg:text-xl font-bold text-charcoal-3">My Cart</span>
              <span className="bg-sienna-1/10 text-sienna-1 text-[10px] lg:text-xs px-2 py-0.5 rounded-full font-semibold">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-charcoal-3/15 rounded-full text-sm font-medium hover:bg-charcoal-3/5 transition-all duration-300">
              <Phone width={16} height={16} className="text-charcoal-3/60" />
              <span>Help</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 rounded-xl shadow-xl border-charcoal-3/10 z-[100]">
            <div className="flex flex-col gap-1">
              <Link
                href={whatsappContact(whatsappMessage())}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-all text-green-700"
              >
                <WhatsappSVG dimensions={18} />
                <span className="font-medium">WhatsApp</span>
              </Link>
              <Link
                href={`tel:${COMPANY_NUMBER}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all text-blue-600"
              >
                <Phone width={18} height={18} />
                <span className="font-medium">Call Support</span>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </HorizontalSpacing>

      <div className="bg-ivory-1/50 border-b border-charcoal-3/10 py-3 overflow-x-auto scrollbar-hide">
        <HorizontalSpacing>
          <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-4 sm:gap-12 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sienna-1 text-white flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-sm font-bold text-sienna-1 underline underline-offset-4">Cart</span>
          </div>
          <div className="w-12 sm:w-24 h-px bg-charcoal-3/20" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-6 h-6 rounded-full border border-charcoal-3/40 flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-sm font-medium">Details</span>
          </div>
          <div className="w-12 sm:w-24 h-px bg-charcoal-3/20" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-6 h-6 rounded-full border border-charcoal-3/40 flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-sm font-medium">Payment</span>
          </div>
          </div>
        </HorizontalSpacing>
      </div>
    </div>
  );
}
