export const dynamic = "force-dynamic";

// libraries
import crypto from "crypto";
import mongoose from "mongoose";

// connection
import connectDB from "@/db/mongoose/connection";

// models
import models from "@/db/mongoose/models";
const { Carts } = models;

// constants
import { PAYU_KEY, PAYU_SALT } from "@/common/constants/environmentVariables";

// utils
import { NextRequest, NextResponse } from "next/server";

type GenerateHashDataType = {
  cartId?: string;
  amount?: number;
  txnid: string;
  productinfo: string;
  firstname: string;
  email: string;
};

// handle get order
export const POST = async (
  req: NextRequest
): Promise<NextResponse<{ hash: string | null; message?: string }>> => {
  try {
    const { cartId, amount: fallbackAmount, txnid, productinfo, firstname, email } =
      (await req.json()) as GenerateHashDataType;

    await connectDB();

    let amount: number | null = null;

    if (cartId && mongoose.isValidObjectId(cartId)) {
      try {
        const cart = await Carts.findById(cartId);
        if (cart && cart.price) {
          if (typeof cart.price.payable === "number" && cart.price.payable > 0) {
            amount = cart.price.payable;
          } else if (typeof cart.price.total === "number" && cart.price.total > 0) {
            amount = cart.price.total;
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
              amount = Math.round((subtotal * percentage) / 100);
            }
          }
        }
      } catch (err) {
        console.error("[PayU Hash] DB cart lookup error:", err);
      }
    }

    if (!amount && typeof fallbackAmount === "number" && fallbackAmount > 0) {
      amount = fallbackAmount;
    }

    if (!amount || amount <= 0) {
      console.error("[PayU Hash] Invalid amount:", { cartId, fallbackAmount, amount });
      return NextResponse.json({ hash: null, message: "Invalid amount" }, { status: 400 });
    }

    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return NextResponse.json({ hash }, { status: 200 });
  } catch (error: any) {
    console.error("[PayU Hash Error]:", error);
    return NextResponse.json({ hash: null, message: error?.message || "Server Error" }, { status: 500 });
  }
};
