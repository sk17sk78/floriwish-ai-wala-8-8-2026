export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

type OrderIdDataType = {
  cartId: string;
};

// handle get order
export const POST = async (
  req: NextRequest
): Promise<NextResponse<{ orderId: string | null }>> => {
  try {
    const { cartId } = (await req.json()) as OrderIdDataType;

    // Dynamic imports to avoid "self is not defined" error during build
    const connectDB = (await import("@/db/mongoose/connection")).default;
    const models = (await import("@/db/mongoose/models")).default;
    const getRazorpay = (await import("@/app/api/payment/razorpay/razorpay")).default;

    const { Carts } = models;
    const razorpay = getRazorpay();

    await connectDB();

    const amount = (await Carts.findById(cartId))?.price?.payable || null;

    if (!amount) {
      return NextResponse.json({ orderId: null }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ orderId: null }, { status: 500 });
  }
};
