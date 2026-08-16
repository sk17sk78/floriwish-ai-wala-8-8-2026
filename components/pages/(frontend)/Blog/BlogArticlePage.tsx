/* eslint-disable @next/next/no-img-element */
"use client";

// libraries
import moment from "moment";
import { Calendar } from "lucide-react";

// constants
import { DOMAIN } from "@/common/constants/environmentVariables";

// components
import { SchemaOrgScripts } from "@/common/utils/schema/SchemaOrgScripts";
import BlogCategories from "@/components/(frontend)/blog/BlogCategories";
import BlogLayout from "@/components/(frontend)/blog/layout/BlogLayout";
import BlogShareCard from "@/components/(blog)/content/BlogPage/components/BlogShareCard";

// types
import { type BlogArticleDocument } from "@/common/types/documentation/blog/blogArticle";
import { type BlogCategoryDocument } from "@/common/types/documentation/blog/blogCategory";
import { type BlogTagDocument } from "@/common/types/documentation/blog/blogTag";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type SchemaDataType } from "@/common/types/seoTypes";

function BlogArticlePage({
  article
}: {
  article: BlogArticleDocument;
}) {
  const { heading, slug, layouts: unsortedLayouts, meta, createdAt } = article;

  const url = `${DOMAIN}/blog/${slug}`;
  const rawAuthor = article.author;
  
  const displayAuthorName = (() => {
    if (!rawAuthor) return "Floriwish Team";
    if (typeof rawAuthor === "string") {
      return /^[0-9a-fA-F]{24}$/.test(rawAuthor) ? "Floriwish Team" : rawAuthor;
    }
    return (rawAuthor as any).name || (rawAuthor as any).title || (rawAuthor as any).userName || "Floriwish Team";
  })();

  const authorPhoto = (rawAuthor as any)?.photo?.url || (rawAuthor as any)?.avatar;
  const formattedDate = createdAt ? moment.utc(createdAt).format("D MMMM YYYY") : "";

  const categories = (article.categories || []) as BlogCategoryDocument[];
  const tags = (article.tags || []) as BlogTagDocument[];
  const layouts = [...unsortedLayouts].sort((a, b) => a.order - b.order);

  const schemaData: SchemaDataType = {
    BlogArticle: {
      webpage: {
        name: heading,
        alternateName: heading,
        image:
          (
            layouts.find(({ type }) => type === "image")?.layout?.image
              ?.images as ImageDocument[] | undefined
          )?.[0]?.url || "",
        url
      },
      blogPosting: {
        url,
        authorName: displayAuthorName,
        description: meta?.description || "",
        headline: heading,
        publishedOn: formattedDate,
        body:
          layouts
            .find(({ type }) => type === "text")
            ?.layout.text?.split(" ")
            .filter((str) => !str.startsWith("<") || !str.endsWith(">"))
            .slice(0, 40)
            .join(" ") || "",
        image:
          (
            layouts.find(({ type }) => type === "image")?.layout?.image
              ?.images as ImageDocument[] | undefined
          )?.[0]?.url || "",
        keywords: meta?.tags,
        wordCount: layouts
          .filter(({ type }) => type === "text")
          .map(({ layout }) => layout.text?.length || 0)
          .reduce((sum, val) => (sum += val), 0)
      }
    }
  };

  return (
    <>
      <SchemaOrgScripts
        data={schemaData}
        pageType="BlogArticle"
        url=""
      />
      <article className="relative grid grid-cols-1 overflow-x-hidden auto-rows-min sm:px-32 sm:border-x border-charcoal-3/20 max-1200:px-3 pt-2 pb-10 sm:pt-8 sm:pb-20">
        <section className="flex flex-col justify-start pb-4 border-b border-zinc-100">
          <div className="mt-4 sm:mt-2 pb-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 leading-tight">{heading}</h1>
          </div>
          
          {categories.length > 0 && (
            <div className="my-2">
              <BlogCategories categories={categories} />
            </div>
          )}

          {/* Photo 1 Design: Soft Pink Initial Badge + Author Name + Calendar Date */}
          <div 
            suppressHydrationWarning
            className="flex items-center gap-2.5 text-sm sm:text-base text-zinc-600 mt-3 flex-wrap"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#fde8ee] text-[#801435] flex items-center justify-center font-bold text-base sm:text-lg shrink-0 border border-[#fbcfe8]/40 shadow-2xs">
              {authorPhoto ? (
                <img
                  src={authorPhoto}
                  alt={displayAuthorName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                displayAuthorName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="font-bold text-zinc-800 text-base sm:text-lg">
              {displayAuthorName}
            </span>
            <span className="text-zinc-300 font-bold text-base select-none">.</span>
            <div className="flex items-center gap-1.5 text-zinc-400 font-normal text-sm sm:text-base">
              <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-zinc-400 stroke-[1.75]" />
              <span suppressHydrationWarning>{formattedDate}</span>
            </div>
          </div>
        </section>

        <div />
        
        <section className="flex flex-col justify-start gap-y-3.5 pt-6">
          {layouts.map((layout) => (
            <BlogLayout
              key={String(layout._id)}
              layout={layout}
            />
          ))}

          {/* Photo 2 Design: Responsive Share Card Box */}
          <BlogShareCard
            url={url}
            title={heading}
          />
        </section>
      </article>
    </>
  );
}

export default BlogArticlePage;
