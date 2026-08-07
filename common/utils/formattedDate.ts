import { DATE_FORMAT } from "../constants/dateFormat";
import { DateFormatType } from "../types/types";

// Helper to format date based on moment-like strings
const formatWithNative = (date: Date, formatStr: string): string => {
  const d = new Date(date);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return formatStr
    .replace("dddd", dayNames[d.getDay()])
    .replace("MMMM", fullMonthNames[d.getMonth()])
    .replace("MMM", monthNames[d.getMonth()])
    .replace("Do", d.getDate() + getDaySuffix(d.getDate()))
    .replace("D", d.getDate().toString())
    .replace("YYYY", d.getFullYear().toString());
};

export const formattedDate = (time: Date, format: DateFormatType): string =>
  formatWithNative(time, DATE_FORMAT[format]);

export const formattedDateWithTodayTomorrow = (
  time: Date,
  format: DateFormatType
): string => {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const in2Days = new Date();
  in2Days.setDate(today.getDate() + 2);
  in2Days.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  if (d.getTime() === in2Days.getTime()) return "in 2 days";

  return formatWithNative(time, DATE_FORMAT[format]);
};
