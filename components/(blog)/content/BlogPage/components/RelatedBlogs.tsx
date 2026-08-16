// config
import { OPTIMIZE_IMAGE } from "@/config/image";

// icons
import { UserRound } from "lucide-react";

// utils
import { extractBlogCoverImage } from "../utils/extractBlogCoverImage";

// components
import NextImage from "@/components/custom/NextImage";
import Link from "next/link";

// types
import { type BlogArticleDocument } from "@/common/types/documentation/blog/blogArticle";
import { type BlogAuthorDocument } from "@/common/types/documentation/blog/blogAuthor";
import { type ImageDocument } from "@/common/types/documentation/media/image";

export function RelatedBlogs({
  title,
  blogs,
  atSideSection
}: {
  title: string;
  blogs: BlogArticleDocument[];
  atSideSection?: boolean;
}) {
  if (blogs.length === 0) {
    return <></>;
  }

  const allBlogs = blogs.map(({ heading, slug, layouts, author, createdAt }) => {
    const authorName = (() => {
      if (!author) return "Floriwish Team";
      if (typeof author === "string") {
        return /^[0-9a-fA-F]{24}$/.test(author) ? "Floriwish Team" : author;
      }
      return (author as any).name || (author as any).title || (author as any).userName || "Floriwish Team";
    })();

    const photo = (author as any)?.photo?.url || (author as any)?.avatar;

    return {
      title: heading,
      path: `/blog/${slug}`,
      image: extractBlogCoverImage(layouts),
      authorName,
      authorPhoto: photo,
      createdAt: createdAt ? String(createdAt) : undefined
    };
  });

  return (
    <section
      className={`flex flex-col justify-start gap-y-3 max-1200:px-3 ${atSideSection ? "" : "pt-10"} `}
    >
      <span
        className={
          atSideSection ? "text-base mb-2" : "text-xl font-medium my-2"
        }
      >
        {title}
      </span>
      <div
        className={`grid ${atSideSection ? "grid-cols-1 gap-6" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5"} `}
      >
        {allBlogs.map(
          (
            { image: { alt, defaultAlt, url }, path, title, authorName },
            index
          ) => (
            <Link
              href={path}
              key={index}
            >
              <div className="group border border-transparent rounded-xl shadow-light overflow-hidden grid grid-cols-1 grid-rows-[auto_auto] transition-all duration-300 hover:shadow-medium hover:border-charcoal-3/20">
                <div className="relative aspect-video overflow-hidden bg-charcoal-3/20">
                  <NextImage
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-all duration-300"
                    src={url}
                    alt={alt || defaultAlt || "Blog Cover"}
                    width={600}
                    height={600}
                    draggable={false}
                  />
                </div>
                <div className="flex flex-col justify-start p-2.5 sm:py-4 sm:px-3 gap-1.5">
                  <span className="line-clamp-2 leading-tight">{title}</span>
                  <span className="flex items-center justify-start gap-1.5 text-slate-600/60">
                    <UserRound
                      strokeWidth={1.5}
                      width={13}
                    />
                    <span className="text-[13px]">{authorName}</span>
                  </span>
                </div>
              </div>
            </Link>
          )
        )}
      </div>
      <div className=""></div>
    </section>
  );
}
