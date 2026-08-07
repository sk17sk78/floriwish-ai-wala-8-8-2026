// icons
import { Calendar } from "lucide-react";

// utils
import { formattedDate } from "@/components/(frontend)/content/detail/utils/date";

// hooks
import { useState } from "react";

// components
import CartItemDeliveryDateDialog from "./CartItemDeliveryDateDialog";

// types
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";

export default function CartItemDeliveryDate({
  isAvailableInAllIndia,
  date,
  contentDelivery,
  onChangeDate
}: {
  isAvailableInAllIndia: boolean;
  date: Date;
  contentDelivery: ContentDeliveryDocument;
  onChangeDate: (date: Date) => void;
}) {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 cursor-pointer hover:bg-orange-100 transition-all shadow-sm"
      >
        <Calendar width={14} height={14} className="text-orange-500" />
        <span className="text-[11px] font-bold whitespace-nowrap">
          {isNaN(date.getTime()) ? "Select Date" : `${isAvailableInAllIndia ? "By " : ""}${formattedDate(date, "SHORT")}`}
        </span>
      </div>
      <CartItemDeliveryDateDialog
        showDialog={showDialog}
        selectedDate={isNaN(date.getTime()) ? new Date() : date}
        contentDelivery={contentDelivery}
        onChangeShowDialog={setShowDialog}
        onSelectDate={onChangeDate}
      />
    </>
  );
}
