// libraries
import moment from "moment";

// hooks
import { useEffect } from "react";
import { useDispatch, useSelector } from "@/store/withType";

// redux
import {
  createContentAction,
  selectContent
} from "@/store/features/contents/contentSlice";
import {
  createImageAction,
  selectImage
} from "@/store/features/media/imageSlice";
import {
  createDeliveryTypeAction,
  selectDeliveryType
} from "@/store/features/presets/deliveryTypeSlice";

// components
import NextImage from "@/components/custom/NextImage";
import CartItemAddons from "./CartItemAddons";
import CartItemCustomization from "./CartItemCustomization";
import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { INRSymbol } from "@/common/constants/symbols";

export default function CartItem({
  orderItem: {
    status,
    content: contentId,
    pricePerUnit,
    quantity,
    delivery,
    instruction,
    addons: itemAddons,
    customization
  }
}: {
  orderItem: CartItemDocument;
}) {
  // hooks
  const dispatch = useDispatch();

  // redux states
  const contentStatus = useSelector(selectContent.status);
  const { documents: contents } = useSelector(selectContent.documentList);

  const imageStatus = useSelector(selectImage.status);
  const { documents: images } = useSelector(selectImage.documentList);

  const deliveryTypeStatus = useSelector(selectDeliveryType.status);
  const { documents: deliveryTypes } = useSelector(
    selectDeliveryType.documentList
  );

  // side effects
  useEffect(() => {
    if (contentStatus === "idle") {
      dispatch(createContentAction.fetchDocumentList());
    }
  }, [contentStatus, dispatch]);

  useEffect(() => {
    if (imageStatus === "idle") {
      dispatch(createImageAction.fetchDocumentList());
    }
  }, [imageStatus, dispatch]);

  useEffect(() => {
    if (deliveryTypeStatus === "idle") {
      dispatch(createDeliveryTypeAction.fetchDocumentList());
    }
  }, [deliveryTypeStatus, dispatch]);

  // Robust content resolution
  const isPopulatedContent = typeof contentId === "object" && contentId !== null;
  const content = isPopulatedContent
    ? (contentId as any)
    : contents.find(({ _id }) => String(_id) === String(contentId));

  const contentName = content?.name || (contentId as any)?.name || "Floriwish Product";
  const contentSlug = content?.slug || (contentId as any)?.slug || "";

  // Robust image resolution
  const primaryImageUrl =
    content?.media?.primary?.url ||
    (contentId as any)?.media?.primary?.url ||
    (typeof content?.media?.primary === "string"
      ? images.find(({ _id }) => String(_id) === String(content.media.primary))?.url
      : "") ||
    "";
  const primaryImageAlt =
    content?.media?.primary?.alt ||
    content?.media?.primary?.defaultAlt ||
    contentName;

  // Robust delivery type resolution
  const isPopulatedDeliveryType =
    typeof delivery?.type === "object" && delivery?.type !== null;
  const deliveryType = isPopulatedDeliveryType
    ? (delivery.type as any)
    : deliveryTypes.find(({ _id }) => String(_id) === String(delivery?.type));
  const deliveryTypeName = deliveryType?.name || "";

  // Robust delivery slot resolution
  const isPopulatedDeliverySlot =
    typeof delivery?.slot === "object" && delivery?.slot !== null;
  const deliverySlot = isPopulatedDeliverySlot
    ? (delivery.slot as any)
    : (deliveryType as any)?.timeSlots?.find(
        (ts: any) => String(ts?._id) === String(delivery?.slot)
      );
  const deliverySlotLabel =
    deliverySlot?.label ||
    (typeof delivery?.slot === "string" && delivery.slot.length > 2
      ? delivery.slot
      : "");

  const deliveryDateFormatted = delivery?.date
    ? moment(delivery.date).format("DD MMM YYYY")
    : "";

  return (
    <section className="flex flex-col gap-2 px-0 py-4 border-b border-zinc-200 last:border-b-0">
      <section className="grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr_auto_90px] auto-rows-min gap-x-3.5">
        {/* Product Image */}
        <div className="bg-zinc-100 rounded-xl overflow-hidden relative aspect-square border border-zinc-200 flex items-center justify-center">
          {primaryImageUrl ? (
            <NextImage
              className="w-full h-full object-cover object-center"
              src={primaryImageUrl}
              alt={primaryImageAlt}
              width={120}
              height={120}
              draggable={false}
            />
          ) : (
            <Package className="w-6 h-6 text-zinc-400" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-start gap-1 relative">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] text-zinc-900 leading-snug">
              {contentName}
            </span>
            {contentSlug && (
              <Link
                href={`/product/${contentSlug}`}
                target="_blank"
              rel="noopener noreferrer"
                className="text-zinc-400 hover:text-rose-600 transition-colors"
                title="View product on website"
              >
                <ExternalLink size={13} />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
            <span>
              {INRSymbol}
              {pricePerUnit}
            </span>
            <span className="text-zinc-400">×</span>
            <span>{quantity >= 1 ? `Qty: ${quantity}` : "Qty: 1"}</span>
            <span className="text-zinc-400">|</span>
            <span className="text-emerald-700 font-bold">
              Total: {INRSymbol}{Number(pricePerUnit) * Number(quantity || 1)}
            </span>
          </div>

          {/* Delivery Date & Time */}
          {deliveryDateFormatted && (
            <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-1 mt-0.5">
              <span className="font-semibold text-zinc-500">Delivery:</span>
              <span className="font-medium text-zinc-800">{deliveryDateFormatted}</span>
              {deliverySlotLabel && (
                <span className="text-zinc-600">({deliverySlotLabel})</span>
              )}
            </div>
          )}

          {/* Customizations */}
          {customization && (
            <div className="mt-1">
              <CartItemCustomization customization={customization} />
            </div>
          )}

          {/* Special Instructions */}
          {instruction && instruction.trim().length > 0 && (
            <div className="text-xs text-zinc-600 bg-amber-50/70 border border-amber-100 rounded-lg p-1.5 mt-1">
              <span className="font-semibold text-amber-900">Note:</span> {instruction}
            </div>
          )}
        </div>

        {/* Delivery Type Tag */}
        <div className="max-sm:hidden flex flex-col justify-start">
          {deliveryTypeName && (
            <div className="text-rose-800 text-[11px] font-bold bg-rose-50 border border-rose-200 py-1 px-2.5 rounded-lg h-fit">
              {deliveryTypeName}
            </div>
          )}
        </div>

        {/* Price Column */}
        <div className="font-bold text-right text-zinc-900 text-sm max-sm:hidden">
          {INRSymbol}{Number(pricePerUnit) * Number(quantity || 1)}
        </div>
      </section>

      {/* Addons List */}
      {itemAddons && Boolean(itemAddons.length) && (
        <div className="mt-1 pl-2 sm:pl-4 border-l-2 border-rose-100">
          <CartItemAddons itemAddons={itemAddons} />
        </div>
      )}
    </section>
  );
}
