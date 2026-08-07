// icons
import { Truck } from "lucide-react";

// hooks
import { useEffect, useMemo } from "react";
import { formatEarliestDelivery } from "@/common/utils/delivery";

// hooks
import useTimeRemaining from "@/hooks/useTimeRemaining";

export default function ContentDetailDeliveryEarliest({
  isAvailableAtAllIndia,
  processingTime,
  lastDeliverySlotTime,
  onChangeDate,
}: {
  isAvailableAtAllIndia?: boolean;
  processingTime: number;
  lastDeliverySlotTime?: string;
  onChangeDate: (date?: Date) => void;
}) {
  const { hours, minutes, seconds, date } = useTimeRemaining(
    processingTime,
    lastDeliverySlotTime,
  );

  const formattedDate = useMemo(() => {
    return formatEarliestDelivery(date);
  }, [date]);

  const remainingTime = useMemo(
    () =>
      `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`,
    [hours, minutes, seconds],
  );

  useEffect(() => {
    if (isAvailableAtAllIndia) {
      onChangeDate(date);
    }
  }, [isAvailableAtAllIndia, date, onChangeDate]);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-charcoal-3/65">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f3f5] px-2 py-1 font-semibold text-charcoal-3/70">
        <Truck width={15} className="text-moss" />
        <span>
          {formattedDate === "Today"
            ? "Earliest delivery today"
            : formattedDate === "Tomorrow"
              ? "Earliest delivery tomorrow"
              : `Earliest delivery by ${formattedDate}`}
        </span>
      </div>
      {formattedDate === "Today" ? (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          Order within {remainingTime}
        </span>
      ) : null}
    </div>
  );
}
