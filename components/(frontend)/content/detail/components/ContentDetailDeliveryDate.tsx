// utils
import { lazy } from "react";
import { formattedDate } from "../utils/date";

// hooks
import { useEffect, useMemo, useState } from "react";

// components
import { Suspense } from "react";
import ContentDetailDeliverySelectDateStatus from "./ContentDetailDeliverySelectDateStatus";
const LazyContentDetailDeliverySelectDateTime = lazy(
  () => import("./ContentDetailDeliverySelectDateTime"),
);

// types
import { type CartItemDeliveryDocument } from "@/common/types/documentation/nestedDocuments/cartItemDelivery";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type TimeSlotDocument } from "@/common/types/documentation/nestedDocuments/timeSlot";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";
import { type SelectDateStatus } from "../types/delivery";

export default function ContentDetailDeliveryDate({
  status,
  contentDelivery,
  lastDeliverySlotTime,
  cartItemDelivery,
  onChangeCartItemDelivery,
}: {
  status: SelectDateStatus;
  contentDelivery: ContentDeliveryDocument;
  lastDeliverySlotTime: string;
  cartItemDelivery: CartItemDeliveryDocument;
  onChangeCartItemDelivery: (delivery: CartItemDeliveryDocument) => void;
}) {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const orderProcessingTime =
    (contentDelivery?.processingTime as ProcessingTimeDocument)?.hours || 0;

  const deliveryType = useMemo(() => {
    const deliverySlots = contentDelivery?.slots || [];
    return deliverySlots.find(
      ({ type }) =>
        (type as DeliveryTypeDocument)?._id ===
        (cartItemDelivery?.type as DeliveryTypeDocument)?._id,
    )
      ? (deliverySlots.find(
          ({ type }) =>
            (type as DeliveryTypeDocument)?._id ===
            (cartItemDelivery?.type as DeliveryTypeDocument)?._id,
        )?.type as DeliveryTypeDocument)
      : null;
  }, [contentDelivery?.slots, cartItemDelivery.type]);

  const deliveryTimeSlot = useMemo(
    () =>
      (deliveryType?.timeSlots as TimeSlotDocument[])?.find(
        ({ _id }) => _id === (cartItemDelivery?.slot as TimeSlotDocument)?._id,
      ),
    [deliveryType, cartItemDelivery.slot],
  );

  const selectedDateTimeLabel = useMemo(
    () =>
      cartItemDelivery?.date && deliveryTimeSlot
        ? `${formattedDate((cartItemDelivery.date as Date) || new Date(), "MINI")}, ${deliveryTimeSlot.label}`
        : "",
    [deliveryTimeSlot, cartItemDelivery.date],
  );

  useEffect(() => {
    if (!showDialog) {
      setActiveIndex(0);
    }
  }, [showDialog]);

  return (
    <>
      <div className="space-y-0.5 text-charcoal-3/95 ">
        <input
          type="text"
          placeholder="Select Date & Time"
          readOnly
          value={selectedDateTimeLabel}
          onClick={() => {
            setShowDialog(true);
          }}
          className="w-full cursor-pointer rounded-md border border-[#efe8eb] bg-[#faf8f9] px-2 py-1.5 text-xs font-medium text-zinc-500 outline-none transition-all duration-300 placeholder:text-zinc-500/45 focus:border-moss/15 focus:bg-white"
        />
        <ContentDetailDeliverySelectDateStatus status={status} />
      </div>
      <Suspense>
        <LazyContentDetailDeliverySelectDateTime
          showDialog={showDialog}
          activeIndex={activeIndex}
          contentDelivery={contentDelivery}
          selectedDate={cartItemDelivery.date as Date}
          selectedDeliveryType={cartItemDelivery.type as DeliveryTypeDocument}
          selectedTimeSlot={cartItemDelivery.slot as TimeSlotDocument}
          orderProcessingTime={orderProcessingTime}
          lastDeliverySlotTime={lastDeliverySlotTime}
          onChangeShowDialog={setShowDialog}
          onChangeActiveIndex={setActiveIndex}
          onSelectDate={(date?: Date) => {
            onChangeCartItemDelivery({
              date: date?.toISOString() || date,
            } as CartItemDeliveryDocument);
          }}
          onSelectDeliveryType={(type?: DeliveryTypeDocument) => {
            onChangeCartItemDelivery({
              ...cartItemDelivery,
              type,
            } as CartItemDeliveryDocument);
          }}
          onSelectTimeSlot={(
            type?: DeliveryTypeDocument,
            slot?: TimeSlotDocument,
          ) => {
            onChangeCartItemDelivery({
              ...cartItemDelivery,
              type,
              slot,
            } as CartItemDeliveryDocument);
          }}
        />
      </Suspense>
    </>
  );
}
