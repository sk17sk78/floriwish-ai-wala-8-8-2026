/* eslint-disable @next/next/no-img-element */
"use client";

// config

// icons
import { Calendar, PaintBucket, Tag, UserRound } from "lucide-react";

// components
import { DOMAIN } from "@/common/constants/domain";
import {
  getBlogArticleSections
} from "@/common/helpers/generateStaticBlogData";
import { BlogArticleDocument } from "@/common/types/documentation/blog/blogArticle";
import { BlogAuthorDocument } from "@/common/types/documentation/blog/blogAuthor";
import { BlogCategoryDocument } from "@/common/types/documentation/blog/blogCategory";
import { BlogTagDocument } from "@/common/types/documentation/blog/blogTag";
import { ContentDocument } from "@/common/types/documentation/contents/content";
import { ImageDocument } from "@/common/types/documentation/media/image";
import { SchemaDataType } from "@/common/types/seoTypes";
import { SchemaOrgScripts } from "@/common/utils/schema/SchemaOrgScripts";
import BoxTheme from "@/components/(frontend)/global/_Templates/BoxTheme/BoxTheme";
import FAQs from "@/components/(frontend)/global/_Templates/FAQs/FAQs";
import FrontendProductTiles from "@/components/(frontend)/global/_Templates/Tiles/ProductTiles/FrontendProductTiles";
import { LocationProvider } from "@/hooks/useLocation/useLocation";
import moment from "moment";
import { useEffect, useState } from "react";
import BlogArticleContent from "./components/BlogArticleContent";
import BlogShareCard from "./components/BlogShareCard";
import {
  BlogH1Heading,
  BlogShareButton,
  BlogTags
} from "./components/TopSection";

