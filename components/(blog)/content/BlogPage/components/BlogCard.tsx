// icons
import { UserRound } from "lucide-react";

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
    authorName
  }
}: {
  card: BlogCard;
}) {
  return (
    <Link href={path}>
      <div className="group border border-charcoal-3/10 rounded-xl overflow-hidden grid grid-cols-1 grid-rows-[auto_auto] transition-all duration-300 hover:border-charcoal-3/20">
        <OptimizedImage
          src={url}
          alt={alt || defaultAlt || "Blog Cover"}
          width={600}
          height={600}
          draggable={false}
          quality={80}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[2/1] bg-charcoal-3/20"
          imageClassName="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-all duration-300"
        />
        <div className="bg-ivory-1 flex flex-col justify-start p-2.5 sm:py-4 sm:px-3 gap-1.5">
          <h2 className="line-clamp-2 leading-tight">{title}</h2>
          {/* <span className="flex items-center justify-start gap-1.5 text-charcoal-3/90">
            <UserRound
              strokeWidth={1.5}
              width={13}
            />
            <span className="text-[13px]">{authorName}</span>
          </span> */}
        </div>
      </div>
    </Link>
  );
}
