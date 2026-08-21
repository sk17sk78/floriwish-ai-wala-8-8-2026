"use client";

import React, { useState } from "react";
import moment from "moment";
import {
  Check,
  MessageSquare,
  Phone,
  XCircle,
  Truck,
  Flower2,
  Package,
  Gift,
  Clock,
  AlertCircle
} from "lucide-react";
import { COMPANY_NUMBER, COMPANY_WHATSAPP } from "@/common/constants/companyDetails";

export type OrderTrackerStatus =
  | "new"
  | "preparing"
  | "on-the-way"
  | "completed"
  | "cancelled";

interface OrderTrackingTimelineProps {
  status: OrderTrackerStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
  deliveryDate?: string | Date;
  deliverySlot?: string;
  orderId: string;
}

export default function OrderTrackingTimeline({
  status,
  createdAt,
  updatedAt,
  deliveryDate,
  deliverySlot,
  orderId
}: OrderTrackingTimelineProps) {
  const isCancelled = status === "cancelled";

  let currentStepIndex = 0;
  if (status === "new") currentStepIndex = 0;
  else if (status === "preparing") currentStepIndex = 1;
  else if (status === "on-the-way") currentStepIndex = 2;
  else if (status === "completed") currentStepIndex = 3;

  const formattedCreated = moment(createdAt).format("DD MMM, hh:mm A");
  const formattedUpdated = updatedAt ? moment(updatedAt).format("DD MMM, hh:mm A") : moment().format("DD MMM, hh:mm A");
  
  const formattedDelivery = deliveryDate
    ? moment(deliveryDate).format("ddd, Do MMM")
    : null;

  // Check if delivery is running late
  const isPastDeliveryDate = deliveryDate ? moment().isAfter(moment(deliveryDate).endOf("day")) : false;

  const steps = [
    {
      title: "Order Confirmed",
      subtitle: `Your order has been placed and verified.`,
      timestamp: formattedCreated,
      icon: Check
    },
    {
      title: "Order Being Prepared",
      subtitle:
        currentStepIndex >= 1
          ? "Fresh flowers & items prepared with care."
          : formattedDelivery
          ? `Will be prepared on ${formattedDelivery}.`
          : "Scheduled for preparation.",
      timestamp: currentStepIndex >= 1 ? (currentStepIndex === 1 ? formattedUpdated : "Completed") : undefined,
      icon: Flower2
    },
    {
      title: "Out For Delivery",
      subtitle:
        currentStepIndex >= 2
          ? deliverySlot
            ? `Out for delivery • Target Slot: ${deliverySlot}`
            : "Out for delivery with delivery partner."
          : formattedDelivery
          ? `Expected by ${formattedDelivery}${deliverySlot ? ` (${deliverySlot})` : ""}.`
          : "Delivery scheduled.",
      timestamp: currentStepIndex >= 2 ? formattedUpdated : undefined,
      icon: Truck
    },
    {
      title: "Delivered",
      subtitle:
        currentStepIndex === 3
          ? "Delivered successfully with joy and smiles!"
          : isPastDeliveryDate
          ? `Expected by ${formattedDelivery || "today"}${deliverySlot ? ` (${deliverySlot})` : ""} • Arriving shortly`
          : formattedDelivery
          ? `Delivery scheduled for ${formattedDelivery}${deliverySlot ? ` (${deliverySlot})` : ""}.`
          : "Pending delivery.",
      timestamp: currentStepIndex === 3 ? formattedUpdated : undefined,
      isLate: currentStepIndex < 3 && isPastDeliveryDate,
      icon: Gift
    }
  ];

  const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi Floriwish, I have an inquiry about my Order #${orderId}`
  )}`;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 p-3.5 sm:p-5 overflow-hidden">
      {/* Dynamic Keyframes for Flowing Line & Sonar Pulse */}
      <style jsx>{`
        @keyframes flowingLine {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 200%;
          }
        }
        @keyframes radarPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        @keyframes truckMove {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(2.5px);
          }
        }
        @keyframes flowerTwist {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }
        .animated-line-glow {
          background: linear-gradient(
            180deg,
            #10b981 0%,
            #6ee7b7 25%,
            #a7f3d0 50%,
            #10b981 75%,
            #059669 100%
          );
          background-size: 100% 200%;
          animation: flowingLine 2.2s linear infinite;
        }
        .active-radar {
          animation: radarPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .truck-anim {
          animation: truckMove 1.2s ease-in-out infinite;
        }
        .flower-anim {
          animation: flowerTwist 2s ease-in-out infinite;
        }
      `}</style>

      {isCancelled ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2.5">
          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-red-900">Order Cancelled</h4>
            <p className="text-[11px] text-red-700 mt-0.5">
              This order was cancelled. Any amount paid will be refunded within 3-5 business days.
            </p>
          </div>
        </div>
      ) : (
        /* Minimalist Vertical Stepper with Real-Time Date & Time */
        <div className="space-y-0">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="flex items-start group">
                {/* Left Node & Connecting Line */}
                <div className="flex flex-col items-center mr-3 sm:mr-3.5 shrink-0 relative">
                  {/* Radar Ripple on Active Step */}
                  {isCurrent && (
                    <span className="absolute -inset-0.5 rounded-full bg-emerald-400/30 animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Node Circle */}
                  <div
                    className={`relative flex items-center justify-center w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full transition-all duration-300 z-10 ${
                      isCurrent
                        ? "bg-emerald-600 text-white active-radar shadow-sm shadow-emerald-500/40 ring-2 ring-emerald-100"
                        : isCompleted
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-white border-2 border-gray-300 text-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      isCurrent ? (
                        index === 2 ? (
                          <Truck className="w-3 h-3 stroke-[2.5] truck-anim" />
                        ) : index === 1 ? (
                          <Flower2 className="w-3 h-3 stroke-[2.5] flower-anim" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="relative w-[2px] h-7 sm:h-8 my-0.5">
                      {index < currentStepIndex ? (
                        <div className="w-full h-full animated-line-glow rounded-full" />
                      ) : isCurrent ? (
                        <div className="w-full h-full bg-gradient-to-b from-emerald-600 via-emerald-300 to-gray-200 rounded-full" />
                      ) : (
                        <div className="w-full h-full border-l-[1.5px] border-dashed border-gray-300 ml-[0.25px]" />
                      )}
                    </div>
                  )}
                </div>

                {/* Right Text & Real-Time Date */}
                <div
                  className={`flex-1 pb-3 transition-all duration-200 ${
                    isCurrent
                      ? "bg-emerald-50/60 border border-emerald-100/80 -mx-1 px-2.5 py-1.5 rounded-md -mt-1 mb-1 shadow-2xs"
                      : "pt-0"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <h4
                        className={`text-xs sm:text-[13px] ${
                          isCurrent
                            ? "font-semibold text-emerald-950"
                            : isCompleted
                            ? "font-medium text-gray-900"
                            : "font-normal text-gray-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>

                    {/* Exact Real-Time Date & Time Tag */}
                    {step.timestamp && (
                      <span
                        className={`text-[10px] sm:text-[11px] ${
                          isCurrent
                            ? "text-emerald-800 font-medium bg-emerald-100/70 px-1.5 py-0.2 rounded"
                            : isCompleted
                            ? "text-gray-500 font-normal"
                            : "text-gray-400"
                        }`}
                      >
                        {step.timestamp}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 leading-tight ${
                      isCurrent
                        ? "text-emerald-800 font-normal"
                        : isCompleted
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Support Actions Footer */}
      <div className="grid grid-cols-2 gap-2 pt-3 mt-1.5 border-t border-gray-100">
        <a
          href={whatsappUrl}
          target="_blank"
              rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-98 text-gray-700 text-xs font-medium transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Chat with us</span>
        </a>

        <a
          href={`tel:${COMPANY_NUMBER}`}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-98 text-gray-700 text-xs font-medium transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span>Call Support</span>
        </a>
      </div>
    </div>
  );
}
