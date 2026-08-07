// libraries
import moment from "moment";

// icons
import { Zap } from "lucide-react";

// utils
import { memo } from "react";
import { getEarliestDeliveryDate, formatEarliestDelivery } from "@/common/utils/delivery";

// hooks
import { useMemo } from "react";

import { type ContentDeliverySlotDocument } from "@/common/types/documentation/nestedDocuments/contentDeliverySlot";

function CategoryContentEarliestDelivery({
  processingTime,
  slots,
  lastDeliverySlot
}: {
  processingTime: number;
  slots?: ContentDeliverySlotDocument[];
  lastDeliverySlot?: string;
}) {
  // variables
  const date = useMemo(
    () =>
      getEarliestDeliveryDate(
        processingTime,
        slots,
        lastDeliverySlot
      ),
    [processingTime, slots, lastDeliverySlot]
  );

  const formattedDate = useMemo(() => {
    return formatEarliestDelivery(date, { showDelivery: true });
  }, [date]);

  return (
    <div className="px-1 sm:px-3 pt-1 pb-1">
      <div className="flex items-center justify-center gap-x-1 bg-sienna-3/20 w-fit px-1 sm:px-2 py-[2px] rounded text-[#9E2A2B]">
        <Zap className="fill-[#9E2A2B] stroke-transparent" width={11} height={11} />
        <span className="text-[7px] sm:text-[11px] font-bold tracking-wide uppercase">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

export default memo(CategoryContentEarliestDelivery);
