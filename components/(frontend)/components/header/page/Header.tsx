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
      label: "Cakes",
      order: 4,
      path: "/cakes",
    },
    {
      label: "Balloon Decor",
      order: 5,
      path: "/balloon-decoration",
    },
    {
      label: "Wedding",
      order: 6,
      sections: [
        {
          heading: "Wedding Services",
          links: [
            {
              label: "First Night Room Decoration",
              path: "/first-night-room-decoration",
            },
            { label: "Jaimala / Varmala", path: "/wedding-varmala-jaimala" },
            { label: "Wedding Car Decor", path: "/wedding-car-decorations" },
            { label: "Haldi Decoration", path: "/haldi-decoration-service" },
            { label: "Mehndi Decoration", path: "/mehndi-decoration-service" },
          ],
        },
      ],
    },
    {
      label: "Personalized",
      order: 7,
      sections: [
        {
          heading: "Coming Soon",
          links: [],
        },
      ],
    },
    {
      label: "Premium",
      order: 8,
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
