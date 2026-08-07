// hooks
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useEffect, useMemo, useState } from "react";
import { Clock3, MapPin } from "lucide-react";

// components
import ContentDetailDeliveryCity from "./ContentDetailDeliveryCity";
import ContentDetailDeliveryDate from "./ContentDetailDeliveryDate";
import ContentDetailDeliveryEarliest from "./ContentDetailDeliveryEarliest";

// types
import { type CartItemDeliveryDocument } from "@/common/types/documentation/nestedDocuments/cartItemDelivery";
import { type ContentAvailabilityDocument } from "@/common/types/documentation/nestedDocuments/contentAvailability";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type ContentDeliverySlotDocument } from "@/common/types/documentation/nestedDocuments/contentDeliverySlot";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";
import {
  type SelectCityStatus,
  type SelectDateStatus,
} from "../types/delivery";

export default function ContentDetailDelivery({
  id,
  isAvailable,
  showDeliveryStatus,
  contentAvailability,
  contentDelivery,
  cartItemDelivery,
  onChangeShowDeliveryStatus,
  onChangeCartItemDelivery,
}: {
  id: string;
  isAvailable: boolean;
  showDeliveryStatus: boolean;
  contentAvailability: ContentAvailabilityDocument;
  contentDelivery: ContentDeliveryDocument;
  cartItemDelivery: CartItemDeliveryDocument;
  onChangeShowDeliveryStatus: (showDeliveryStatus: boolean) => void;
  onChangeCartItemDelivery: (delivery: CartItemDeliveryDocument) => void;
}) {
  const {
    location: {
      data: { selectedCity },
    },
  } = useAppStates();

  const [selectCityStatus, setSelectCityStatus] =
    useState<SelectCityStatus>("");

  useEffect(() => {
    if (!contentDelivery) return;
    if (selectedCity) {
      setSelectCityStatus(isAvailable ? "available" : "not-available");
    } else if (showDeliveryStatus) {
      setSelectCityStatus("not-selected");
    }
  }, [showDeliveryStatus, selectedCity, isAvailable, contentDelivery]);

  useEffect(() => {
    if (!contentDelivery) return;
    if (selectCityStatus) {
      onChangeShowDeliveryStatus(true);
    }
  }, [selectCityStatus, contentDelivery, onChangeShowDeliveryStatus]);

  if (!contentDelivery) {
    return null;
  }

  if (contentAvailability.availableAt === "all-india") {
    return (
      <div className="mt-1 rounded-[28px] border border-[#efe7ea] bg-white p-5 shadow-[0_18px_42px_rgba(17,24,39,0.05)]">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff2f6] text-moss">
            <MapPin width={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-charcoal-3">
              Delivery Across India
            </h3>
            <p className="text-sm text-charcoal-3/55">
              This product can be ordered nationwide without selecting a city
              first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className="mt-1 flex flex-row gap-3 rounded-xl border border-[#efe7ea] bg-white p-3 shadow-md"
    >
      {/* City Section */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#fff2f6] text-moss">
            <MapPin width={14} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-[-0.01em] text-zinc-800">
              Select City
            </h3>
            <p className="text-[10px] text-zinc-500">500+ cities in India</p>
          </div>
        </div>
        <div>
          <ContentDetailDeliveryCity status={selectCityStatus} />
        </div>
      </div>
    </div>
  );
}
