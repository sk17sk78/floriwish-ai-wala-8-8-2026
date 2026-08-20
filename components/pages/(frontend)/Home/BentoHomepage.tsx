// Server Component — NO "use client"
// Critical: Removing "use client" ensures the banner renders in SSR HTML
// so Googlebot/PageSpeed detects the LCP element without waiting for JS.

import React from "react";
// constants

// components

import { HomepageLayoutDocument } from "@/common/types/documentation/pages/homepageLayout";
import { HomepageLayoutStructure } from "./static/types";
import { getHomepageStructure } from "./static/utils";
import BentoHomepageTitleSpacing from "./spacings/BentoHomepageTitleSpacing";
import HomePageContentSpacing from "./spacings/HomePageContentSpacing";
import dynamic from "next/dynamic";

import { RenderHomepageLayout } from "./components/RenderHomepageLayout";
import { BASE_HOME_BG_COLOR } from "./static/pallette";
import { SchemaOrgScripts } from "@/common/utils/schema/SchemaOrgScripts";
import { DOMAIN } from "@/common/constants/domain";
import { QADocument } from "@/common/types/documentation/nestedDocuments/qa";

const WhyChooseUsSection = dynamic(
  () =>
    import(
      "@/components/(frontend)/global/_Templates/WhyChooseUs/WhyChooseUsSection"
    )
);

const HomeReviewsSection = dynamic(
  () => import("@/components/(frontend)/Home/HomeReviewsSection")
);

export default function BentoHomepage(
  props: {
    data: HomepageLayoutDocument[];
    backlink?: HomepageLayoutStructure[];
    inFrontend?: boolean;
  } & (
    | { useIds?: false }
    | {
        useIds: true;
        onClickEdit: (id: string) => void;
        onClickDisable: (id: string) => void;
        onClickDelete: (id: string) => void;
      }
  )
) {
  const { data, backlink, useIds, inFrontend } = props;

  let homepageData: HomepageLayoutStructure[] = [];

  if (inFrontend) homepageData = getHomepageStructure(data);
  else homepageData = backlink || [];

  const faqsInPage = inFrontend
    ? homepageData
        .filter(({ tag }) => tag === "faq")
        .map(({ layout }) => {
          const faqs = (layout.faq as QADocument[])?.filter(
            (x) => x !== undefined
          );
          if (faqs) {
            const faqData = faqs.map(({ question, answer }) => ({
              q: question,
              a: answer
            }));

            return faqData;
          }
        })
        .filter((x) => x !== undefined)
        .reduce((acc, val) => (acc = [...acc, ...val]), [])
    : [];

  const bannerIndex = homepageData.findIndex((s) => s.tag === "banner");

  // Find the first category AFTER the banner
  let finalFirstCategoryIndex = -1;
  if (bannerIndex !== -1) {
    finalFirstCategoryIndex = homepageData.findIndex(
      (s, i) =>
        i > bannerIndex &&
        (s.tag === "category" || (s as any).type === "category")
    );
  }

  // Fallback: If no banner or no category after banner, find the first category overall
  if (finalFirstCategoryIndex === -1) {
    finalFirstCategoryIndex = homepageData.findIndex(
      (s) => s.tag === "category"
    );
  }

  return (
    <>
      <div className={`h-5 sm:h-6 w-full ${BASE_HOME_BG_COLOR}`} />
      {homepageData.map((slice, index) => {
        const { type, layout, _id, tag, customBG } = slice;

        if (type === "title")
          return useIds ? (
            <BentoHomepageTitleSpacing
              title={slice.data}
              subtitle={slice.subtitle}
              leftAlign={slice.leftAlign || false}
              key={index}
              id={_id}
              showActions={true}
              onClickEdit={props.onClickEdit}
              onClickDisable={props.onClickDisable}
              onClickDelete={props.onClickDelete}
              layoutNumber={index + 1}
              customBG={customBG}
            />
          ) : (
            <BentoHomepageTitleSpacing
              title={slice.data}
              subtitle={slice.subtitle}
              leftAlign={slice.leftAlign || false}
              key={index}
              showActions={false}
              layoutNumber={index + 1}
              customBG={customBG}
            />
          );

        return (
          <React.Fragment key={index}>
            {_id === "69070d724e0b0024875dc423" && inFrontend && (
              <HomePageContentSpacing showActions={false} overflowVisible={true}>
                <HomeReviewsSection />
              </HomePageContentSpacing>
            )}
            {useIds ? (
              <HomePageContentSpacing
                extraSpacing={slice.extraSpacing || false}
                id={_id}
                showActions={true}
                onClickEdit={props.onClickEdit}
                onClickDisable={props.onClickDisable}
                onClickDelete={props.onClickDelete}
                layoutNumber={index + 1}
                isContent={tag === "content" ? true : false}
                excludeBox={tag === "banner" || index === finalFirstCategoryIndex ? true : false}
                categoryShape={tag === "category" ? layout.category?.shape : undefined}
                noPadding={
                  (tag === "category" &&
                    layout.category &&
                    (layout.category.scrollable ||
                      index === finalFirstCategoryIndex ||
                      layout.category.images?.some(
                        (img: any) =>
                          img.label === "Car Decor" ||
                          img.label === "Anniversary" ||
                          img.label === "Baby Shower"
                      ))) ||
                  tag === "collage"
                    ? true
                    : false
                }
                customBG={customBG}
              >
                <>
                  {tag === "faq" && (
                    <>
                      <WhyChooseUsSection />
                    </>
                  )}
                  <RenderHomepageLayout
                    layout={layout}
                    type={tag === "title" ? "text" : tag}
                    inAdmin={true}
                    isFirstCategory={index === finalFirstCategoryIndex}
                    scrollable={(slice as any).scrollable}
                    layoutId={_id}
                  />
                </>
              </HomePageContentSpacing>
            ) : (
              <HomePageContentSpacing
                extraSpacing={slice.extraSpacing || false}
                showActions={false}
                layoutNumber={index + 1}
                isContent={tag === "content" ? true : false}
                excludeBox={tag === "banner" || index === finalFirstCategoryIndex ? true : false}
                categoryShape={tag === "category" ? layout.category?.shape : undefined}
                noPadding={
                  (tag === "category" &&
                    layout.category &&
                    (layout.category.scrollable ||
                      index === finalFirstCategoryIndex ||
                      layout.category.images?.some(
                        (img: any) =>
                          img.label === "Car Decor" ||
                          img.label === "Anniversary" ||
                          img.label === "Baby Shower"
                      ))) ||
                  tag === "collage"
                    ? true
                    : false
                }
                customBG={customBG}
              >
                <>
                  {tag === "faq" && (
                    <>
                      <WhyChooseUsSection />
                    </>
                  )}
                  <RenderHomepageLayout
                    layout={layout}
                    type={tag === "title" ? "text" : tag}
                    inAdmin={false}
                    isFirstCategory={index === finalFirstCategoryIndex}
                    scrollable={(slice as any).scrollable}
                    layoutId={_id}
                  />
                </>
              </HomePageContentSpacing>
            )}
          </React.Fragment>
        );
      })}

      {inFrontend ? (
        <SchemaOrgScripts
          pageType="Home"
          data={{ Home: { faqs: faqsInPage } }}
          url={DOMAIN}
        />
      ) : (
        <></>
      )}

    </>
  );
}
