// constants
import { DOMAIN } from "@/common/constants/domain";
import { INRSymbol } from "@/common/constants/symbols";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { COMPANY_NAME } from "@/common/constants/companyDetails";
import { INITIAL_CUSTOMIZATION } from "../constants/initialCustomization";
import { INITIAL_DELIVERY } from "../constants/initialDelivery";

// utils
import { setLocalStorage } from "@/common/utils/storage/local";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  useRef,
} from "react";
import useTimeRemaining from "@/hooks/useTimeRemaining";
import { getContentPrice } from "../utils/getContentPrice";
import { getCartItem } from "./utils/getCartItem";

// hooks
import { useToast } from "@/components/ui/use-toast";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Share2,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Zap,
  X,
} from "lucide-react";

// components
import ContentDetailInfo from "./components/ContentDetailInfo";
import ContentDetailPrice from "./components/ContentDetailPrice";
import ContentDetailRating from "./components/ContentDetailRating";
import ContentDetailTitleSection from "./components/ContentDetailTitleSection";
import ContentDetailVariantSections from "./components/ContentDetailVariantSection";
import ContentDetailActionBadge from "./components/ContentDetailActionBadge";
import ContentDetailAddCartButton from "./components/ContentDetailAddCartButton";
import ContentDetailBuyNowButton from "./components/ContentDetailBuyNowButton";
import ContentDetailCityCard from "./components/ContentDetailCityCard";
import ContentDetailMobileBadge from "./components/ContentDetailMobileBadge";
import ContentHorizontalSpacing from "../spacing/ContentHorizontalSpacing";
import MobileStickyFooter from "./components/MobileStickyFooter";
import ContentDetailCouponsDialog from "./components/ContentDetailCouponsDialog";
import ContentDetailCouponsDrawer from "./components/ContentDetailCouponsDrawer";
import { WhatsappSVG } from "@/common/svgs/svg";
import { whatsappContact } from "@/common/utils/_contactDetails";
import Link from "next/link";

const LazyContentAddonDialog = lazy(
  () => import("../addon/ContentAddonDialog"),
);
const LazyContentCustomizeUploadText = lazy(
  () => import("../customize/components/ContentCustomizeUploadText"),
);
const LazyContentCustomizeBalloonColor = lazy(
  () => import("../customize/components/ContentCustomizeBalloonColor"),
);
const LazyContentCustomizeEnhancements = lazy(
  () => import("../customize/components/ContentCustomizeEnhancements"),
);
const LazyContentCustomizeFlavour = lazy(
  () => import("../customize/components/ContentCustomizeFlavour"),
);
const LazyContentCustomizeUpgrade = lazy(
  () => import("../customize/components/ContentCustomizeUpgrade"),
);
const LazyContentCustomizeUploadImage = lazy(
  () => import("../customize/components/ContentCustomizeUploadImage"),
);
import { SlidersHorizontal } from "lucide-react";

