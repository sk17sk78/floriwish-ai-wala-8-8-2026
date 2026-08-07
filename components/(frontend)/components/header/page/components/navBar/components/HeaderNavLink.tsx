// utils
import { memo } from "react";

// components
import Link from "next/link";

// types
import { type HeaderNavLinkDocument } from "@/common/types/documentation/pages/headerNavLink";

function HeaderNavLink({
  navLink: { _id, label, path },
}: {
  navLink: HeaderNavLinkDocument;
}) {
  return (
    <Link
      key={String(_id)}
      href={path as string}
      prefetch={false}
      className="flex items-center px-4 py-2 rounded-full text-zinc-700 text-[14px] font-medium transition-all duration-300 hover:text-moss hover:bg-[#fff5f8]"
    >
      {label}
    </Link>
  );
}

export default memo(HeaderNavLink);
