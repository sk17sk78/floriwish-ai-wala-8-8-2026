// Homepage ISR — Revalidates every 60s for instant response time (<30ms TTFB) with background updates
export const revalidate = 60;

import { type Metadata } from "next";

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
import { WEBSITE_NAME } from "@/common/constants/environmentVariables";

// components
import BentoHomepage from "@/components/pages/(frontend)/Home/BentoHomepage";
import BodyWrapper from "@/components/(frontend)/components/wrapper/BodyWrapper";

// types
import { HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";
import { getHomepageConfig } from "@/common/utils/getHomepageConfig";

/* ---------------- DYNAMIC SEO METADATA ---------------- */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getHomepageConfig();
  const seo = config?.seo || {};

  const title = seo.metaTitle || COMPANY_NAME;
  const description = seo.metaDescription || COMPANY_META_DESCRIPTION;
  const canonical = seo.canonicalUrl || CANONICAL_LINK || "https://floriwish.com";
  const ogImage = seo.ogImage || COMPANY_PRIMARY_BANNER;
  const twitterImage = seo.twitterImage || ogImage;

  return {
    title,
    description,
    keywords: seo.metaKeywords || [],
    alternates: { canonical },
    robots: {
      index: seo.robotsIndex ?? true,
      follow: seo.robotsFollow ?? true,
    },
    verification: {
      google: seo.googleVerification || undefined,
    },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      siteName: "Floriwish",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: seo.twitterCardType === "summary" ? "summary" : "summary_large_image",
      title: seo.twitterTitle || title,
      description: seo.twitterDescription || description,
      images: [twitterImage],
    },
  };
}

/* ---------------- DATA ---------------- */
async function getHomepageLayouts(): Promise<HomepageLayoutDocument[]> {
  try {
    const documents = await getHomepageLayoutsFromController();

    return (documents ?? []).filter(
      (item): item is HomepageLayoutDocument => Boolean(item),
    ).map((item) => {
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
  const [homepageLayouts, config] = await Promise.all([
    getHomepageLayouts(),
    getHomepageConfig()
  ]);

  const pageH1 = config?.seo?.pageTitle || WEBSITE_NAME;
  const structuredData = config?.seo?.structuredData;

  // Find the first banner for LCP Discovery
  const firstBanner = homepageLayouts.find((l) => l.type === "banner");
  const firstImage = firstBanner?.layout?.banner?.images?.[0];
  const desktopLcpUrl = convertToCloudFrontUrl((firstImage?.desktop as any)?.url) || COMPANY_PRIMARY_BANNER;
  const rawMobileUrl = convertToCloudFrontUrl((firstImage?.mobile as any)?.url);
  const mobileLcpUrl = rawMobileUrl && rawMobileUrl !== desktopLcpUrl
    ? rawMobileUrl
    : desktopLcpUrl;
  const hasDedicatedMobile = mobileLcpUrl !== desktopLcpUrl;

  return (
    <>
      {/* Dynamic JSON-LD Structured Data Schema */}
      {structuredData && (
        <script
          id="homepage-jsonld-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
          suppressHydrationWarning
        />
      )}

      {/* LCP Preload for Desktop */}
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
      {/* LCP Preload for Mobile */}
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
          <h1 className="visually-hidden" suppressHydrationWarning>{pageH1}</h1>
          <BentoHomepage data={homepageLayouts} inFrontend />
        </main>
      </BodyWrapper>
    </>
  );
}
