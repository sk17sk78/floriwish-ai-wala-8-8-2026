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
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  const newMaxPaymentPercentage =
    safeItems.reduce((max, item) => {
      const contentDoc = item?.content as ContentDocument | undefined;
      const primaryCat = contentDoc?.category?.primary as ContentCategoryDocument | undefined;
      const advPayment = (primaryCat?.charges as CategoryChargesDocument | undefined)?.advancePayment as AdvancePaymentDocument | undefined;

      return Math.max(advPayment?.value || 100, max);
    }, 0) || 100;

  const content =
    safeItems.reduce(
      (total, item) => total + (Number(item?.pricePerUnit) || 0) * (Number(item?.quantity) || 1),
      0
    ) || 0;

  const addon =
    safeItems.reduce(
      (total, item) =>
        total +
        (Array.isArray(item?.addons)
          ? item.addons.reduce(
              (itemAddonTotal, addonItem) =>
                itemAddonTotal + (Number(addonItem?.pricePerUnit) || 0) * (Number(addonItem?.quantity) || 1),
              0
            )
          : 0),
      0
    ) || 0;

  const customization = safeItems.reduce(
    (total, item) =>
      total +
      (Array.isArray(item?.customization?.enhancement?.items)
        ? item.customization.enhancement.items.reduce(
            (enhancementTotal, enhancementItem) => enhancementTotal + (Number(enhancementItem?.price) || 0),
            0
          )
        : 0) +
      (Number(item?.customization?.upgrade?.price) || 0) +
      (Number(item?.customization?.flavour?.price) || 0),
    0
  ) || 0;

  const deliveryCharge = safeItems.reduce(
    (max, item) => {
      const contentDoc = item?.content as ContentDocument | undefined;
      const deliveryType = item?.delivery?.type as DeliveryTypeDocument | undefined;
      const isAllIndia = contentDoc?.availability?.availableAt === "all-india";
      const price = isAllIndia
        ? Number(contentDoc?.delivery?.charge) || 0
        : Number(deliveryType?.price) || 0;

      return Math.max(price, max);
    },
    0
  ) || 0;

  // Calculate Category Platform Fee from primary category of items in cart
  const platformFee = safeItems.reduce(
    (max, item) => {
      const contentDoc = item?.content as ContentDocument | undefined;
      const primaryCat = contentDoc?.category?.primary as ContentCategoryDocument | undefined;
      const fee =
        (primaryCat?.charges as CategoryChargesDocument | undefined)?.deliveryCharge ||
        (primaryCat?.charges as any)?.deliveryCharge ||
        0;

      return Math.max(Number(fee) || 0, max);
    },
    0
  ) || 0;

  const isCouponApplicable =
    coupon && coupon.minimumOrderAmount <= content + customization;

  const couponDiscount = isCouponApplicable
    ? (() => {
        if (coupon.type === "free-delivery") {
          return deliveryCharge;
        } else {
          const discount = coupon.discount;
          if (!discount) return 0;
          if (discount.type === "fixed") {
            return Number(discount.limit) || 0;
          } else {
            const percentage = Number(discount.percentage) || 0;
            const limit = Number(discount.limit) || 0;
            const calculated = Math.ceil((content + customization) * (percentage / 100));
            return limit > 0 ? Math.min(calculated, limit) : calculated;
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
  const due = Math.max(0, total - payable);

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
