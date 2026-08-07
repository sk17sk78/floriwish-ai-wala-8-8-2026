// types
import { type AdvancePaymentDocument } from "@/common/types/documentation/presets/advancePayment";
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type CartPriceDocument } from "@/common/types/documentation/nestedDocuments/cartPrice";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCategoryDocument } from "@/common/types/documentation/categories/contentCategory";
import { type CategoryChargesDocument } from "@/common/types/documentation/nestedDocuments/categoryCharges";
import { type CouponDocument } from "@/common/types/documentation/contents/coupon";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";

export const calculateCartPrice = ({
  items,
  paymentPercentage,
  coupon
}: {
  items: CartItemDocument[];
  paymentPercentage: number;
  coupon: CouponDocument | null;
}): CartPriceDocument => {
  const newMaxPaymentPercentage =
    items.reduce((max, { content }) => {
      const contentDoc = content as ContentDocument;

      return Math.max(
        (
          (contentDoc?.category?.primary as ContentCategoryDocument)?.charges
            ?.advancePayment as AdvancePaymentDocument
        )?.value || 100,
        max
      );
    }, 0) || 100;

  const content =
    items.reduce(
      (total, { pricePerUnit, quantity }) => total + pricePerUnit * quantity,
      0
    ) || 0;
  const addon =
    items.reduce(
      (total, { addons }) =>
        total +
        addons!.reduce(
          (itemAddonTotal, { pricePerUnit, quantity }) =>
            itemAddonTotal + pricePerUnit * quantity,
          0
        ),
      0
    ) || 0;
  const customization = items.reduce(
    (total, { customization }) =>
      total +
      (customization?.enhancement?.items?.reduce(
        (enhancementTotal, { price }) => enhancementTotal + price,
        0
      ) || 0) +
      (customization?.upgrade?.price || 0) +
      (customization?.flavour?.price || 0),
    0
  );
  const deliveryCharge = items.reduce(
    (max, { content, delivery: { type } }) => {
      const contentDoc = content as ContentDocument;
      const price =
        contentDoc?.availability?.availableAt === "all-india"
          ? contentDoc?.delivery?.charge || 0
          : (type as DeliveryTypeDocument)?.price || 0;

      return Math.max(
        contentDoc?.availability?.availableAt === "all-india"
          ? (contentDoc?.delivery?.charge as number) || 0
          : price,
        max
      );
    },
    0
  );

  // Calculate Category Platform Fee from primary category of items in cart
  const platformFee = items.reduce(
    (max, { content }) => {
      const contentDoc = content as ContentDocument;
      const primaryCat = contentDoc?.category?.primary as ContentCategoryDocument;
      const fee =
        (primaryCat?.charges as CategoryChargesDocument)?.deliveryCharge ||
        (primaryCat?.charges as any)?.deliveryCharge ||
        0;

      return Math.max(Number(fee) || 0, max);
    },
    0
  );

  const isCouponApplicable =
    coupon && coupon.minimumOrderAmount <= content + customization;

  const couponDiscount = isCouponApplicable
    ? (() => {
        if (coupon.type === "free-delivery") {
          return deliveryCharge;
        } else {
          if (coupon.discount!.type === "fixed") {
            return coupon.discount!.limit;
          } else {
            return Math.min(
              Math.ceil(
                (content + customization) * (coupon.discount!.percentage! / 100)
              ),
              coupon.discount!.limit
            );
          }
        }
      })()
    : 0;

  const total =
    content + addon + customization + deliveryCharge + platformFee - couponDiscount;

  const payable =
    paymentPercentage !== newMaxPaymentPercentage || paymentPercentage === 100
      ? total
      : Math.ceil((content + customization) * (paymentPercentage / 100)) +
        addon +
        deliveryCharge +
        platformFee;
  const due = total - payable;

  return {
    content,
    addon,
    customization,
    deliveryCharge,
    platformFee,
    total,
    paymentPercentage:
      paymentPercentage === newMaxPaymentPercentage
        ? newMaxPaymentPercentage
        : 100,
    couponDiscount,
    payable,
    due
  } as CartPriceDocument;
};
