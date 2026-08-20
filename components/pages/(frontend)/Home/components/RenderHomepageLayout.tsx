import { ContentDocument } from "@/common/types/documentation/contents/content";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { BannerDocument } from "@/common/types/documentation/nestedDocuments/banner";
import { LayoutCategoryDocument } from "@/common/types/documentation/nestedDocuments/layoutCategory";
import { LayoutCollageDocument } from "@/common/types/documentation/nestedDocuments/layoutCollage";
import { LayoutQuickLinkDocument } from "@/common/types/documentation/nestedDocuments/layoutQuickLink";
import { PageLayoutDocument } from "@/common/types/documentation/nestedDocuments/pageLayout";
import { QADocument } from "@/common/types/documentation/nestedDocuments/qa";
import { HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { QuickLinkDocument } from "@/common/types/documentation/presets/quickLink";
import { Banners } from "@/components/(frontend)/global/_Templates/BannerCarousel/BannerCarouselNew";
import UpdatedCategoryTiles from "@/components/(frontend)/global/_Templates/Tiles/CategoryTiles/UpdatedCategoryTiles";
import dynamic from "next/dynamic";
import HeroBannerSSR from "./HeroBannerSSR";

// Below-fold components — lazy load (TBT reduce)
const CollageTiles = dynamic(
  () => import("@/components/(frontend)/global/_Templates/Tiles/CollageTiles/CollageTiles"),
);

const FAQs = dynamic(
  () => import("@/components/(frontend)/global/_Templates/FAQs/FAQs"),
);

const QuickLinks = dynamic(
  () => import("@/components/(frontend)/global/_Templates/QuickLinks/QuickLinks"),
);

const FrontendProductTiles = dynamic(
  () => import("@/components/(frontend)/global/_Templates/Tiles/ProductTiles/FrontendProductTiles"),
);

const CustomTypedContent = dynamic(
  () => import("@/components/(frontend)/global/_Templates/CustomTypedContent/CustomTypedContent"),
);

export const RenderHomepageLayout = ({
  layout,
  type,
  inAdmin,
  leftAlign,
  index,
  isFirstCategory,
  scrollable,
  layoutId,
}: {
  layout: PageLayoutDocument;
  type: HomepageLayoutDocument["type"];
  inAdmin?: boolean;
  leftAlign?: boolean;
  index?: number;
  isFirstCategory?: boolean;
  scrollable?: boolean;
  /** MongoDB _id of the HomepageLayout — passed to CustomTypedContent so it
   *  can fetch large text content via API (avoids Next.js 14 RSC ec() crash). */
  layoutId?: string;
}) => {
  switch (type) {
    // ===[ BANNER ]===================================================
    case "banner":
      const banner = layout.banner as BannerDocument;
      if (banner) {
        const showBubbles = banner.showIndicators || true;
        const scrollAfter = banner.scrollInterval || 7000;
        const autoScroll = banner.autoScroll;
        const type = banner.type || "default";

        const bannerElements: any[] = banner.images
          .filter((x) => x !== undefined)
          .map(({ desktop, mobile, path }) => {
            const desk = desktop as ImageDocument;
            const mob = mobile as ImageDocument;

            return {
              image: {
                mobile: {
                  alt: mob?.alt || mob?.defaultAlt || "",
                  url: mob?.url || "",
                },
                desktop: {
                  alt: desk?.alt || desk?.defaultAlt || "",
                  url: desk?.url || "",
                },
              },
              isLink: path === undefined || path.length === 0 ? false : true,
              link: path as string,
            };
          });

        return (() => {
          const firstBanner = bannerElements[0];
          const firstDesktop = firstBanner?.image?.desktop?.url || "";
          const firstMobile = firstBanner?.image?.mobile?.url || firstDesktop;
          const firstAlt = firstBanner?.image?.desktop?.alt || firstBanner?.image?.mobile?.alt || "Banner";
          const hasMobileFirst = Boolean(
            firstMobile && firstMobile.trim().length > 0 && firstMobile !== firstDesktop
          );
          const hasFirstBanner = Boolean(firstDesktop || firstMobile);
          const firstLink = firstBanner?.isLink ? firstBanner?.link : undefined;

          const aspectClass = hasMobileFirst ? "aspect-[2/1] sm:aspect-[3/1]" : "aspect-[3/1]";

          return (
            <div className={`relative w-full ${aspectClass}`}>
              {/*
                HeroBannerSSR — pure Server Component, zero JS.
                Renders the first hero image into initial HTML at z-[1].
                PageSpeed/Googlebot detects it as the LCP element.
              */}
              {hasFirstBanner && (
                <HeroBannerSSR
                  desktopUrl={firstDesktop}
                  mobileUrl={hasMobileFirst ? firstMobile : undefined}
                  alt={firstAlt}
                  link={firstLink}
                  hasDedicatedMobile={hasMobileFirst}
                />
              )}
              {/* Carousel progressively enhances on top once JS mounts (z-10) */}
              <div className="absolute inset-0 z-10">
                <Banners
                  scrollAfter={scrollAfter}
                  elements={bannerElements}
                  showBubbles={showBubbles}
                  autoScroll={autoScroll}
                  priority={true}
                  ratioType={type}
                />
              </div>
            </div>
          );
        })();
      } else break;

    case "category":
      const categories = layout.category as LayoutCategoryDocument;
      if (categories) {
        const list =
          categories.images && categories.images.length
            ? (categories.images as QuickLinkDocument[])
                .filter((x) => x !== undefined)
                .map(({ _id, label, path, image }) => ({
                  _id: String(_id),
                  label,
                  link: path,
                  image: {
                    url: (image as ImageDocument)?.url || "",
                    alt: (image as ImageDocument)?.alt || "",
                  },
                }))
            : [];

        const isTopCategory = isFirstCategory;

        return (
          <UpdatedCategoryTiles
            categoryList={list}
            columns={categories.columns || 2}
            shape={categories.shape || "circle"}
            scrollable={Boolean(categories.scrollable)}
            asCard={!isTopCategory && categories.shape === "square"}
            isTopCategory={isTopCategory}
          />
        );
      } else break;

    case "collage":
      const collage = layout.collage as LayoutCollageDocument;
      if (collage) {
        const layoutType = collage.type;
        const contents = (collage.images as QuickLinkDocument[]).map(
          ({ label, path, image }) => ({
            title: label,
            link: path,
            image: {
              url: (image as ImageDocument)?.url || "",
              alt: (image as ImageDocument)?.alt || "",
            },
          }),
        );
        return (
          <CollageTiles
            tiles={{
              _id: String(collage._id),
              layoutType,
              contents,
            }}
          />
        );
      } else break;

    // ===[ ProductS ]===================================================
    case "content":
      const contents = (layout.content as ContentDocument[])?.filter(
        (x) => x !== undefined,
      );
      if (contents) {
        return (
          <FrontendProductTiles
            productList={contents}
            inHomePage
            currSort={"popularity"}
            inAdmin={inAdmin}
            extraCurved={true}
            type={scrollable ? "scrollable" : "list"}
          />
        );
      } else break;

    // ===[ FAQs ]===================================================
    case "faq":
      const faqs = (layout.faq as QADocument[])?.filter((x) => x !== undefined);
      if (faqs) {
        const faqData = faqs.map(({ _id, question, answer }) => ({
          _id: String(_id),
          question,
          answer,
        }));
        const faqTitle = "Frequently Asked Questions";
        return (
          <FAQs
            faqData={faqData}
            title={faqTitle}
          />
        );
      } else break;

    // ===[ QUICK LINKS ]===================================================
    case "quick-link":
      const quickLinks = (
        layout.quickLink as LayoutQuickLinkDocument[]
      )?.filter((x) => x !== undefined);
      if (quickLinks) {
        const links: Array<{
          _id: string;
          heading: string;
          content: Array<{ _id: string; label: string; url: string }>;
        }> = quickLinks.map(({ heading, links, _id }) => ({
          _id: String(_id),
          heading,
          content: links.map(({ _id, label, path }) => ({
            _id: String(_id),
            label,
            url: path,
          })),
        }));
        return <QuickLinks quickLinks={links} />;
      } else break;

    // ===[ CUSTOM TEXT ]===================================================
    case "text":
      const textContent = layout.text as string;
      // If content was stripped from RSC payload (too large), fetch via layoutId.
      // If small content exists in layout, pass it directly.
      if (layoutId || (textContent && textContent.length > 0)) {
        return (
          <CustomTypedContent
            content={textContent || undefined}
            layoutId={!textContent || textContent.length === 0 ? layoutId : undefined}
          />
        );
      } else break;
  }

  return <></>;
};
