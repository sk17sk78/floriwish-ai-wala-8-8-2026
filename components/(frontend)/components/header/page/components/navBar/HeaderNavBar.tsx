// utils
import { memo } from "react";

// components
import HeaderNavLink from "./components/HeaderNavLink";
import HeaderNavMenu from "./components/HeaderNavMenu";

// types
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

function HeaderNavBar({ navLinks }: { navLinks: HeaderNavLinkDocument[] }) {
  return (
    <nav
      className="relative max-lg:hidden py-1 flex items-center justify-center gap-3 border-t border-black/5"
    >
      {/* FIX: Grab the index from the map function */}
      {navLinks.map((navLink, index) =>
        navLink.path ? (
          <HeaderNavLink
            // FIX: Added fallback to index if _id is undefined
            key={(String(navLink._id)) || `navlink-${index}`}
            navLink={navLink}
          />
        ) : (
          <HeaderNavMenu
            // FIX: Added fallback to index if _id is undefined
            key={(String(navLink._id)) || `navmenu-${index}`}
            navLink={navLink}
          />
        ),
      )}
    </nav>
  );
}

export default memo(HeaderNavBar);
