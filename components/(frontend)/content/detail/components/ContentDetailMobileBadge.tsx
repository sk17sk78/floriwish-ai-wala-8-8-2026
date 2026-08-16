import { Zap } from "lucide-react";
import { memo, useEffect, useState } from "react";
import ContentHorizontalSpacing from "../../spacing/ContentHorizontalSpacing";
import useTimeRemaining from "@/hooks/useTimeRemaining";

function ContentDetailMobileBadge({
  processingTime,
  lastDeliverySlotTime,
  className,
}: {
  processingTime: number;
  lastDeliverySlotTime?: string;
  className?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { hours, minutes, seconds, date } = useTimeRemaining(
    processingTime,
    lastDeliverySlotTime,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const remainingTime = `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

  // Determine if it's "Today" delivery
  const isToday = date && new Date(date).toDateString() === new Date().toDateString();
  const isTomorrow = date && new Date(date).toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  return (
    <ContentHorizontalSpacing className={`xl:hidden mb-2 items-center flex ${className || ""}`}>
      <div className="bg-moss/10 text-moss px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-moss/20 shadow-sm transition-all duration-300">
        <Zap
          width={12}
          height={12}
          className="fill-moss stroke-moss"
        />
        <div className="flex items-center gap-x-1.5 antialiased">
          <span className="text-[11px] font-bold font-poppins tracking-tight uppercase">
            {isToday ? "Get Delivered Today" :
              isTomorrow ? "Get Delivered Tomorrow" :
                `Get Delivered by ${new Date(date!).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}`}
          </span>
          {isToday && isMounted && (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70 ml-0.5">
                in
              </span>
              <span className="font-bold text-[13px] tabular-nums tracking-tighter">
                {remainingTime}
              </span>
            </>
          )}
        </div>
      </div>
    </ContentHorizontalSpacing>
  );
}

export default memo(ContentDetailMobileBadge);
