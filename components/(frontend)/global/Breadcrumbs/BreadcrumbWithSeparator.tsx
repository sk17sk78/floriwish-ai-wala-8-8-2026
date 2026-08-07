// components
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// types
import { type BreadcrumbsType } from "@/common/types/types";

export default function BreadcrumbWithSeparator({
  breadcrumb: { label, link },
  isLast,
}: {
  breadcrumb: BreadcrumbsType;
  isLast: boolean;
}) {
  return (
    <>
      <BreadcrumbSeparator className="translate-y-px text-zinc-400" />
      <BreadcrumbItem>
        <Link
          href={isLast ? "#" : link}
          prefetch={false}
          className={
            isLast
              ? "text-[13px] font-medium text-zinc-800 whitespace-nowrap pointer-events-none"
              : "text-[13px] font-normal whitespace-nowrap text-zinc-500 hover:text-zinc-800 transition-colors"
          }
        >
          {label}
        </Link>
      </BreadcrumbItem>
    </>
  );
}
