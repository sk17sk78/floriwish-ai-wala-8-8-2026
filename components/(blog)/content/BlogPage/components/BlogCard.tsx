// icons
import moment from "moment";

// components
import OptimizedImage from "@/components/ui/optimized-image";
import NextImage from "@/components/custom/NextImage";
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
  },
  priority = false
}: {
  card: BlogCard;
  priority?: boolean;
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
          priority={priority}
          quality={75}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                <div className="relative h-full w-full">
                  <NextImage
                    src={authorPhoto}
                    alt={authorName || "Author"}
                    fill
                    sizes="20px"
                    className="object-cover"
                  />
                </div>
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
