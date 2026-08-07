// icons
import { Clock3, Truck } from "lucide-react";

// hooks
import { useState } from "react";

// components
import CartItemDeliveryTimeDialog from "./CartItemDeliveryTimeDialog";

// types
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type TimeSlotDocument } from "@/common/types/documentation/nestedDocuments/timeSlot";

export default function CartItemDeliveryTime({
  date,
  deliveryType,
  timeSlot,
  contentDelivery,
  onChangeTime
}: {
  date: Date;
  deliveryType?: DeliveryTypeDocument;
  timeSlot?: TimeSlotDocument;
  contentDelivery: ContentDeliveryDocument;
  onChangeTime: (
    deliveryType: DeliveryTypeDocument,
    timeSlot: TimeSlotDocument
  ) => void;
}) {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 cursor-pointer hover:bg-orange-100 transition-all shadow-sm"
      >
        <Clock3 width={14} height={14} className="text-orange-500" />
        <span className="text-[11px] font-bold whitespace-nowrap">
          {timeSlot?.label || "Select Time"}
        </span>
      </div>
      <CartItemDeliveryTimeDialog
        showDialog={showDialog}
        selectedDate={date}
        selectedDeliveryType={deliveryType!}
        selectedTimeSlot={timeSlot!}
        contentDelivery={contentDelivery}
        onChangeShowDialog={setShowDialog}
        onChangeTime={onChangeTime}
      />
    </>
  );
}
