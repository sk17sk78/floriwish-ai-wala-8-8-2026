// hooks
import { useEffect } from "react";
import { useDispatch, useSelector } from "@/store/withType";

// redux
import {
  createAddonAction,
  selectAddon
} from "@/store/features/contents/addonSlice";
import {
  createImageAction,
  selectImage
} from "@/store/features/media/imageSlice";

// components
import NextImage from "@/components/custom/NextImage";
import { Gift } from "lucide-react";

// types
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { INRSymbol } from "@/common/constants/symbols";

export default function CartItemAddon({
  itemAddon: { addon: addonId, pricePerUnit, quantity, customizationOption }
}: {
  itemAddon: CartItemAddonDocument;
}) {
  const dispatch = useDispatch();

  const addonStatus = useSelector(selectAddon.status);
  const { documents: addons } = useSelector(selectAddon.documentList);

  const imageStatus = useSelector(selectImage.status);
  const { documents: images } = useSelector(selectImage.documentList);

  const isPopulatedAddon = typeof addonId === "object" && addonId !== null;
  const addon = isPopulatedAddon
    ? (addonId as any)
    : addons.find(({ _id }) => String(_id) === String(addonId));

  const addonName = addon?.name || (addonId as any)?.name || "Addon Item";
  const imageUrl =
    addon?.image?.url ||
    (addonId as any)?.image?.url ||
    (typeof addon?.image === "string"
      ? images.find(({ _id }) => String(_id) === String(addon.image))?.url
      : "") ||
    "";

  useEffect(() => {
    if (imageStatus === "idle") {
      dispatch(createImageAction.fetchDocumentList());
    }
  }, [imageStatus, dispatch]);

  useEffect(() => {
    if (addonStatus === "idle") {
      dispatch(createAddonAction.fetchDocumentList());
    }
  }, [addonStatus, dispatch]);

  return (
    <section className="p-2 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-[40px_1fr] gap-x-2.5 items-center my-1">
      <div className="relative overflow-hidden aspect-square bg-zinc-200 rounded-lg flex items-center justify-center">
        {imageUrl ? (
          <NextImage
            className="w-full h-full object-cover object-center"
            src={imageUrl}
            alt={addonName}
            width={60}
            height={60}
            draggable={false}
          />
        ) : (
          <Gift className="w-4 h-4 text-zinc-400" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="flex items-center gap-1.5 text-xs text-zinc-800 font-semibold">
          <span>{addonName}</span>
          {quantity > 1 && (
            <span className="text-zinc-500 font-normal">×{quantity}</span>
          )}
        </span>
        <span className="text-[11px] font-bold text-zinc-600">
          {INRSymbol}{pricePerUnit} {quantity > 1 ? `(${INRSymbol}${Number(pricePerUnit) * Number(quantity)})` : ""}
        </span>
      </div>
    </section>
  );
}
