"use client";

import { Calendar, Clock, ChevronRight, Check, X } from "lucide-react";
import { formattedDate, getNextSevenDays, isSameDate, getHoursGapFromDateAndTime } from "@/components/(frontend)/content/detail/utils/date";
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { whatsappContact } from "@/common/utils/_contactDetails";
import { WhatsappSVG } from "@/common/svgs/svg";

import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type ContentDeliverySlotDocument } from "@/common/types/documentation/nestedDocuments/contentDeliverySlot";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type TimeSlotDocument } from "@/common/types/documentation/nestedDocuments/timeSlot";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";

export default function CartItemDeliveryDateTime({
  isAvailableInAllIndia,
  date,
  deliveryType,
  timeSlot,
  contentDelivery,
  validationTriggered,
  onChangeDate,
  onChangeTime
}: {
  isAvailableInAllIndia: boolean;
  date: Date;
  deliveryType?: DeliveryTypeDocument;
  timeSlot?: TimeSlotDocument;
  contentDelivery: ContentDeliveryDocument;
  validationTriggered: boolean;
  onChangeDate: (date: Date) => void;
  onChangeTime: (
    deliveryType: DeliveryTypeDocument,
    timeSlot: TimeSlotDocument
  ) => void;
}) {
  const isDateSelected = date && !isNaN(new Date(date).getTime());
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(
    isDateSelected ? new Date(date) : null
  );
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  useEffect(() => {
    if (isDateSelected) {
      setSelectedDateState(new Date(date));
    }
  }, [date, isDateSelected]);

  const dates = useMemo(() => getNextSevenDays(), []);

  const orderProcessingTime = (
    contentDelivery?.processingTime as ProcessingTimeDocument
  )?.hours || 0;

  const isTodaySelected = useMemo(() => {
    if (!selectedDateState) return false;
    return isSameDate(selectedDateState, new Date());
  }, [selectedDateState]);

  // Compute time slots grouped by deliveryType
  const allSlotGroups = useMemo(() => {
    return (contentDelivery?.slots as ContentDeliverySlotDocument[] || []).map((slot) => {
      const dType = slot.type as DeliveryTypeDocument;
      const slotItems = dType.timeSlots
        .filter(({ _id }) => (slot.timeSlots as string[]).includes(String(_id)))
        .map((tSlot) => {
          let isAvailableSlot = true;
          if (selectedDateState) {
            const gap = getHoursGapFromDateAndTime(selectedDateState, tSlot.startTime);
            isAvailableSlot = gap > orderProcessingTime;
          }
          return {
            timeSlot: tSlot,
            isAvailable: isAvailableSlot
          };
        });

      return {
        deliveryType: dType,
        slotItems
      };
    }).filter((group) => group.slotItems.length > 0);
  }, [contentDelivery, selectedDateState, orderProcessingTime]);

  // Earliest slot text
  const earliestSlotText = useMemo(() => {
    for (const group of allSlotGroups) {
      const firstAvail = group.slotItems.find((s) => s.isAvailable);
      if (firstAvail) return firstAvail.timeSlot.label;
    }
    return "";
  }, [allSlotGroups]);

  const handleSelectDateCard = (d: Date) => {
    setSelectedDateState(d);
    onChangeDate(d);
  };

  const handleSelectTimeSlot = (dType: DeliveryTypeDocument, slot: TimeSlotDocument) => {
    if (selectedDateState) {
      onChangeDate(selectedDateState);
    }
    onChangeTime(dType, slot);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-sienna-1/10 border border-sienna-1/20 text-sienna-1 shrink-0">
          <Calendar width={16} height={16} className="sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-zinc-900 font-poppins leading-tight truncate">
            Delivery Schedule
          </h3>
          <p className="text-[10px] sm:text-[11px] md:text-xs text-zinc-500 font-medium truncate">
            When should your order be <strong className="text-zinc-900 font-semibold">delivered</strong>?
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-sienna-1/10 border border-sienna-1/20 text-sienna-1 text-[10px] sm:text-xs font-medium">
        <Clock width={14} height={14} className="sm:w-4 sm:h-4 shrink-0 text-sienna-1" />
        <span className="leading-snug">
          Your order will be <strong className="font-bold text-sienna-1">prepared & delivered</strong> within the selected 2-hour window.
        </span>
      </div>

      {/* SELECT DATE Section */}
      <div className="flex flex-col gap-2 sm:gap-2.5 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            SELECT DATE
          </span>
          {selectedDateState && (
            <span className="text-[10px] sm:text-[11px] font-bold text-sienna-1 flex items-center gap-1 bg-sienna-1/10 px-1.5 sm:px-2 py-0.5 rounded-lg">
              <Check width={10} height={10} className="sm:w-3 sm:h-3 stroke-[3]" />
              <span className="hidden xs:inline">Selected: </span>{formattedDate(selectedDateState, "MINI")}
            </span>
          )}
        </div>

        {/* Date Cards Slider (Always Visible) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full snap-x snap-mandatory pr-2 sm:pr-4">
          {(() => {
            const baseList = dates.slice(0, 5).map((d) => new Date(d));
            let cardList = baseList;
            if (selectedDateState && !baseList.some((d) => isSameDate(d, selectedDateState))) {
              cardList = [...baseList, selectedDateState];
            }

            const today = new Date();
            const tmrw = new Date();
            tmrw.setDate(today.getDate() + 1);

            return cardList.map((dObj, index) => {
              const isSelected = selectedDateState && isSameDate(dObj, selectedDateState);
              const isToday = isSameDate(dObj, today);
              const isTmrw = isSameDate(dObj, tmrw);
              const dayLabel = isToday ? "TODAY" : isTmrw ? "TMRW" : formattedDate(dObj, "FULL").substring(0, 3).toUpperCase();
              const dateNum = dObj.getDate();
              const monthName = formattedDate(dObj, "MINI").split(" ")[0];
              const isFast = isToday || isTmrw;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectDateCard(dObj)}
                  className={`relative flex flex-col items-center justify-center py-1.5 sm:py-2 md:py-2.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl md:rounded-2xl border transition-all duration-200 shrink-0 w-[68px] sm:w-[74px] md:w-[82px] snap-start select-none ${
                    isSelected
                      ? "border-2 border-sienna-1 bg-sienna-1 text-white shadow-md shadow-sienna-1/25"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {/* Selected Active Check Circle Badge */}
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-white text-sienna-1 flex items-center justify-center shadow-2xs">
                      <Check width={9} height={9} className="sm:w-[10px] sm:h-[10px] stroke-[3]" />
                    </div>
                  )}

                  {isFast && (
                    <span
                      className={`text-[7px] sm:text-[7.5px] font-black tracking-tight uppercase px-1 sm:px-1.5 py-0.5 rounded-full mb-0.5 whitespace-nowrap leading-none ${
                        isSelected ? "bg-white/20 text-white" : "bg-rose-600 text-white"
                      }`}
                    >
                      FILLING FAST
                    </span>
                  )}
                  <span className={`text-[9px] sm:text-[9.5px] font-extrabold uppercase ${isSelected ? "text-rose-100" : "text-zinc-500"}`}>
                    {dayLabel}
                  </span>
                  <span className={`text-xs sm:text-sm md:text-base font-black leading-tight my-0.5 ${isSelected ? "text-white" : "text-zinc-900"}`}>
                    {dateNum}
                  </span>
                  <span className={`text-[9px] sm:text-[9.5px] font-semibold ${isSelected ? "text-rose-100" : "text-zinc-400"}`}>
                    {monthName}
                  </span>
                </button>
              );
            });
          })()}

          {/* MORE dates button (Half-peeked on right edge) */}
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className={`flex flex-col items-center justify-center py-1.5 sm:py-2 md:py-2.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-dashed transition-all shrink-0 w-[68px] sm:w-[74px] md:w-[82px] snap-start select-none ${
              showCalendar
                ? "border-sienna-1 bg-sienna-1/10 text-sienna-1 font-bold"
                : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <span className="text-[8px] sm:text-[8.5px] font-bold uppercase text-zinc-400">MORE</span>
            <Calendar width={14} height={14} className="sm:w-[15px] sm:h-[15px] my-0.5 text-zinc-500" />
            <span className="text-[9px] sm:text-[9.5px] font-semibold text-zinc-400">dates</span>
          </button>
        </div>

        {/* Pick a Date Modal Popup (Exact Screenshot Design) */}
        {showCalendar && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-6 sm:p-7 max-w-[360px] sm:max-w-[400px] w-full shadow-2xl relative border-none flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdf2f4] border border-[#fce7eb] text-[#e11d48] shrink-0">
                    <Calendar width={20} height={20} className="stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-[17px] font-bold text-[#1e293b] font-poppins leading-tight truncate">
                      Pick a Date
                    </h3>
                    <p className="text-xs font-semibold text-[#94a3b8] mt-0.5 truncate">
                      Any day through Dec 2030
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] transition-colors shrink-0"
                >
                  <X width={18} height={18} className="stroke-[2.2]" />
                </button>
              </div>

              {/* Calendar Component styled like screenshot */}
              <div className="flex items-center justify-center pt-1 w-full">
                <CalendarPicker
                  mode="single"
                  selected={selectedDateState || undefined}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  onSelect={(d) => {
                    if (d) {
                      handleSelectDateCard(d);
                      setShowCalendar(false);
                    }
                  }}
                  className="p-0 w-full border-none shadow-none"
                  classNames={{
                    months: "flex flex-col space-y-4 w-full",
                    month: "space-y-4 w-full",
                    caption: "flex justify-between pt-1 relative items-center px-1 mb-2",
                    caption_label: "text-base font-extrabold text-[#0f172a] font-poppins",
                    nav: "flex items-center gap-1",
                    nav_button: "h-8 w-8 bg-transparent p-0 text-[#94a3b8] hover:text-[#0f172a] hover:bg-zinc-100 rounded-full flex items-center justify-center transition-colors",
                    nav_button_previous: "",
                    nav_button_next: "",
                    table: "w-full border-collapse space-y-1",
                    head_row: "grid grid-cols-7 w-full mb-3 text-center",
                    head_cell: "text-[#94a3b8] text-xs font-extrabold font-poppins text-center uppercase tracking-widest",
                    row: "grid grid-cols-7 w-full mt-2 text-center",
                    cell: "relative p-0 text-center text-sm flex items-center justify-center",
                    day: "h-10 w-10 p-0 font-extrabold text-sm text-[#1e293b] rounded-full hover:bg-rose-50 hover:text-sienna-1 flex items-center justify-center transition-all aria-selected:opacity-100",
                    day_selected: "bg-sienna-1 text-white hover:bg-sienna-1 hover:text-white focus:bg-sienna-1 focus:text-white shadow-md font-black",
                    day_today: "bg-rose-50 text-sienna-1 font-bold",
                    day_outside: "text-[#cbd5e1] font-semibold opacity-40 pointer-events-none",
                    day_disabled: "text-[#cbd5e1] font-semibold opacity-40 pointer-events-none"
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SELECT TIME SLOT Section */}
      {!isAvailableInAllIndia && (
        <div className="flex flex-col gap-2 sm:gap-2.5 border-t border-zinc-100 pt-3 sm:pt-4 w-full">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              SELECT TIME SLOT
            </span>
            {selectedDateState && earliestSlotText && (
              <span className="text-[10px] sm:text-[11px] font-bold text-sienna-1">
                Earliest: {earliestSlotText}
              </span>
            )}
          </div>

          {!selectedDateState ? (
            <div className="p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border border-zinc-100 bg-zinc-50/70 text-zinc-500 text-[10px] sm:text-xs font-medium flex items-center gap-2">
              <Clock width={14} height={14} className="sm:w-[15px] sm:h-[15px] text-zinc-400 shrink-0" />
              <span>Time slots appear after you select a date</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
              {allSlotGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col gap-2 w-full">
                  {allSlotGroups.length > 1 && (
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-700">
                      {group.deliveryType.name}
                    </span>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                    {group.slotItems.map((item, sIdx) => {
                      const isSlotSelected =
                        timeSlot && String(timeSlot._id) === String(item.timeSlot._id);

                      if (!item.isAvailable) {
                        return (
                          <div
                            key={String(item.timeSlot._id)}
                            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-100 bg-zinc-50/50 text-zinc-400 opacity-40 cursor-not-allowed select-none text-center min-h-[50px] sm:min-h-[54px]"
                          >
                            <span className="text-[11px] sm:text-xs font-bold line-through">
                              {item.timeSlot.label}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-zinc-400 mt-0.5">
                              Not available
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={String(item.timeSlot._id)}
                          type="button"
                          onClick={() => handleSelectTimeSlot(group.deliveryType, item.timeSlot)}
                          className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-200 min-h-[50px] sm:min-h-[54px] ${
                            isSlotSelected
                              ? "border-2 border-sienna-1 bg-sienna-1/5 text-sienna-1 font-extrabold shadow-2xs"
                              : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 font-bold"
                          }`}
                        >
                          <span className="text-[11px] sm:text-xs font-extrabold">
                            {item.timeSlot.label}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] ${isSlotSelected ? "text-sienna-1/80 font-bold" : "text-zinc-400 font-medium"}`}>
                            2-hr window
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp Custom Time Banner (Shown ONLY when TODAY is selected - Screenshot 2) */}
          {selectedDateState && isTodaySelected && (
            <a
              href={whatsappContact("Hi, I want to book a custom delivery time slot for today.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 sm:mt-2 flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-[#fffbeb] border border-[#fef08a] transition-all hover:bg-[#fef3c7] group w-full"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xs shrink-0">
                  <WhatsappSVG dimensions={18} className="sm:w-5 sm:h-5 fill-current text-white" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[11px] sm:text-xs font-extrabold text-amber-950 truncate">
                    Only 1 slot left today
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-amber-900/80 truncate">
                    None work? WhatsApp us for a custom time
                  </span>
                </div>
              </div>
              <ChevronRight width={16} height={16} className="sm:w-[18px] sm:h-[18px] text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
