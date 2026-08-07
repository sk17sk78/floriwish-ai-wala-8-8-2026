// icons
import { Truck } from "lucide-react";

// hooks
import { useEffect, useMemo, useState } from "react";
import { formatEarliestDelivery } from "@/common/utils/delivery";
import useTimeRemaining from "@/hooks/useTimeRemaining";

export default function ContentDetailActionBadge({
  processingTime,
  lastDeliverySlotTime,
  onChangeDate,
}: {
  processingTime: number;
  lastDeliverySlotTime?: string;
  onChangeDate: (date?: Date) => void;
}) {
  // hooks
  const [isMounted, setIsMounted] = useState(false);
  const { hours, minutes, seconds, date } = useTimeRemaining(
    processingTime,
    lastDeliverySlotTime,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // memoizes
  const formattedDate = useMemo(() => {
    return formatEarliestDelivery(date);
  }, [date]);

  const remainingTime = useMemo(
    () =>
      `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`,
    [hours, minutes, seconds],
  );

  useEffect(() => {
    onChangeDate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-x-2 border-b border-[#f0dbe3] bg-[#fff3f7] px-2 py-1 text-xs text-moss transition-all duration-300 font-semibold">
        <Truck width={16} height={16} />
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 antialiased">
          <span className="font-poppins tracking-tight">
            {formattedDate === "Today"
              ? "Get Delivered Today"
              : formattedDate === "Tomorrow"
                ? "Get Delivered Tomorrow"
                : `Get Delivered by ${formattedDate}`}
          </span>
          {formattedDate === "Today" && (
            <>
              <span className="ml-1 text-xs tracking-tight opacity-70">
                Order within
              </span>
              {isMounted ? (
                <span className="text-xs tracking-tighter text-zinc-800">
                  {remainingTime}
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
