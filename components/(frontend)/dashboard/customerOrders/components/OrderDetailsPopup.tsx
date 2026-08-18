"use client";

import React, { useState } from "react";
import moment from "moment";
import {
  Check,
  ChevronDown,
  Copy,
  CheckCheck,
  MapPin,
  SparklesIcon
} from "lucide-react";

import { INRSymbol } from "@/common/constants/symbols";
import { AddonDocument } from "@/common/types/documentation/contents/addon";
import { ContentDocument } from "@/common/types/documentation/contents/content";
import { CartDocument } from "@/common/types/documentation/dynamic/cart";
import { OrderDocument } from "@/common/types/documentation/dynamic/order";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { CartItemUploadedTextDocument } from "@/common/types/documentation/nestedDocuments/cartItemUploadedText";
import { DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { EnhancementDocument } from "@/common/types/documentation/presets/enhancement";
import { FlavourDocument } from "@/common/types/documentation/presets/flavour";
import { UpgradeDocument } from "@/common/types/documentation/presets/upgrade";
import { SetStateType } from "@/common/types/reactTypes";
import { BasicImageType } from "@/common/types/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { getCustomVariant } from "@/hooks/useOptimizedCart/utils/getCustomVariant";
import NextImage from "@/components/custom/NextImage";
import { copyToClipboard } from "@/common/helpers/copyToClipboard";

import OrderTrackingTimeline, { OrderTrackerStatus } from "./OrderTrackingTimeline";

export default function OrderDetailsPopup({
  inAdmin,
  open,
  setOpen,
  order,
  adminCart,
  retryPayment,
  downloadInvoice
}: {
  inAdmin?: boolean;
  open: boolean;
  setOpen: SetStateType<boolean>;
  order: OrderDocument;
  adminCart?: CartDocument;
  retryPayment: () => void;
  downloadInvoice: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { id, cart: orderCart, createdAt, payment } = order;

  const cart = inAdmin
    ? (adminCart as CartDocument)
    : (orderCart as CartDocument);

  const city = cart?.checkout ? cart.checkout.location.city : "";
  const bookingDate = moment(createdAt).format("DD MMM YYYY, hh:mm A");
  const address = cart?.checkout ? cart.checkout.location.address : "";

  const primaryItem = cart?.items?.[0];
  const rawStatus = (primaryItem?.status as string) || "new";
  const primaryStatus: OrderTrackerStatus =
    rawStatus === "completed"
      ? "completed"
      : rawStatus === "on-the-way"
      ? "on-the-way"
      : rawStatus === "preparing"
      ? "preparing"
      : rawStatus === "cancelled"
      ? "cancelled"
      : "new";

  const primaryDeliveryDate = primaryItem?.delivery?.date;
  const primaryDeliverySlot =
    primaryItem?.delivery?.slot && Array.isArray((primaryItem?.delivery?.type as any)?.timeSlots)
      ? (primaryItem?.delivery?.type as DeliveryTypeDocument).timeSlots.find(
          ({ _id }) => String(_id) === String(primaryItem?.delivery?.slot)
        )?.label || ""
      : "";

  const itemUpdatedAt = primaryItem?.updatedAt;
  const cartUpdatedAt = cart?.updatedAt;
  const orderUpdatedAt = order?.updatedAt;

  const validTimestamps = [itemUpdatedAt, cartUpdatedAt, orderUpdatedAt]
    .filter(Boolean)
    .map((t) => new Date(t as any).getTime())
    .filter((time) => !isNaN(time));

  const effectiveUpdatedAt =
    validTimestamps.length > 0 ? new Date(Math.max(...validTimestamps)) : createdAt;

  const orderIdentifier = id || String(order?._id || "");

  const handleCopyId = () => {
    if (orderIdentifier) {
      copyToClipboard(orderIdentifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetry = () => {
    setOpen(false);
    retryPayment();
  };

  const orders: {
    img: BasicImageType;
    name: string;
    status: "in-progress" | "cancelled" | "ordered" | "delivered";
    addons: {
      img: BasicImageType;
      name: string;
      quantity: number;
      pricePerUnit: number;
    }[];
    date: string;
    time: string;
    quantity: number;
    pricePerUnit: number;
    customizations: {
      flavor?: { label: string; price: number };
      colors?: string;
      text?: string;
      upgrade?: { label: string; price: number };
      enhancement?: { label: string; price: number }[];
    };
  }[] = (cart?.items || []).map((item) => {
    const {
      status,
      content: itemContent,
      customVariant: customVariantId,
      titleIfCustomVariant,
      pricePerUnit = 0
    } = item;
    const { quantity = 1, delivery, addons, customization } = item;

    const content = (typeof itemContent === "object" && itemContent !== null ? itemContent : {}) as ContentDocument;
    const customVariant = item.customVariant && content?.name
      ? getCustomVariant({ content, variantId: item.customVariant })
      : null;
    const itemStatus: "cancelled" | "delivered" | "ordered" | "in-progress" =
      status === "completed"
        ? "delivered"
        : status === "new"
        ? "ordered"
        : status === "preparing" || status === "on-the-way"
        ? "in-progress"
        : ((status || "ordered") as any);

    const displayName =
      customVariant?.name ||
      content?.name ||
      (itemContent as any)?.title ||
      "Item";

    const displayImgUrl =
      customVariant?.image?.url ||
      (content?.media?.primary as ImageDocument)?.url ||
      (content?.media?.primary as any) ||
      "";

    return {
      img: {
        alt: customVariant?.image?.alt || (content?.media?.primary as ImageDocument)?.alt || displayName,
        url: displayImgUrl
      },
      name: displayName,
      status: itemStatus,
      addons:
        addons && Array.isArray(addons) && addons.length > 0
          ? addons.map(({ quantity = 1, pricePerUnit = 0, addon }) => ({
              img: {
                url: ((addon as AddonDocument)?.image as ImageDocument)?.url || "",
                alt:
                  ((addon as AddonDocument)?.image as ImageDocument)?.alt ||
                  ((addon as AddonDocument)?.image as ImageDocument)?.defaultAlt ||
                  ""
              },
              name: (addon as AddonDocument)?.name || "Addon",
              quantity,
              pricePerUnit
            }))
          : [],
      date: delivery?.date ? moment(delivery.date).format("Do MMM, YYYY") : "",
      pricePerUnit: pricePerUnit || 0,
      quantity: quantity || 1,
      time:
        delivery?.slot && Array.isArray((delivery?.type as any)?.timeSlots)
          ? (delivery.type as DeliveryTypeDocument).timeSlots.find(
              ({ _id }) => String(_id) === String(delivery.slot)
            )?.label || ""
          : "",
      customizations: {
        flavor:
          customization && customization.flavour
            ? {
                label: (customization.flavour.flavour as FlavourDocument)?.name || "Flavour",
                price: customization.flavour.price || 0
              }
            : undefined,
        upgrade:
          customization && customization.upgrade
            ? {
                label: (customization.upgrade.upgrade as UpgradeDocument)?.label || "Upgrade",
                price: customization.upgrade.price || 0
              }
            : undefined,
        colors:
          customization && customization.balloonColor
            ? customization.balloonColor
            : undefined,
        text:
          customization && customization.uploadedText
            ? (customization.uploadedText as CartItemUploadedTextDocument)?.text
            : undefined,
        enhancement:
          customization &&
          customization.enhancement &&
          Array.isArray(customization.enhancement.items) &&
          customization.enhancement.items.length > 0
            ? customization.enhancement.items.map(({ enhancement, price = 0 }) => ({
                price: price || 0,
                label: (enhancement as EnhancementDocument)?.label || "Enhancement"
              }))
            : undefined
      }
    };
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[560px] w-[94vw] max-h-[88vh] p-0 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        {/* Clean Header with safe right padding for close button */}
        <div className="pl-4 sm:pl-5 pr-11 sm:pr-12 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              Order Details
            </h2>
            <button
              onClick={handleCopyId}
              className="group flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 transition-colors cursor-pointer shrink-0 max-w-[140px] sm:max-w-[220px]"
              title="Click to copy full Order ID"
            >
              <span className="truncate">#{orderIdentifier}</span>
              {copied ? (
                <span className="flex items-center gap-0.5 text-emerald-600 font-sans text-[9px] font-semibold shrink-0">
                  <CheckCheck className="w-3 h-3" />
                  <span>Copied!</span>
                </span>
              ) : (
                <Copy className="w-3 h-3 text-gray-400 group-hover:text-gray-600 shrink-0 transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs shrink-0">
            {payment?.status === "completed" ? (
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-100/80 whitespace-nowrap">
                Paid ({INRSymbol}{cart?.price?.total || 0})
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-medium text-red-600 bg-red-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-red-100 whitespace-nowrap">
                Unpaid
                <button
                  onClick={handleRetry}
                  className="underline ml-1 font-semibold cursor-pointer"
                >
                  Retry
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Clean Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-hide">
          {/* 1. Minimal Live Stepper */}
          <OrderTrackingTimeline
            status={primaryStatus}
            createdAt={createdAt}
            updatedAt={effectiveUpdatedAt}
            deliveryDate={primaryDeliveryDate}
            deliverySlot={primaryDeliverySlot}
            orderId={orderIdentifier}
          />

          {/* 2. Order Items */}
          <div className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-100 space-y-2.5">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Items Ordered ({orders.length})
            </div>

            <div className="divide-y divide-gray-200/60">
              {orders.map((item, index) => {
                const totalCustomizations = [
                  item.customizations.flavor,
                  item.customizations.upgrade,
                  item.customizations.colors,
                  item.customizations.text,
                  item.customizations.enhancement
                ].filter(Boolean).length;

                return (
                  <div key={index} className="py-2 first:pt-0 last:pb-0 flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 relative">
                      {item.img.url && (
                        <NextImage
                          src={item.img.url}
                          alt={item.img.alt || item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs font-semibold text-gray-900 shrink-0">
                          {INRSymbol}{item.pricePerUnit * item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                        <span>Qty: {item.quantity}</span>
                        {item.date && (
                          <>
                            <span>•</span>
                            <span>{item.date} {item.time ? `(${item.time})` : ""}</span>
                          </>
                        )}
                      </div>

                      {/* Customizations if any */}
                      {totalCustomizations > 0 && (
                        <div className="mt-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="inline-flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 transition-colors cursor-pointer">
                                <span>{totalCustomizations} Customization(s)</span>
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="bottom"
                              className="w-60 p-2.5 bg-white rounded-lg border border-gray-200 shadow-md text-[11px] space-y-1 z-[999]"
                            >
                              {item.customizations.flavor && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Flavour:</span>
                                  <span className="font-medium text-gray-800">{item.customizations.flavor.label}</span>
                                </div>
                              )}
                              {item.customizations.upgrade && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Upgrade:</span>
                                  <span className="font-medium text-gray-800">{item.customizations.upgrade.label}</span>
                                </div>
                              )}
                              {item.customizations.colors && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Colors:</span>
                                  <span className="font-medium text-gray-800">{item.customizations.colors}</span>
                                </div>
                              )}
                              {item.customizations.text && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Cake Text:</span>
                                  <span className="font-medium text-gray-800 italic">&quot;{item.customizations.text}&quot;</span>
                                </div>
                              )}
                              {item.customizations.enhancement && item.customizations.enhancement.map((enh, i) => (
                                <div key={i} className="flex justify-between">
                                  <span className="text-gray-400">Addon:</span>
                                  <span className="font-medium text-gray-800">{enh.label} (+{INRSymbol}{enh.price})</span>
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Delivery Address & Receipt Summary */}
          <div className="space-y-3">
            {/* Delivery Address */}
            {address && (
              <div className="text-xs text-gray-600 bg-gray-50/70 rounded-xl p-3 border border-gray-100">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                  Delivery Address
                </div>
                <p className="text-gray-800 text-[11px] leading-snug">
                  {address}{city ? `, ${city}` : ""}
                </p>
              </div>
            )}

            {/* Bill Summary */}
            <div className="text-xs bg-gray-50/70 rounded-xl p-3 border border-gray-100 space-y-1.5">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Bill Summary
              </div>

              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>Item Total</span>
                <span>{INRSymbol}{cart?.price?.content || cart?.price?.total || 0}</span>
              </div>

              {Boolean(cart?.price?.couponDiscount) && (
                <div className="flex justify-between text-emerald-600 text-[11px]">
                  <span>Discount</span>
                  <span>- {INRSymbol}{cart?.price?.couponDiscount}</span>
                </div>
              )}

              {Boolean(cart?.price?.deliveryCharge) && (
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Delivery Charge</span>
                  <span>{INRSymbol}{cart?.price?.deliveryCharge}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-1.5 flex justify-between font-semibold text-xs text-gray-900">
                <span>Total Amount</span>
                <span>{INRSymbol}{cart?.price?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
