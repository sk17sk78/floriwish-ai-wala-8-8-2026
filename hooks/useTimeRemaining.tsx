// libraries
import moment from "moment";

// hooks
import { useState, useEffect } from "react";
import { getEarliestDeliveryDate } from "@/common/utils/delivery";

// types
type TimeRemaining = {
  hours: number;
  minutes: number;
  seconds: number;
  date: Date;
};

// hooks
const useTimeRemainingFromHours = (
  currentHour: number,
  definedTime?: string,
  slots?: any[]
): TimeRemaining => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    date: moment().toDate()
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = moment();
      const targetDate = getEarliestDeliveryDate(currentHour, slots);
      const targetTime = moment(targetDate);
      
      const adjustedNow = now.clone().add(currentHour, "hours");
      const timeDiff = moment.duration(targetTime.diff(adjustedNow));

      setTimeRemaining({
        hours: Math.max(Math.floor(timeDiff.asHours()), 0),
        minutes: Math.max(timeDiff.minutes(), 0),
        seconds: Math.max(timeDiff.seconds(), 0),
        date: targetTime.toDate()
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentHour, definedTime, slots]);

  return timeRemaining;
};

export default useTimeRemainingFromHours;
