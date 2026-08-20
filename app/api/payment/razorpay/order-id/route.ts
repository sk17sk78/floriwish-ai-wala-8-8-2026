export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

type OrderIdDataType = {
  cartId?: string;
  amount?: number;
};

// handle get order
export const POST = async (
  req: NextRequest
): Promise<NextResponse<{ orderId: string | null; message?: string }>> => {
  try {
    const body = (await req.json()) as OrderIdDataType;
    const { cartId, amount: fallbackAmount } = body;

    // Dynamic imports to avoid "self is not defined" error during build
    const connectDB = (await import("@/db/mongoose/connection")).default;
    const models = (await import("@/db/mongoose/models")).default;
    const getRazorpay = (await import("@/app/api/payment/razorpay/razorpay")).default;

    const { Carts } = models;
    const razorpay = getRazorpay();

    await connectDB();

    let payableAmount: number | null = null;

    if (cartId && mongoose.isValidObjectId(cartId)) {
      try {
        const cart = await Carts.findById(cartId);
        if (cart && cart.price) {
          if (typeof cart.price.payable === "number" && cart.price.payable > 0) {
            payableAmount = cart.price.payable;
          } else if (typeof cart.price.total === "number" && cart.price.total > 0) {
            payableAmount = cart.price.total;
          } else {
            const contentTotal = Number(cart.price.content || 0);
            const addonTotal = Number(cart.price.addon || 0);
            const customizationTotal = Number(cart.price.customization || 0);
            const deliveryCharge = Number(cart.price.deliveryCharge || 0);
            const platformFee = Number(cart.price.platformFee || 0);
            const discount = Number(cart.price.couponDiscount || 0);
            const subtotal = contentTotal + addonTotal + customizationTotal + deliveryCharge + platformFee - discount;
            const percentage = cart.price.paymentPercentage || 100;
            if (subtotal > 0) {
              payableAmount = Math.round((subtotal * percentage) / 100);
            }
          }
        }
      } catch (dbErr) {
        console.error("[Razorpay Order ID] DB Cart lookup error:", dbErr);
      }
    }

    // Fallback to client-passed amount if DB lookup was not successful
    if (!payableAmount && typeof fallbackAmount === "number" && fallbackAmount > 0) {
      payableAmount = fallbackAmount;
    }

    if (!payableAmount || payableAmount <= 0) {
      console.error("[Razorpay Order ID] Invalid amount:", { cartId, fallbackAmount, payableAmount });
      return NextResponse.json(
        { orderId: null, message: "Invalid or zero payable amount" },
        { status: 400 }
      );
    }

    const receiptId = cartId && mongoose.isValidObjectId(cartId)
      ? `rcpt_${String(cartId).slice(-8)}_${Date.now().toString().slice(-6)}`
      : `rcpt_${Date.now().toString().slice(-12)}`;

    const order = await razorpay.orders.create({
      amount: Math.round(payableAmount * 100),
      currency: "INR",
      receipt: receiptId
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error: any) {
    console.error("[Razorpay Order ID Error]:", error);
    return NextResponse.json(
      { orderId: null, message: error?.message || "Server Error" },
      { status: 500 }
    );
  }
};