// types
import { type CouponDocument } from "@/common/types/documentation/contents/coupon";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { type CartItemCustomizationDocument } from "@/common/types/documentation/nestedDocuments/cartItemCustomization";
import { type CartItemDeliveryDocument } from "@/common/types/documentation/nestedDocuments/cartItemDelivery";
import { type ContentCustomVariantDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariant";
import { type ContentCustomVariantCategoryDocument } from "@/common/types/documentation/nestedDocuments/contentCustomVariantCategory";
import { type UnitDocument } from "@/common/types/documentation/presets/unit";
import { type ContentDeliverySlotDocument } from "@/common/types/documentation/nestedDocuments/contentDeliverySlot";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";

function ContentDetail({
  content,
  showViewSimilarButton,
  onClickViewSimilar,
  onChangeCustomVariant,
  onChangeReferenceVariant,
}: {
  content: ContentDocument;
  showViewSimilarButton?: boolean;
  onClickViewSimilar?: () => void;
  onChangeCustomVariant: (
    customVariant: ContentCustomVariantDocument | null,
  ) => void;
  onChangeReferenceVariant: (referenceVariant: ContentDocument | null) => void;
}) {
  const { push } = useRouter();
  const contentDeliveryId = useId();
  const { toast } = useToast();
  const {
    isMobile,
    location: {
      data: { selectedCity },
      methods: { onToggleShowCitySelector },
    },
    cart: {
      method: { onAddItem: onAddToCart },
    },
  } = useAppStates();

  const [customVariantCategory, setCustomVariantCategory] =
    useState<ContentCustomVariantCategoryDocument | null>(null);
  const [customVariant, setCustomVariant] =
    useState<ContentCustomVariantDocument | null>(null);
  const [referenceVariant, setReferenceVariant] =
    useState<ContentDocument | null>(null);
  const [delivery, setDelivery] =
    useState<CartItemDeliveryDocument>(INITIAL_DELIVERY);
  const [customization, setCustomization] =
    useState<CartItemCustomizationDocument>(INITIAL_CUSTOMIZATION);
  const [addons, setAddons] = useState<CartItemAddonDocument[]>([]);

  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [showDeliveryStatus, setShowDeliveryStatus] = useState<boolean>(false);
  const [showAddon, setShowAddon] = useState<boolean>(false);

  const contentCustomization = useMemo(
    () =>
      referenceVariant
        ? referenceVariant.customization
        : content.customization,
    [content.customization, referenceVariant],
  );

  const contentAddons = useMemo(
    () => (referenceVariant ? referenceVariant.addons : content.addons),
    [content.addons, referenceVariant],
  );

  const hasCustomizationOptions = useMemo(() => {
    if (!contentCustomization) return false;
    return Boolean(
      contentCustomization.enhancement ||
        contentCustomization.upgrade ||
        contentCustomization.flavour ||
        contentCustomization.uploadText ||
        contentCustomization.balloonColor ||
        contentCustomization.uploadImage,
    );
  }, [contentCustomization]);
  const [showCoupons, setShowCoupons] = useState<boolean>(false);
  const [isBuyNow, setIsBuyNow] = useState<boolean>(false);
  const isBuyNowRef = useRef<boolean>(false);
  const [showAllDetails, setShowAllDetails] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const variantCategories = useMemo(() => content.variants, [content.variants]);

  const slug = useMemo(
    () => (referenceVariant ? referenceVariant.slug : content.slug),
    [content.slug, referenceVariant],
  );

  const contentImage = useMemo(
    () =>
      customVariant && customVariant.image
        ? (customVariant.image as ImageDocument)
        : referenceVariant
          ? (referenceVariant.media.primary as ImageDocument)
          : (content.media.primary as ImageDocument),
    [content.media.primary, customVariant, referenceVariant],
  );

  const name = useMemo(
    () =>
      customVariantCategory && customVariant
        ? `${content.name} (${customVariantCategory.options.unit ? `${customVariant.value}${(customVariantCategory.unit as UnitDocument).abbr}` : `${customVariant.label}`})`
        : referenceVariant
          ? referenceVariant.name
          : content.name,
    [content.name, customVariantCategory, customVariant, referenceVariant],
  );

  const edible = useMemo(
    () => (referenceVariant ? referenceVariant.edible : content.edible),
    [content.edible, referenceVariant],
  );

  const price = useMemo(
    () =>
      customVariant
        ? customVariant.price!
        : referenceVariant
          ? referenceVariant.price!
          : content.price!,
    [content.price, customVariant, referenceVariant],
  );

  const pricePerUnit = useMemo(
    () => getContentPrice({ price, city: selectedCity }).price,
    [price, selectedCity],
  );

  const rating = useMemo(
    () =>
      referenceVariant
        ? referenceVariant.quality?.rating
        : content.quality?.rating,
    [content.quality?.rating, referenceVariant],
  );

  const contentAvailability = useMemo(
    () =>
      referenceVariant ? referenceVariant.availability! : content.availability!,
    [content.availability, referenceVariant],
  );

  const contentDelivery = useMemo(
    () => (referenceVariant ? referenceVariant.delivery! : content.delivery!),
    [content.delivery, referenceVariant],
  );

  const info = useMemo(
    () => (referenceVariant ? referenceVariant.detail! : content.detail!),
    [content.detail, referenceVariant],
  );

  const lastDeliverySlotTime = useMemo(() => {
    let maxStartTime = "";

    if (!contentDelivery?.slots || !Array.isArray(contentDelivery.slots)) {
      return maxStartTime;
    }

    (contentDelivery.slots as ContentDeliverySlotDocument[]).forEach(
      ({ type, timeSlots }) => {
        const deliveryType = type as DeliveryTypeDocument;

        deliveryType.timeSlots
          .filter(({ _id }) => (timeSlots as string[]).includes(String(_id)))
          .forEach(({ startTime }) => {
            if (maxStartTime) {
              const [hours, minutes] = maxStartTime.split(":").map(Number);
              const [newHours, newMinutes] = startTime.split(":").map(Number);

              if (newHours === hours) {
                if (newMinutes > minutes) {
                  maxStartTime = startTime;
                }
              } else if (newHours > hours) {
                maxStartTime = startTime;
              }
            } else {
              maxStartTime = startTime;
            }
          });
      },
    );

    return maxStartTime;
  }, [contentDelivery]);

  const {
    hours,
    minutes,
    seconds,
    date: deliveryDate,
  } = useTimeRemaining(
    (contentDelivery?.processingTime as ProcessingTimeDocument)?.hours || 0,
    lastDeliverySlotTime,
  );

  const remainingTime = `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

  const isToday =
    deliveryDate &&
    new Date(deliveryDate).toDateString() === new Date().toDateString();
  const isTomorrow =
    deliveryDate &&
    new Date(deliveryDate).toDateString() ===
      new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();

  const isAvailable = useMemo(
    () =>
      contentAvailability.availableAt === "cities"
        ? contentAvailability.limitAvailability
          ? Boolean(
              contentAvailability?.cities?.find(
                (cityId) => String(cityId) === String(selectedCity?._id),
              ),
            )
          : true
        : true,
    [contentAvailability, selectedCity],
  );

  const cartItemPrice = useMemo(
    () =>
      getContentPrice({ price, city: selectedCity }).price +
      (customization?.enhancement?.items?.reduce(
        (enhancementTotal, enhancementItem) =>
          (enhancementTotal += enhancementItem.price),
        0,
      ) || 0) +
      (customization?.upgrade?.price || 0) +
      (customization?.flavour?.price || 0),
    [
      customization?.enhancement?.items,
      customization?.upgrade?.price,
      customization?.flavour?.price,
      price,
      selectedCity,
    ],
  );

  const cartItem = useMemo(
    () =>
      getCartItem({
        content: referenceVariant ? referenceVariant : content,
        customVariant: customVariant
          ? (String(customVariant._id))
          : undefined,
        titleIfCustomVariant: customVariant ? name : undefined,
        pricePerUnit,
        delivery,
        customization,
        addons,
      }),
    [
      addons,
      content,
      customization,
      delivery,
      customVariant,
      name,
      pricePerUnit,
      referenceVariant,
    ],
  );

  const handleChangeReferenceVariant = useCallback(
    (newReferenceVariant: ContentDocument | null) => {
      onChangeReferenceVariant(newReferenceVariant);
      setReferenceVariant(newReferenceVariant);
      setCustomization(INITIAL_CUSTOMIZATION);
      setAddons([]);
    },
    [onChangeReferenceVariant],
  );

  const handleChangeCustomVariant = useCallback(
    (customVariantId: string | null) => {
      const newCustomVariantCategory = customVariantId
        ? content.variants!.find(
            (variant) =>
              variant.type === "custom" &&
              variant.custom?.variants.find(
                ({ _id }) => String(_id) === String(customVariantId),
              ),
          )!.custom!
        : null;

      const newCustomVariant = newCustomVariantCategory
        ? newCustomVariantCategory.variants.find(
            ({ _id }) => String(_id) === String(customVariantId),
          )!
        : null;

      onChangeCustomVariant(newCustomVariant);
      setCustomVariantCategory(newCustomVariantCategory);
      setCustomVariant(newCustomVariant);
    },
    [content.variants, onChangeCustomVariant],
  );

  const handleProceedToCart = useCallback(
    (isBuyNowOverride?: boolean) => {
      onAddToCart(cartItem);
      toast({
        variant: "success",
        title: "Added To Cart",
      });
      setShowAddon(false);
      if (isBuyNowOverride ?? isBuyNowRef.current) {
        push("/cart");
      }
    },
    [cartItem, onAddToCart, push, toast],
  );

  const handleScrollToDelivery = useCallback(() => {
    const target = document.getElementById(
      contentDeliveryId,
    ) as HTMLElement | null;
    target?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "center",
    });
  }, [contentDeliveryId]);

  const handleBookNow = useCallback(
    (isBuyNowOverride?: boolean, skipAddons?: boolean) => {
      isBuyNowRef.current = isBuyNowOverride ?? false;
      if (contentAvailability.availableAt === "all-india") {
        if (contentAddons?.length && !skipAddons) {
          setShowAddon(true);
        } else {
          handleProceedToCart(isBuyNowOverride);
        }
      } else {
        if (selectedCity && isAvailable) {
          if (contentAddons?.length && !skipAddons) {
            setShowAddon(true);
          } else {
            handleProceedToCart(isBuyNowOverride);
          }
        } else {
          if (!selectedCity) {
            onToggleShowCitySelector(true);
            toast({
              variant: "warning",
              title: "Please Select Your City",
              description: "Select your city to check product availability and proceed.",
            });
          } else {
            handleScrollToDelivery();
            setShowDeliveryStatus(true);
            window.dispatchEvent(new CustomEvent("shake-city-selector"));
            toast({
              variant: "warning",
              title: "Not Available At Selected City",
            });
          }
        }
      }
    },
    [
      isAvailable,
      selectedCity,
      onToggleShowCitySelector,
      handleProceedToCart,
      contentAddons,
      contentAvailability.availableAt,
      handleScrollToDelivery,
      toast,
    ],
  );

  const handleAddToCartClick = useCallback(() => {
    setIsBuyNow(false);
    handleBookNow(false, false);
  }, [handleBookNow]);

  const handleBuyNowClick = useCallback(() => {
    setIsBuyNow(true);
    handleBookNow(true);
  }, [handleBookNow]);

  useEffect(() => {
    setLocalStorage({
      key: "whatsapp",
      value: {
        city: selectedCity ? selectedCity?.name || "" : "",
        name: name || "",
        link: `${DOMAIN}${content.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`,
        price: `${INRSymbol}${
          getContentPrice({ price, city: selectedCity }).price
        }`,
      },
    });
  }, [selectedCity, content.slug, content.type, name, price]);

  const shareUrl = useMemo(
    () =>
      `${DOMAIN}${
        content.type === "product"
          ? FRONTEND_LINKS.PRODUCT_PAGE
          : FRONTEND_LINKS.SERVICE_PAGE
      }/${slug}`,
    [content.type, slug],
  );

  const whatsappMessage = useMemo(() => {
    const productPrice = `${INRSymbol}${getContentPrice({ price, city: selectedCity }).price}`;
    const productLink = `${DOMAIN}${content.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`;
    const cityName = selectedCity
      ? selectedCity?.name || ""
      : "__Not selected__";

    return `Hi, I'm interested in the following product from ${COMPANY_NAME}:\nName: ${name || ""}\nPrice: ${productPrice}\nCity: ${cityName}\n\n${productLink}`;
  }, [selectedCity, content.slug, content.type, name, price]);

  const activeCouponCount = useMemo(
    () =>
      (referenceVariant
        ? referenceVariant._coupons?.length
        : content._coupons?.length) || 0,
    [content._coupons?.length, referenceVariant],
  );

  const hasSameDayDelivery = useMemo(() => {
    const processingHours =
      (contentDelivery?.processingTime as ProcessingTimeDocument)?.hours || 0;

    return processingHours > 0 && processingHours <= 24;
  }, [contentDelivery]);

  const includedItems = useMemo(() => info.includes || [], [info.includes]);
  const excludedItems = useMemo(() => info.excludes || [], [info.excludes]);
  const visibleIncludedItems = useMemo(
    () => (showAllDetails ? includedItems : includedItems.slice(0, 4)),
    [includedItems, showAllDetails],
  );

  const handleShare = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: name,
          url: shareUrl,
        });
        return;
      }
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        variant: "success",
        title: "Link copied",
      });
    } catch {
      toast({
        variant: "warning",
        title: "Unable to share this product",
      });
    }
  }, [name, shareUrl, toast]);

  return (
    <>
      <section className="relative z-[10] flex h-full flex-col justify-start pt-2 pb-4 max-lg:bg-white lg:pt-5">
        <div className="relative flex h-full flex-col justify-start gap-1.5 lg:gap-5 lg:pl-5 lg:pr-3">
          <div className="flex flex-col gap-2.5 order-2 lg:order-none">
            <div className="space-y-2">
              <ContentDetailTitleSection
                name={name}
                edible={edible}
                actions={
                  <button
                    type="button"
                    aria-label="Share this product"
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-zinc-500 shadow-sm transition-all hover:border-moss/30 hover:bg-moss/5 hover:text-moss active:scale-95"
                  >
                    <Share2 width={13} height={13} strokeWidth={2.5} />
                    Share
                  </button>
                }
              />
            </div>

            <ContentDetailPrice price={price} />

            {rating ? (
              <ContentDetailRating
                rating={rating}
                showSameDay={hasSameDayDelivery}
                showViewSimilar={showViewSimilarButton}
                onClickViewSimilar={onClickViewSimilar}
              />
            ) : hasSameDayDelivery ||
              (showViewSimilarButton && onClickViewSimilar) ? (
              <ContentHorizontalSpacing>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-charcoal-3">
                  {hasSameDayDelivery ? (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-[#fff5f8] text-[11px] px-2.5 py-1 text-moss">
                      <Zap width={9} className="fill-current" />
                      <span>Same Day</span>
                    </div>
                  ) : null}
                  {showViewSimilarButton && onClickViewSimilar ? (
                    <button
                      type="button"
                      onClick={onClickViewSimilar}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#ebebeb] bg-[#f8f8f8] px-2.5 py-1 text-zinc-600 text-[11px] transition-all duration-300 hover:border-[#ddd] hover:text-charcoal-3 font-poppins"
                    >
                      <span>More like this</span>
                    </button>
                  ) : null}
                </div>
              </ContentHorizontalSpacing>
            ) : null}
          </div>

          <ContentHorizontalSpacing className="lg:pl-5 order-3 lg:order-none">
            <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2.5">
                <h3 className="text-[13px] font-bold text-zinc-800">
                  What&apos;s Included
                </h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  {includedItems.length}{" "}
                  {includedItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>
              <div className="p-3">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {visibleIncludedItems.length ? (
                      visibleIncludedItems.map((include, index) => (
                        <div
                          key={`inc-${index}`}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-1.5"
                        >
                          <Check width={13} className="text-[#27b56d]" />
                          <span className="text-[12px] leading-tight font-medium text-zinc-700">
                            {include}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-charcoal-3/55">
                        Product details will appear here.
                      </span>
                    )}
                  </div>

                  {excludedItems.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
                      <h4 className="text-[13px] font-bold text-zinc-800">
                        What&apos;s Not Included
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {excludedItems.map((exclude, index) => (
                          <div
                            key={`exc-${index}`}
                            className="flex items-center gap-1.5 rounded-lg border border-red-50 bg-red-50/30 px-2.5 py-1.5"
                          >
                            <X width={13} className="text-red-500" />
                            <span className="text-[12px] leading-tight font-medium text-zinc-700">
                              {exclude}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {includedItems.length > 4 && (
                <div className="flex items-center justify-center border-t border-[#f3edf0] px-5 py-2">
                  <button
                    type="button"
                    onClick={() => setShowAllDetails((prev) => !prev)}
                    className="text-xs font-medium text-moss transition-all duration-300 hover:underline"
                  >
                    {showAllDetails
                      ? "Show fewer details"
                      : `+${includedItems.length - 4} more items`}
                  </button>
                </div>
              )}
            </div>
          </ContentHorizontalSpacing>

          <ContentHorizontalSpacing className="order-4 lg:order-none">
            <div className="flex flex-col justify-start gap-2 max-sm:bg-white">
              {variantCategories && Boolean(variantCategories?.length) && (
                <ContentDetailVariantSections
                  variants={variantCategories}
                  activeReferenceVariantId={
                    referenceVariant ? (String(referenceVariant._id)) : null
                  }
                  activeCustomVariantId={(String(customVariant?._id)) || null}
                  onChangeReferenceVariant={handleChangeReferenceVariant}
                  onChangeCustomVariant={handleChangeCustomVariant}
                />
              )}
              {hasCustomizationOptions && (
                <div className="flex flex-col gap-4 my-2">

                  {Boolean(contentCustomization?.uploadText) && (
                    <Suspense fallback={<></>}>
                      <LazyContentCustomizeUploadText
                        uploadText={contentCustomization!.uploadText as any}
                        cartItemUploadedText={customization.uploadedText as any}
                        onChangeCartItemUploadedText={(uploadedText) => {
                          setCustomization((prev) => ({
                            ...prev,
                            uploadedText,
                          }));
                        }}
                      />
                    </Suspense>
                  )}

                  {Boolean(contentCustomization?.balloonColor) && (
                    <Suspense fallback={<></>}>
                      <LazyContentCustomizeBalloonColor
                        balloonColor={contentCustomization!.balloonColor as any}
                        cartItemBalloonColor={customization.balloonColor}
                        onChangeCartItemBalloonColor={(balloonColor) => {
                          setCustomization((prev) => ({
                            ...prev,
                            balloonColor,
                          }));
                        }}
                      />
                    </Suspense>
                  )}

                  {Boolean(contentCustomization?.enhancement) && (
                    <Suspense fallback={<></>}>
                      <LazyContentCustomizeEnhancements
                        enhancement={contentCustomization!.enhancement as any}
                        cartItemEnhancement={customization.enhancement as any}
                        onChangeCartItemEnhancement={(enhancement) => {
                          setCustomization((prev) => ({
                            ...prev,
                            enhancement,
                          }));
                        }}
                      />
                    </Suspense>
                  )}

                  {Boolean(contentCustomization?.flavour) && (
                    <Suspense fallback={<></>}>
                      <LazyContentCustomizeFlavour
                        flavour={contentCustomization!.flavour as any}
                        cartItemFlavour={customization.flavour as any}
                        onChangeCartItemFlavour={(flavour) => {
                          setCustomization((prev) => ({
                            ...prev,
                            flavour,
                          }));
                        }}
                      />
                    </Suspense>
                  )}

                  {Boolean(contentCustomization?.upgrade) && (
                    <Suspense fallback={<></>}>
                      <LazyContentCustomizeUpgrade
                        upgrade={contentCustomization!.upgrade as any}
                        cartItemUpgrade={customization.upgrade as any}
                        onChangeCartItemUpgrade={(upgrade) => {
                          setCustomization((prev) => ({
                            ...prev,
                            upgrade,
                          }));
                        }}
                      />
                    </Suspense>
                  )}

                  {Boolean(contentCustomization?.uploadImage) && (
                    <Suspense fallback={<></>}>
                      <LazyContentCustomizeUploadImage
                        contentName={name}
                        uploadImage={contentCustomization!.uploadImage as any}
                        cartItemUploadedImage={customization.uploadedImage}
                        onChangeCartItemUploadedImage={(uploadedImage) => {
                          setCustomization((prev) => ({
                            ...prev,
                            uploadedImage,
                          }));
                        }}
                      />
                    </Suspense>
                  )}
                </div>
              )}
            </div>
          </ContentHorizontalSpacing>

          <ContentHorizontalSpacing className="mt-2 order-5 lg:order-none lg:pl-5">
            <ContentDetailCityCard isAvailable={isAvailable} />
          </ContentHorizontalSpacing>

          <ContentHorizontalSpacing className="mt-2 order-6 lg:order-none lg:pl-5">
            <Link
              href={whatsappContact(whatsappMessage)}
              target="_blank"
              className="flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <WhatsappSVG dimensions={24} className="text-emerald-500" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <h3 className="text-[13px] font-semibold text-emerald-800 font-montserrat">
                  Looking for Customized Decor?
                </h3>
                <span className="text-[11px] text-emerald-600">
                  Talk with our Experts
                </span>
              </div>
              <ExternalLink width={18} className="text-emerald-400" />
            </Link>
          </ContentHorizontalSpacing>

          <ContentHorizontalSpacing className="lg:hidden sticky bottom-2 z-[100] mt-2 order-7">
            <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <MobileStickyFooter
                pricePerUnit={pricePerUnit}
                activeCouponCount={activeCouponCount}
                onBookNow={handleBuyNowClick}
                onAddToCart={handleAddToCartClick}
                onShowCoupons={() => setShowCoupons(true)}
                processingTime={
                  (contentDelivery?.processingTime as ProcessingTimeDocument)
                    ?.hours || 0
                }
                lastDeliverySlotTime={lastDeliverySlotTime}
              />
            </div>
          </ContentHorizontalSpacing>

          <div className="hidden lg:block overflow-hidden rounded-[20px] bg-white border border-[#efe7ea] shadow-sm lg:top-28 z-50">
            {deliveryDate && (
              <div className="flex items-center justify-center gap-2 bg-[#fff2f6] py-2 border-b border-[#feebf1] h-6">
                <span className="flex items-center gap-2 text-xs font-semibold text-moss antialiased">
                  <Truck className="h-4 w-4" />
                  {isToday
                    ? "Get Delivered Today"
                    : isTomorrow
                      ? "Get Delivered Tomorrow"
                      : `Get Delivered by ${new Date(deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                  {isToday && isMounted && (
                    <span className="flex items-center gap-1 ml-1 text-zinc-500 font-medium normal-case">
                      Order within{" "}
                      <span className="text-[13px] font-bold tabular-nums tracking-tight text-zinc-900">
                        {remainingTime}
                      </span>
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-lg font-semibold tracking-[-0.04em] text-charcoal-3">
                    {INRSymbol}
                    {pricePerUnit}
                  </span>
                  <span className="pb-1 text-xs text-center font-medium text-charcoal-3/45 inline">
                    incl. taxes
                  </span>
                </div>
                <div
                  onClick={
                    activeCouponCount ? () => setShowCoupons(true) : undefined
                  }
                  className={`flex w-max items-center gap-1 rounded-full bg-[#ebfbf1] px-2 py-0.5 text-[11px] font-medium text-emerald-700 ${activeCouponCount ? "cursor-pointer" : ""}`}
                >
                  <BadgePercent width={13} height={13} strokeWidth={2.5} />
                  <span>
                    {activeCouponCount
                      ? `${activeCouponCount} Offers Available`
                      : "Freshly prepared for your order"}
                  </span>
                  {activeCouponCount ? (
                    <ChevronRight
                      width={13}
                      height={13}
                      className="-ml-0.5 opacity-80"
                    />
                  ) : null}
                </div>
              </div>
              <div className="grid w-full gap-3 sm:max-w-[360px] sm:grid-cols-2">
                <ContentDetailAddCartButton onClick={handleAddToCartClick} />
                <ContentDetailBuyNowButton onClick={handleBuyNowClick} />
              </div>
            </div>
          </div>

          <ContentHorizontalSpacing className="lg:pl-5 mt-2 order-8 lg:order-none">
            <div className="flex items-center overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
              <div className="flex flex-1 items-center gap-2 px-3 py-2.5 text-center max-sm:flex-col sm:text-left">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck width={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-zinc-800">
                    Secure Pay
                  </p>
                  <p className="truncate text-[9.5px] leading-tight text-zinc-400">
                    100% protected
                  </p>
                </div>
              </div>
              <div className="h-8 w-px shrink-0 bg-zinc-100"></div>
              <div className="flex flex-1 items-center gap-2 px-3 py-2.5 text-center max-sm:flex-col sm:text-left">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <Truck width={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-zinc-800">
                    Fast Delivery
                  </p>
                  <p className="truncate text-[9.5px] leading-tight text-zinc-400">
                    Same day available
                  </p>
                </div>
              </div>
              <div className="h-8 w-px shrink-0 bg-zinc-100"></div>
              <div className="flex flex-1 items-center gap-2 px-3 py-2.5 text-center max-sm:flex-col sm:text-left">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                  <Users width={14} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-zinc-800">
                    1M+ Happy
                  </p>
                  <p className="truncate text-[9.5px] leading-tight text-zinc-400">
                    Verified reviews
                  </p>
                </div>
              </div>
            </div>
          </ContentHorizontalSpacing>

          <div className="order-6 lg:order-none">
            <ContentDetailInfo info={info} />
          </div>
        </div>
      </section>
      {Boolean(contentAddons?.length) && (
        <Suspense fallback={<></>}>
          <LazyContentAddonDialog
            showAddon={showAddon}
            cartItemAddons={addons}
            contentAddons={contentAddons!}
            cartItemPrice={pricePerUnit}
            onChangeShowAddon={setShowAddon}
            onChangeCartItemAddon={setAddons}
            onBookNow={() => handleProceedToCart(isBuyNowRef.current)}
            slug={slug}
            contentName={name}
            contentImage={contentImage}
            contentPrice={content.price as any}
            selectedCity={selectedCity}
            cartItemCustomization={customization}
            contentCustomization={contentCustomization!}
            cartItemDelivery={delivery}
            onChangeCartItemCustomization={setCustomization}
          />
        </Suspense>
      )}
      <ContentDetailCouponsDialog
        showDialog={showCoupons && !isMobile}
        coupons={
          ((referenceVariant
            ? referenceVariant._coupons
            : content._coupons) as CouponDocument[]) || []
        }
        price={price}
        onChangeShowDialog={setShowCoupons}
      />
      <ContentDetailCouponsDrawer
        showDrawer={showCoupons && isMobile}
        coupons={
          ((referenceVariant
            ? referenceVariant._coupons
            : content._coupons) as CouponDocument[]) || []
        }
        price={price}
        onChangeShowDrawer={setShowCoupons}
      />
    </>
  );
}

export default memo(ContentDetail);
