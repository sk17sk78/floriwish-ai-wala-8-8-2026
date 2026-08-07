// components
import { API_SEARCH_INITIAL_LOAD } from "@/common/apiHandlers/(frontend)/apiLinks";
import { XApiKey } from "@/common/constants/apiKey";
import { ALL_CACHE_KEY, SEARCH_CACHE_KEY } from "@/common/constants/cacheKeys";
import Background from "@/components/(frontend)/components/background/page/Background";
import Header, {
  SearchBarInitialContentsType,
} from "@/components/(frontend)/components/header/page/Header";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";

const Footer = dynamic(
  () => import("@/components/(frontend)/components/footer/page/Footer"),
);
const MobileNavbar = dynamic(
  () => import("@/components/(frontend)/components/mobileNavbar/MobileNavbar"),
);

// controllers
import { getInitialSearchData } from "@/app/api/frontend/v2/frontend/search/initial-load/controller";

async function fetchInitialSearch() {
  try {
    const data = await getInitialSearchData();
    return data as unknown as SearchBarInitialContentsType;
  } catch (err) {}

  return null;
}

export default async function FrontendRoot({ children }: { children: ReactNode }) {
  const searchResults = await fetchInitialSearch();

  return (
    <>
      <Background showStickyButtons>
        {/* <ContentDetailCouponTest /> */}
        <Header searchResults={searchResults} />
        {children}
        <Footer />
        <MobileNavbar searchResults={searchResults} />
      </Background>
    </>
  );
}
