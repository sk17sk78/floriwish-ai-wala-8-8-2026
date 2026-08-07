import moment from "moment";
import { type ContentDeliverySlotDocument } from "@/common/types/documentation/nestedDocuments/contentDeliverySlot";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";

export const getEarliestDeliveryDate = (
  processingHours: number,
  slots?: any[],
  lastSlotTime?: string
): Date => {
  const now = moment();
  const adjustedNow = now.clone().add(processingHours, "hours");

  let availableStartTimes: string[] = [];

  if (slots && slots.length > 0) {
    (slots as ContentDeliverySlotDocument[]).forEach(({ type, timeSlots }) => {
      const deliveryType = type as DeliveryTypeDocument;
      if (deliveryType && deliveryType.timeSlots) {
        deliveryType.timeSlots
          .filter(({ _id }) =>
            (timeSlots as string[]).includes(String(_id))
          )
          .forEach(({ startTime }) => {
            if (!availableStartTimes.includes(startTime)) {
              availableStartTimes.push(startTime);
            }
          });
      }
    });
  } else if (lastSlotTime) {
    availableStartTimes = [lastSlotTime];
  } else {
    availableStartTimes = ["21:00"]; // Fallback
  }

  // Sort times to find the earliest one
  availableStartTimes.sort((a, b) => {
    if (!a || !b || typeof a !== "string" || typeof b !== "string") return 0;
    const [hA, mA] = a.split(":").map(Number);
    const [hB, mB] = b.split(":").map(Number);
    return hA * 60 + mA - (hB * 60 + mB);
  });

  const currentHour = adjustedNow.hour();
  const currentMinute = adjustedNow.minute();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Find the first slot today that is after adjustedNow
  const nextSlotToday = availableStartTimes.find(time => {
    if (!time || typeof time !== "string") return false;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m >= currentTimeInMinutes;
  });

  let targetTime = adjustedNow.clone();

  if (nextSlotToday) {
    const [h, m] = nextSlotToday.split(":").map(Number);
    targetTime.set({ hour: h, minute: m, second: 0, millisecond: 0 });
  } else if (availableStartTimes.length > 0 && typeof availableStartTimes[0] === "string") {
    // No slots left today, take the first slot of tomorrow
    const [h, m] = availableStartTimes[0].split(":").map(Number);
    targetTime.add(1, "day").set({ hour: h, minute: m, second: 0, millisecond: 0 });
  }

  return targetTime.toDate();
};

export const formatEarliestDelivery = (
  date: Date,
  options?: { allCaps?: boolean; showGetBy?: boolean; showDelivery?: boolean }
): string => {
  const targetDate = moment(date).startOf("day");
  const today = moment().startOf("day");
  const tomorrow = moment().add(1, "day").startOf("day");

  let dayStr = "";
  if (targetDate.isSame(today)) {
    dayStr = "Today";
  } else if (targetDate.isSame(tomorrow)) {
    dayStr = "Tomorrow";
  } else if (targetDate.isSame(moment().add(2, "days").startOf("day"))) {
    dayStr = "in 2 days";
  } else {
    dayStr = targetDate.format("Do MMM");
  }

  let result = dayStr;
  if (options?.showGetBy) result = `Get By ${result}`;
  if (options?.showDelivery) result = `${result} Delivery`;
  if (options?.allCaps) result = result.toUpperCase();

  return result;
};