export default function BlogArticle({
  blogArticle: {
    heading,
    slug,
    author,
    categories,
    tags,
    meta,
    layouts,
    createdAt
  },
  inFrontend
}: {
  blogArticle: BlogArticleDocument;
  inFrontend?: boolean;
}) {
  const [previewRawString, setPreviewRawString] = useState<
    (string | ContentDocument[])[]
  >(layouts ? getBlogArticleSections([], [], layouts, true) : []);

  const faqData = layouts
    .find(({ type }) => type === "faq")
    ?.layout.faq?.map(({ _id, question, answer }) => ({
      question,
      answer,
      _id: String(_id)
    }));

  useEffect(() => {
    if (layouts) {
      const sections: (string | ContentDocument[])[] = getBlogArticleSections(
        [],
        [],
        layouts,
        true
      );
      setPreviewRawString(sections);
    }
  }, [layouts]);

  const displayAuthorName = (() => {
    if (!author) return "Floriwish Team";
    if (typeof author === "string") {
      return /^[0-9a-fA-F]{24}$/.test(author) ? "Floriwish Team" : author;
    }
    return (author as any).name || (author as any).title || (author as any).userName || "Floriwish Team";
  })();

  const authorPhoto = (author as any)?.photo?.url || (author as any)?.avatar;
  const formattedDate = createdAt ? moment.utc(createdAt).format("D MMMM YYYY") : "";

  const schemaData: SchemaDataType = {
    BlogArticle: {
      webpage: {
        name: heading,
        alternateName: heading,
        image:
          (
            layouts.find(({ type }) => type === "image")?.layout?.image
              ?.images as ImageDocument[]
          )?.at(0)?.url || "",
        url: `${DOMAIN}/blog/${slug}`
      },
      blogPosting: {
        url: `${DOMAIN}${slug.startsWith("/") ? slug : "/" + slug}`,
        authorName: displayAuthorName,
        description: meta?.description || "",
        headline: heading,
        publishedOn: formattedDate,
        body:
          layouts
            .find(({ type }) => type === "text")
            ?.layout.text?.substring(0, 100) || "",
        image:
          (
            layouts.find(({ type }) => type === "image")?.layout?.image
              ?.images as ImageDocument[]
          )?.at(0)?.url || "",
        keywords: meta?.tags,
        wordCount: 500
      }
    }
  };

  return (
    <>
      {/* SCHEMA SCRIPTS ===================== */}
      <SchemaOrgScripts
        data={schemaData}
        pageType="BlogArticle"
        url="" // redundant for blogs
      />

      <div className="grid grid-cols-1 overflow-x-hidden auto-rows-min sm:grid-cols-[2fr_1fr] md:grid-cols-[1fr_290px] gap-x-7 max-1200:px-3 pb-4">
        {/* -------[ TOP SECTION ]--------------------------------- */}
        <section className="flex flex-col justify-start pb-2 col-span-full">
          {/* title ================================================= */}
          <div className="mt-8 sm:mt-4 pb-2 flex flex-col sm:flex-row items-center gap-y-2.5 justify-center sm:justify-between gap-x-4">
            <BlogH1Heading title={heading} />
            <BlogShareButton link={`${DOMAIN}/blog/${slug}`} />
          </div>
        </section>

        <span></span>

        {/* -------[ ARTICLE SECTION ]--------------------------------- */}
        <LocationProvider>
          <div className="flex flex-col justify-start gap-y-4">
            {/* Author Initial Badge + Name . Calendar Date (Exact Photo 1 Design) ============ */}
            <div
              suppressHydrationWarning
              className="flex items-center gap-2.5 text-sm sm:text-base text-zinc-600 py-1 flex-wrap"
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

            {/* Main Article Content */}
            {previewRawString.map((subArticle, index) =>
              typeof subArticle === "string" ? (
                <BlogArticleContent
                  innerHTML={subArticle}
                  key={index}
                />
              ) : (
                <BoxTheme
                  key={index}
                  className="sm:max-w-[882px]"
                >
                  <FrontendProductTiles
                    productList={subArticle}
                    type="scrollable"
                    sync
                  />
                </BoxTheme>
              )
            )}

            {/* Responsive Share Box (Exact Photo 2 Design) */}
            <BlogShareCard
              url={`${DOMAIN}/blog/${slug}`}
              title={heading}
            />

            {faqData ? (
              <>
                <div className="mt-8 max-sm:mb-5">
                  <span className={"text-xl font-medium mb-3 "}>
                    Frequently Asked Questions
                  </span>
                  <FAQs faqData={faqData} />
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="pt-8 grid grid-cols-1 sm:grid-cols-[125px_1fr] gap-x-1.5 gap-y-2 sm:gap-y-4 border-t border-zinc-100 mt-4">
              <span className="flex items-center justify-start gap-1.5">
                <UserRound
                  strokeWidth={1.5}
                  width={18}
                  className="mr-1 text-sienna-1"
                />
                <span className="font-semibold text-zinc-700">Author:</span>
              </span>
              <span className="font-semibold text-zinc-900 ml-7 sm:ml-1">
                {displayAuthorName}
              </span>

              {categories && categories.length ? (
                <>
                  <span className="flex items-start justify-start gap-1.5 max-sm:mt-3">
                    <PaintBucket
                      strokeWidth={1.5}
                      width={18}
                    />
                    <span className="mr-3.5">Categories:</span>
                  </span>
                  <BlogTags
                    tags={(categories as BlogCategoryDocument[]).map(
                      ({ _id, name }) => ({
                        label: name,
                        path: `/blog/category/${_id}`
                      })
                    )}
                    showAll
                  />
                </>
              ) : (
                <></>
              )}

              {tags && tags.length ? (
                <>
                  <span className="flex items-start justify-start gap-1.5 max-sm:mt-3">
                    <Tag
                      strokeWidth={1.5}
                      width={18}
                    />
                    <span className="mr-3.5">Tags:</span>
                  </span>
                  <BlogTags
                    tags={(tags as BlogTagDocument[]).map(({ name }) => ({
                      label: name,
                      path: "/blog"
                    }))}
                    showAll
                  />
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </LocationProvider>

        {/* -------[ RIGHT SIDE ]--------------------------------- */}
        <section className="grid grid-cols-1 sm:grid-cols-[28px_1fr]">
          <span className="border-l border-charcoal-3/20 max-sm:hidden" />
          <div className="flex flex-col justify-start max-sm:hidden">
          </div>
        </section>
      </div>
    </>
  );
}
