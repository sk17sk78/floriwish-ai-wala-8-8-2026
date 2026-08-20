// app/page.tsx
// Homepage SSR — admin se content change hota rehta hai, har request pe fresh chahiye
export const dynamic = "force-dynamic";

// requests
// controllers
import { getHomepageLayouts as getHomepageLayoutsFromController } from "@/app/api/frontend/homepage/controllers";

// constants
import { CANONICAL_LINK } from "@/common/constants/meta";
import {
  COMPANY_META_DESCRIPTION,
  COMPANY_NAME,
  COMPANY_PRIMARY_BANNER,
  COMPANY_URL,
} from "@/common/constants/companyDetails";

// components
import BentoHomepage from "@/components/pages/(frontend)/Home/BentoHomepage";
import BodyWrapper from "@/components/(frontend)/components/wrapper/BodyWrapper";
import { WEBSITE_NAME } from "@/common/constants/environmentVariables";

// types
import { HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";

/* ---------------- META ---------------- */
export const metadata = {
  title: COMPANY_NAME,
  description: COMPANY_META_DESCRIPTION,
  alternates: { canonical: CANONICAL_LINK },
  openGraph: {
    title: COMPANY_NAME,
    description: COMPANY_META_DESCRIPTION,
    url: COMPANY_URL,
    images: [COMPANY_PRIMARY_BANNER],
  },
};

/* ---------------- DATA ---------------- */
async function getHomepageLayouts(): Promise<HomepageLayoutDocument[]> {
  try {
    const documents = await getHomepageLayoutsFromController();

    return (documents ?? []).filter(
      (item): item is HomepageLayoutDocument => Boolean(item),
    ).map((item) => {
      // Strip large text content from RSC payload to prevent Next.js 14
      // ec() recursive String.replace stack overflow. Text content is
      // fetched client-side via CustomTypedContent using the layout _id.
      if (item.type === "text" && item.layout?.text && item.layout.text.length > 1000) {
        return {
          ...item,
          layout: { ...item.layout, text: "" }
        } as unknown as HomepageLayoutDocument;
      }
      return item;
    });
  } catch {
    return [];
  }
}

/* ---------------- PAGE ---------------- */
export default async function Home() {
  const homepageLayouts = await getHomepageLayouts();

  // Find the first banner for LCP Discovery
  const firstBanner = homepageLayouts.find((l) => l.type === "banner");
  const firstImage = firstBanner?.layout?.banner?.images?.[0];
  const desktopLcpUrl = convertToCloudFrontUrl((firstImage?.desktop as any)?.url) || COMPANY_PRIMARY_BANNER;
  const rawMobileUrl = convertToCloudFrontUrl((firstImage?.mobile as any)?.url);
  // Use dedicated mobile URL only when it differs from desktop
  const mobileLcpUrl = rawMobileUrl && rawMobileUrl !== desktopLcpUrl
    ? rawMobileUrl
    : desktopLcpUrl;
  const hasDedicatedMobile = mobileLcpUrl !== desktopLcpUrl;

  return (
    <>
      {/* LCP Preload for Desktop: Tell browser to download hero image IMMEDIATELY */}
      {desktopLcpUrl && (
        <link
          rel="preload"
          as="image"
          href={desktopLcpUrl}
          // @ts-ignore
          imageSrcSet={`${desktopLcpUrl} 1200w`}
          imageSizes="(min-width: 640px) 100vw"
          crossOrigin="anonymous"
          // @ts-ignore
          fetchPriority="high"
        />
      )}
      {/* LCP Preload for Mobile (separate link with media query so mobile PageSpeed picks it up) */}
      {hasDedicatedMobile && mobileLcpUrl && (
        <link
          rel="preload"
          as="image"
          href={mobileLcpUrl}
          // @ts-ignore
          imageSrcSet={`${mobileLcpUrl} 800w`}
          imageSizes="(max-width: 639px) 100vw"
          media="(max-width: 639px)"
          crossOrigin="anonymous"
          // @ts-ignore
          fetchPriority="high"
        />
      )}
      <BodyWrapper fullWidth>
        <main>
          <h1 className="visually-hidden">{WEBSITE_NAME}</h1>
          <BentoHomepage data={homepageLayouts} inFrontend />
        </main>
      </BodyWrapper>
    </>
  );
}
