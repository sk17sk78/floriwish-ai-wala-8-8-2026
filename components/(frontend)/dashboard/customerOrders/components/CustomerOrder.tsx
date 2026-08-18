"use client";

import moment from "moment";
import React, { useState } from "react";
import { Copy, CheckCheck, Truck } from "lucide-react";
import { INRSymbol } from "@/common/constants/symbols";
import { usePayment } from "@/hooks/usePayment/usePayment";
import { SettingProvider } from "@/hooks/useSetting/useSetting";

import CustomerOrderItem from "./CustomerOrderItem";
import CustomerOrderRetryPayment from "./CustomerOrderRetryPayment";
import OrderDetailsPopup from "./OrderDetailsPopup";
import { copyToClipboard } from "@/common/helpers/copyToClipboard";

import { type CartDocument } from "@/common/types/documentation/dynamic/cart";
import { type OrderDocument } from "@/common/types/documentation/dynamic/order";

export default function CustomerOrder({ order }: { order: OrderDocument }) {
  const { _id, id, payment, cart: orderCart, createdAt } = order;
  const { onInitiateRetryPayment } = usePayment();

  const [open, setOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const cart = (orderCart || {}) as CartDocument;
  const isPaid = payment?.status === "completed";
  const orderIdentifier = id || String(_id || "");
  const shortId = orderIdentifier.length > 8 ? orderIdentifier.slice(-8) : orderIdentifier;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (orderIdentifier) {
      copyToClipboard(orderIdentifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          {/* Order Info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-900 text-sm sm:text-base font-semibold">
                Order
              </span>
              <button
                onClick={handleCopyId}
                className="group flex items-center gap-1.5 text-xs font-mono font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 transition-all cursor-pointer select-all max-w-[240px] sm:max-w-none"
                title="Click to copy full Order ID"
              >
                <span className="truncate">#{orderIdentifier}</span>
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-sans text-[10px] font-semibold shrink-0">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 shrink-0 transition-transform group-hover:scale-110" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
              <span>Ordered: <strong className="text-gray-700 font-normal">{moment(createdAt).format("DD MMM YYYY, hh:mm A")}</strong></span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-800 font-medium">
                Total: {INRSymbol}{cart?.price?.total || 0}
                {(cart?.price?.due || 0) > 0 && (
                  <span className="text-red-500 font-normal ml-1">
                    (Due: {INRSymbol}{cart?.price?.due})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center gap-2">
            {isPaid ? (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Paid
              </span>
            ) : (
              <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                Pending
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
              className="cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </button>

            {payment.status === "pending" && (
              <SettingProvider>
                <CustomerOrderRetryPayment
                  orderId={String(_id)}
                  cartId={String((orderCart as CartDocument)._id)}
                  amount={payment.amount}
                  percentage={payment.percentage}
                />
              </SettingProvider>
            )}
          </div>
        </div>

        {/* Product Items Row */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-start overflow-x-auto scrollbar-hide gap-3 w-full">
          {(cart as CartDocument).items.map((item) => (
            <CustomerOrderItem
              key={String(item._id)}
              item={item}
            />
          ))}
        </div>
      </div>

      {/* Details & Live Tracker Modal */}
      <OrderDetailsPopup
        open={open}
        setOpen={setOpen}
        order={order}
        retryPayment={() => {
          onInitiateRetryPayment({
            gateway: "razorpay",
            cartId: String((orderCart as CartDocument)._id),
            orderId: String(_id),
            amount: payment.amount,
            percentage: payment.percentage
          });
        }}
        downloadInvoice={() => {}}
      />
    </section>
  );
}
