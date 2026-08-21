// config
import { RENDERING_STRATEGY } from "@/config/renderingStrategy";

// constants
import { ALL_CACHE_KEY, SEARCH_CACHE_KEY } from "@/common/constants/cacheKeys";
import { API_SEARCH_INITIAL_LOAD } from "@/common/apiHandlers/(frontend)/apiLinks";
import { XApiKey } from "@/common/constants/apiKey";

// utils
import { memo, type ReactNode } from "react";

// components
import HeaderClient from "./components/HeaderClient";

// types
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

export type SearchBarInitialContentsType = {
  aiTags: { _id: string; name: string }[];
  categories: { name: string; slug: string }[];
  trendingKeywords: { label: string; path: string }[];
  suggestedKeywords?: { label: string; path: string }[];
};

async function Header({
  searchResults,
}: {
  searchResults: SearchBarInitialContentsType | null;
}) {
  // Add placeholder suggested keywords if results exist
  const searchResultsWithSuggestions = searchResults
    ? {
        ...searchResults,
        suggestedKeywords: [
          { label: "Birthday Special", path: "/birthday" },
          { label: "Varmala", path: "/varmala" },
          { label: "Flowers", path: "/flower" },
          { label: "Haldi", path: "/haldi" },
          { label: "Balloon Decoration", path: "/balloons-decorations" },
          { label: "Mehndi Decoration", path: "/mehndi-decoration-service" },
          { label: "Cake", path: "/cakes" },
          { label: "First Night Decoration", path: "/first-night-decoration" },
          { label: "Wedding Car Decoration", path: "/wedding-car-decoration" },
        ],
      }
    : null;
  // const navLinks: HeaderNavLinkDocument[] = await getNavLinks();
  const navLinks: HeaderNavLinkDocument[] = [
    {
      label: "Flowers",
      order: 1,
      sections: [
        {
          heading: "Floral Types",
          links: [{ label: "All Flowers", path: "/flower" }],
        },
        {
          heading: "Roses By Colour",
          links: [
            { label: "Pink", path: "/pink-rose" },
            { label: "Red", path: "/red-rose" },
            { label: "White", path: "/white-rose" },
            { label: "Yellow", path: "/yellow-rose" },
          ],
        },
      ],
    },
    {
      label: "Services & Decor",
      order: 3,
      sections: [
        {
          heading: "Balloon & Party Decor",
          links: [
            { label: "All Balloon Decor", path: "/balloon-decoration" },
            { label: "Ring & Arch Setup", path: "/balloon-ring-decoration" },
            { label: "Balloon Wall Decor", path: "/balloon-wall-decoration" },
            { label: "Theme Balloon Setup", path: "/balloon-theme-decoration" },
            { label: "Room Decoration", path: "/room-decoration" },
          ],
        },
        {
          heading: "Occasions & Baby Welcome",
          links: [
            { label: "Anniversary Decoration", path: "/anniversary-decoration-services" },
            { label: "Baby Shower Decor", path: "/baby-shower-decoration" },
            { label: "Newborn Baby Welcome", path: "/newborn-baby-welcome-decoration" },
            { label: "Bride Welcome Setup", path: "/bride-welcome-decoration" },
          ],
        },
        {
          heading: "Wedding & Corporate",
          links: [
            { label: "First Night Room Decor", path: "/first-night-room-decoration" },
            { label: "Wedding Car Decor", path: "/wedding-car-decorations" },
            { label: "Haldi Decoration", path: "/haldi-decoration-service" },
            { label: "Mehndi Decoration", path: "/mehndi-decoration-service" },
            { label: "Wedding House Decor", path: "/wedding-house-decoration" },
            { label: "Corporate Office Decor", path: "/best-corporate-decoration-for-offices-business-events" },
          ],
        },
      ],
    },
    {
      label: "Cakes",
      order: 4,
      sections: [
        {
          heading: "Trending Cakes",
          links: [
            { label: "All Cakes", path: "/cakes" },
            { label: "Bento Cakes", path: "/bento-cakes" },
            { label: "Designer Theme Cakes", path: "/designer-theme-cakes" },
            { label: "Baby Shower Cakes", path: "/baby-shower-cakes" },
          ],
        },
        {
          heading: "Popular Flavours",
          links: [
            { label: "Chocolate Cakes", path: "/chocolate-cakes" },
            { label: "Black Forest Cakes", path: "/black-forest-cakes" },
            { label: "Red Velvet Cakes", path: "/red-velvet-cakes" },
            { label: "Truffle Cakes", path: "/truffle-cakes" },
            { label: "Fruit Cakes", path: "/fruit-cakes" },
            { label: "Butterscotch Cakes", path: "/butterscotch-cakes" },
            { label: "Rasmalai Cakes", path: "/rasmalai-cakes" },
          ],
        },
      ],
    },
    {
      label: "Wedding",
      order: 5,
      sections: [
        {
          heading: "Wedding Special",
          links: [
            { label: "Jaimala / Varmala", path: "/wedding-varmala-jaimala" },
            { label: "Flower Jewellery", path: "/flower-jewellery" },
            { label: "First Night Room Decor", path: "/first-night-room-decoration" },
            { label: "Wedding Car Decor", path: "/wedding-car-decorations" },
            { label: "Haldi Decoration", path: "/haldi-decoration-service" },
            { label: "Mehndi Decoration", path: "/mehndi-decoration-service" },
            { label: "Wedding House Decor", path: "/wedding-house-decoration" },
          ],
        },
      ],
    },
    {
      label: "Premium",
      order: 6,
      path: "/flowers/india",
    },
    // {
    //   label: "Hampers",
    //   order: 6,
    //   sections: [
    //     {
    //       heading: "",
    //       links: [

    //       ] as HeaderNavLinkSectionLinkDocument[]
    //     }
    //   ] as HeaderNavLinkSectionDocument[]
    // },
  ] as HeaderNavLinkDocument[];

  return (
    <HeaderClient
      navLinks={navLinks}
      searchResults={searchResultsWithSuggestions}
    />
  );
}

export default memo(Header);
