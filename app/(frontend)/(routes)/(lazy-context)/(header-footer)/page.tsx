// app/page.tsx

// ISR with revalidation (avoids force-static SSR stack overflow on large HTML)
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
  const desktopLcpUrl = (firstImage?.desktop as any)?.url;
  const mobileLcpUrl = (firstImage?.mobile as any)?.url;

  return (
    <BodyWrapper fullWidth>
      {desktopLcpUrl && (
        <link
          rel="preload"
          as="image"
          href={desktopLcpUrl}
          media="(min-width: 640px)"
          fetchPriority="high"
        />
      )}
      {mobileLcpUrl && (
        <link
          rel="preload"
          as="image"
          href={mobileLcpUrl}
          media="(max-width: 639px)"
          fetchPriority="high"
        />
      )}
      <main>
        <h1 className="visually-hidden">{WEBSITE_NAME}</h1>
        <BentoHomepage data={homepageLayouts} inFrontend />
      </main>
    </BodyWrapper>
  );
}
