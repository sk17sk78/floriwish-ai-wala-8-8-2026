"use client";

// utils
import { memo } from "react";
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";
import { Star } from "lucide-react";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";
import { convertToCloudFrontUrl } from "@/common/utils/convertToCloudFrontUrl";

// types
import { type SearchContentsType } from "../SearchContentUI";

function SearchResultContentsNew({
  contents,
  indices,
  collapse
}: {
  contents: SearchContentsType[];
  indices: number[];
  collapse: () => void;
}) {
  return indices.length > 0 ? (
    <section className="flex flex-col relative w-full pt-1">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Products ({indices.length})
        </span>
      </div>
      <section className="flex flex-col divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-white overflow-hidden">
        {indices.slice(0, 100).map((i, index) => {
          const item = contents[i];
          if (!item) return null;
          const href = item.slug?.startsWith("/")
            ? item.slug
            : `${FRONTEND_LINKS.PRODUCT_PAGE}/${item.slug}`;
          const imgSrc = convertToCloudFrontUrl(item.image || "");

          return (
            <Link
              key={`${item.slug}-${index}`}
              onClick={collapse}
              className="flex items-center gap-3 p-3 transition-colors active:bg-zinc-100 hover:bg-rose-50/20 cursor-pointer min-w-0"
              href={href}
              prefetch={true}
            >
              <div className="relative overflow-hidden w-14 h-14 rounded-xl bg-zinc-100 shrink-0 border border-zinc-200/50">
                {imgSrc ? (
                  <NextImage
                    className="w-full h-full object-cover object-center"
                    src={imgSrc}
                    alt={item.name || "Product Image"}
                    width={56}
                    height={56}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-zinc-800 line-clamp-1 group-hover:text-[#b76e79] transition-colors">
                  {item.name}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-[14px] text-zinc-900">
                    ₹{item.price || item.basePrice || 0}
                  </span>
                  {item.rating > 0 && (
                    <div className="flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                      <Star fill="#fff" className="w-2.5 h-2.5" />
                      <span>{Number(item.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </section>
  ) : null;
}

export default memo(SearchResultContentsNew);
