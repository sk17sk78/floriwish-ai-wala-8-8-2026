// utils
import { lazy, memo } from "react";

// components
import { Dialog, DialogContent } from "@/components/ui/dialog";
const LazyContentAddon = lazy(() => import("./components/ContentAddonClient"));
import { Suspense } from "react";

// types
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { type ContentAddonDocument } from "@/common/types/documentation/nestedDocuments/contentAddon";
import { type CartItemCustomizationDocument } from "@/common/types/documentation/nestedDocuments/cartItemCustomization";
import { type ContentCustomizationDocument } from "@/common/types/documentation/nestedDocuments/contentCustomization";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type ContentPriceDocument } from "@/common/types/documentation/nestedDocuments/contentPrice";
import { type CityDocument } from "@/common/types/documentation/presets/city";
import { type CartItemDeliveryDocument } from "@/common/types/documentation/nestedDocuments/cartItemDelivery";

function ContentAddonDialog({
  showAddon,
  cartItemPrice,
  cartItemAddons,
  contentAddons,
  onChangeShowAddon,
  onChangeCartItemAddon,
  onBookNow,
  slug,
  contentName,
  contentImage,
  contentPrice,
  selectedCity,
  cartItemCustomization,
  contentCustomization,
  cartItemDelivery,
  onChangeCartItemCustomization
}: {
  showAddon: boolean;
  cartItemPrice: number;
  contentAddons: ContentAddonDocument[];
  cartItemAddons: CartItemAddonDocument[];
  onChangeShowAddon: (showAddon: boolean) => void;
  onChangeCartItemAddon: (cartItemAddons: CartItemAddonDocument[]) => void;
  onBookNow: () => void;
  slug: string;
  contentName: string;
  contentImage: ImageDocument;
  contentPrice: ContentPriceDocument;
  selectedCity: CityDocument | null;
  cartItemCustomization: CartItemCustomizationDocument;
  contentCustomization: ContentCustomizationDocument;
  cartItemDelivery: CartItemDeliveryDocument;
  onChangeCartItemCustomization: (
    cartItemCustomization: CartItemCustomizationDocument
  ) => void;
}) {
  return (
    <Dialog
      open={showAddon}
      onOpenChange={onChangeShowAddon}
    >
      <DialogContent className="p-0 outline-none border-none bg-transparent min-w-fit z-[10000]">
        <section
          className={`relative bg-ivory sm:bg-ivory-1 max-sm:w-[100dvw] max-sm:h-[100dvh] sm:rounded-2xl overflow-hidden sm:w-[95dvw] lg:w-[80dvw] sm:max-w-[1000px] sm:h-[85vh] lg:h-auto lg:aspect-[20/11] grid grid-cols-1 grid-rows-[auto_1fr]`}
        >
          <Suspense fallback={<></>}>
            <LazyContentAddon
              cartItemPrice={cartItemPrice}
              cartItemAddons={cartItemAddons}
              contentAddons={contentAddons}
              onChangeCartItemAddon={onChangeCartItemAddon}
              onBookNow={onBookNow}
              slug={slug}
              contentName={contentName}
              contentImage={contentImage}
              contentPrice={contentPrice}
              selectedCity={selectedCity}
              cartItemCustomization={cartItemCustomization}
              contentCustomization={contentCustomization}
              cartItemDelivery={cartItemDelivery}
              onChangeCartItemCustomization={onChangeCartItemCustomization}
            />
          </Suspense>
        </section>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ContentAddonDialog);
