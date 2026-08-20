// libraries
import moment from "moment";

// DB connection
import connectDB from "@/db/mongoose/connection";

// models
import MODELS from "@/db/mongoose/models";
const { Customers, Carts, Orders, Coupons } = MODELS;

// types
import { type OrderDocument } from "@/common/types/documentation/dynamic/order";
import { type OrderPaymentGatewayDocument } from "@/common/types/documentation/nestedDocuments/orderPaymentGateway";

// Generates a unique order ID: FW + full timestamp (ms) + 4-char random hex
// Collision probability: ~1 in 65536 per millisecond — effectively zero in practice
const generateOrderId = (): string => {
  const ts = moment().format("YYYYMMDDHHmmssSSS"); // Full year + milliseconds
  const rand = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `FW${ts}${rand}`;
};

export const generateOrder = async (
  orderData: Partial<OrderDocument>
): Promise<boolean> => {
  // Ensure DB is connected before any queries run (was accidentally commented out)
  await connectDB();

  let isOrderGenerated = false;
  let attemptCount = 1;

  const { payment, cart: cartId, createdBy, updatedBy } = orderData;

  while (isOrderGenerated === false && attemptCount <= 10) {
    // Exponential backoff: wait before retry to avoid hammering DB and causing duplicate writes
    if (attemptCount > 1) {
      await new Promise((resolve) => setTimeout(resolve, 50 * attemptCount));
    }
    try {
      // DB query
      // await session.withTransaction(async () => {
      const cart = await Carts.findByIdAndUpdate(
        cartId as string,
        {
          isOrdered: true
        },
        {
          new: true,
          // session
        }
      );

      const newOrder = new Orders({
        id: generateOrderId(),
        payment,
        cart,
        createdBy,
        updatedBy
      });

      // const order = await newOrder.save({
      //   session
      // });

      const order = await newOrder.save();

      let customerId: any = cart?.customer;
      if (!customerId && (cart?.checkout?.contact?.mobileNumber || cart?.checkout?.contact?.mail)) {
        try {
          const mob = cart.checkout?.contact?.mobileNumber?.trim();
          const mail = cart.checkout?.contact?.mail?.trim();
          const existingCust = await Customers.findOne({
            $or: [
              ...(mob ? [{ mobileNumber: mob }] : []),
              ...(mail ? [{ mail: mail }] : [])
            ]
          });
          if (existingCust) {
            customerId = existingCust._id;
          }
        } catch (findErr) {
          console.error("Error finding customer for order:", findErr);
        }
      }

      if (customerId) {
        try {
          await Customers.findByIdAndUpdate(
            customerId,
            {
              $unset: {
                cart: 1
              },
              $push: {
                orders: order._id
              }
            },
            {
              new: true
            }
          );
        } catch (custUpdateErr) {
          console.error("Customer order link update error:", custUpdateErr);
        }
      }

      // await session.commitTransaction();

      // Increment coupon usage & check auto-expiry
      if (cart?.coupon) {
        try {
          const couponId = typeof cart.coupon === "object" && cart.coupon !== null ? (cart.coupon as any)._id || cart.coupon : cart.coupon;
          if (couponId && Coupons) {
            const couponDoc = await Coupons.findById(couponId);
            if (couponDoc) {
              const newUsedCount = (couponDoc.usedCount || 0) + 1;
              const maxUses = couponDoc.maxTotalUses || 0;
              const isLimitReached = maxUses > 0 && newUsedCount >= maxUses;
              await Coupons.findByIdAndUpdate(couponId, {
                $inc: { usedCount: 1 },
                ...(isLimitReached ? { isActive: false } : {})
              });
            }
          }
        } catch (couponErr) {
          console.error("Coupon usage update error:", couponErr);
        }
      }

      isOrderGenerated = true;
      // });
    } catch (error: any) {
      attemptCount += 1;
    }
  }

  // session.endSession();

  if (!isOrderGenerated) {
  }

  return isOrderGenerated;
};

export const updateOrder = async (
  orderId: string,
  gateway: Partial<OrderPaymentGatewayDocument>
): Promise<boolean> => {
  // create new session
  await connectDB();
  // const session = await (await connectDB()).startSession();

  let isOrderUpdated = false;
  // let attemptCount = 1;

  // while (isOrderUpdated === false && attemptCount <= 5) {
  try {
    // DB query
    // await session.withTransaction(async () => {
    const order = await Orders.findByIdAndUpdate(
      orderId,
      {
        "payment.status": "completed",
        "payment.gateway": gateway
      },
      {
        new: true
        // session
      }
    );

    // await session.commitTransaction();

    isOrderUpdated = true;
    // });
  } catch (error: any) {
    // attemptCount += 1;
    // }
  }

  // session.endSession();

  if (!isOrderUpdated) {
  }

  return isOrderUpdated;
};
