"use client";

// icons
import { Phone } from "lucide-react";
import { WhatsappSVG } from "@/common/svgs/svg";

// utils
import { whatsappContact } from "@/common/utils/_contactDetails";

// components
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CATEGORY_PAGE_REGEX,
  PRODUCT_PAGE_REGEX,
} from "@/common/constants/regex";
import { useEffect, useState } from "react";
import { getLocalStorage } from "@/common/utils/storage/local";
import { DOMAIN } from "@/common/constants/domain";
import { fromSlug } from "@/common/utils/slugOperations";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import {
  COMPANY_NAME,
  COMPANY_NUMBER,
} from "@/common/constants/companyDetails";

export default function StickyButtons() {
  const currPath = usePathname();
  const {
    location: {
      data: { selectedCity },
    },
  } = useAppStates();

  const [data, setData] = useState<object>({});
  const [msg, setMsg] = useState<string>("");

  const url = `${DOMAIN}${currPath || ""}`;

  const isProductPage = PRODUCT_PAGE_REGEX.test(url);
  const isCategoryPage = !isProductPage ? CATEGORY_PAGE_REGEX.test(url) : false;

  useEffect(() => {
    if (isProductPage)
      setTimeout(() => {
        setData((prev) => getLocalStorage({ key: "whatsapp" }));
      }, 1000);
    else if (isCategoryPage)
      setData((prev) => ({
        link: url,
        name: fromSlug((currPath || "").split("/")[1]),
        city: selectedCity ? selectedCity.name : "",
      }));
    else setData((prev) => ({}));
  }, [url, selectedCity, isProductPage, isCategoryPage, currPath]);

  useEffect(() => {
    const whatsappMessage =
      typeof data === "object" && data && Object?.keys(data)?.length > 0
        ? isProductPage
          ? // @ts-ignore
            `Hi, I'm interested in the following product from ${COMPANY_NAME}:\nName: ${data?.name || ""}\nPrice: ${data?.price || "-"}\nCity: ${data?.city || "__Not selected__"}\n\n${data?.link || ""}`
          : isCategoryPage
            ? // @ts-ignore
              `Hi, I'm looking for ${data?.name || "items"} in ${COMPANY_NAME}${data?.city ? `\nCity: ${data?.city || ""}` : ""}`
            : ""
        : "";
    setMsg((prev) => whatsappMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div
      className={`fixed bottom-28 right-4 lg:bottom-10 lg:right-6 flex flex-col justify-start gap-3 lg:gap-4 z-[9999]`}
    >
      <Link
        href={`tel:${COMPANY_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        aria-label="Call us"
        className="block"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-colors duration-200 hover:bg-blue-700 sm:h-14 sm:w-14">
          <Phone
            width={24}
            height={24}
            strokeWidth={1}
            className="text-white fill-white"
          />
        </div>
      </Link>

      <Link
        href={whatsappContact(msg)}
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        aria-label="Contact us on WhatsApp"
        className="block"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 shadow-lg transition-colors duration-200 hover:bg-green-700 sm:h-14 sm:w-14">
          <WhatsappSVG
            dimensions={28}
            strokeWidth={0.1}
            fill="white"
            className="ml-0.5"
          />
        </div>
      </Link>
    </div>
  );
}
