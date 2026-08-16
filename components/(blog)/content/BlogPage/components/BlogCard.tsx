/* eslint-disable @next/next/no-img-element */
// icons
import moment from "moment";

// components
import OptimizedImage from "@/components/ui/optimized-image";
import Link from "next/link";

// types
import { type BlogCard } from "../types/blogCard";

export default function BlogCard({
  card: {
    title,
    path,
    coverImage: { alt, defaultAlt, url },
    authorName,
    authorPhoto,
    createdAt
  }
}: {
  card: BlogCard;
}) {
  const initial = authorName ? authorName.charAt(0).toUpperCase() : "A";
  const formattedDate = createdAt ? moment(createdAt).format("D MMMM YYYY") : "";

  return (
    <Link href={path}>
      <div className="group border border-charcoal-3/10 rounded-xl overflow-hidden grid grid-cols-1 grid-rows-[auto_auto] transition-all duration-300 hover:border-charcoal-3/20 bg-white shadow-xs">
        <OptimizedImage
          src={url}
          alt={alt || defaultAlt || "Blog Cover"}
          width={600}
          height={600}
          draggable={false}
          quality={100}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[2/1] bg-charcoal-3/20"
          imageClassName="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-all duration-300"
        />
        <div className="flex flex-col justify-start p-3 gap-2">
          <h2 className="line-clamp-2 leading-tight font-semibold text-sm sm:text-base text-zinc-900 group-hover:text-sienna-1 transition-colors">
            {title}
          </h2>
          
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-1 border-t border-zinc-100 mt-1">
            <div className="h-5 w-5 rounded-full bg-rose-50 text-sienna-1 flex items-center justify-center font-bold text-[10px] uppercase shrink-0 overflow-hidden border border-rose-100">
              {authorPhoto ? (
                <img src={authorPhoto} alt={authorName} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <span className="font-semibold text-zinc-800 text-[12px] truncate max-w-[110px]">
              {authorName}
            </span>
            {formattedDate && (
              <>
                <span className="text-zinc-400 font-bold text-[10px]">·</span>
                <span className="text-zinc-400 text-[11px] whitespace-nowrap">{formattedDate}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
