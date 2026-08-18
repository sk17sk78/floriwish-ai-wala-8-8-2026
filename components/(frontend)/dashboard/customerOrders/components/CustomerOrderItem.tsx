// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// libraries
import moment from "moment";

// icons
import { Check, Sprout, Truck, X } from "lucide-react";

// constants
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { getCustomVariant } from "@/hooks/useOptimizedCart/utils/getCustomVariant";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ImageDocument } from "@/common/types/documentation/media/image";

export default function CustomerOrderItem({
  item
}: {
  item: CartItemDocument;
}) {
  // variables
  const content = item.content as ContentDocument;
  const customVariant = item.customVariant
    ? getCustomVariant({ content, variantId: item.customVariant })
    : null;
  const name = customVariant ? customVariant.name : content.name;
  const { alt, defaultAlt, url } = customVariant?.image
    ? customVariant.image
    : (content.media.primary as ImageDocument);

  return (
    <Link
      className="grid grid-cols-[50px_1fr] items-center min-w-[260px] gap-2.5"
      href={`${content.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`}
    >
      <div className="aspect-square bg-ivory rounded-lg overflow-hidden relative">
        <NextImage
          className="w-full h-full object-cover object-center"
          src={url}
          alt={alt || defaultAlt || "Content Image"}
          width={60}
          height={60}
          draggable={false}
        />
      </div>

      <section>
        {/* Title -------------------- */}
        <span className="text-charcoal-2 text-sm font-medium">{`${name.slice(0, 22)}${name.length > 25 ? "..." : ""}`}</span>

        {/* Delivery by ---------------- */}
        <span className="flex gap-1 text-xs text-charcoal-3">
          <span>{content.type === "product" ? "Delivery by" : "Event on"}</span>
          {item.delivery.date ? (
            <span className="font-semibold">
              {moment(item.delivery.date).format("Do MMM YYYY")}
            </span>
          ) : (
            <></>
          )}
        </span>

        {/* STATUS ---------------- */}
        <div className="flex items-center justify-start gap-1 mt-0.5">
          {item.status === "completed" ? (
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Check className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Delivered</span>
            </div>
          ) : item.status === "on-the-way" ? (
            <div className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              <Truck className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[11px] font-semibold">Out for Delivery</span>
            </div>
          ) : item.status === "preparing" ? (
            <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              <Sprout className="w-3.5 h-3.5 animate-bounce" />
              <span className="text-[11px] font-semibold">Being Prepared</span>
            </div>
          ) : item.status === "cancelled" ? (
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              <X className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Cancelled</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              <Check className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Order Confirmed</span>
            </div>
          )}
        </div>
      </section>
    </Link>
  );
}
