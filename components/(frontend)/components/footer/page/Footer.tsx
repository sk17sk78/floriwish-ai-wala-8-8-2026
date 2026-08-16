// utils
import { memo } from "react";

// components
import FooterClient from "./components/FooterClient";

// types
import { type FooterSectionDocument, type FooterSectionLinkDocument } from "./types";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

async function Footer() {
  const footerSections: FooterSectionDocument[] = [
    {
      heading: "Company",
      order: 1,
      links: [
        { label: "About Us", path: FRONTEND_LINKS.DYNAMIC_PAGE + "/about-us" },
        { label: "Contact Us", path: "/contact" },
        { label: "Blogs", path: FRONTEND_LINKS.BLOGS + "/page/1" },
        { label: "Sitemap", path: "/sitemap.xml" },
      ] as FooterSectionLinkDocument[]
    },
    {
      heading: "Terms & Policy",
      order: 2,
      links: [
        { label: "Privacy Policy", path: FRONTEND_LINKS.DYNAMIC_PAGE + "/privacy-policy" },
        { label: "Refund Policy", path: FRONTEND_LINKS.DYNAMIC_PAGE + "/refund-policy" },
        { label: "Shipping Policy", path: FRONTEND_LINKS.DYNAMIC_PAGE + "/shipping-policy" },
        { label: "Cancellation Policy", path: FRONTEND_LINKS.DYNAMIC_PAGE + "/cancellation-policy" },
        { label: "Terms & Conditions", path: FRONTEND_LINKS.DYNAMIC_PAGE + "/term-condition" },
      ] as FooterSectionLinkDocument[]
    },
  ] as FooterSectionDocument[];

  return <FooterClient footerSections={footerSections} />;
}

export default memo(Footer);
