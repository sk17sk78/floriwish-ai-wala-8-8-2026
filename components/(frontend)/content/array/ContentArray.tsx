"use client";

// icons
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// utils
import { memo } from "react";

// hooks
import { useCallback, useId } from "react";
import { useWindowSize } from "usehooks-ts";

// components
import ContentArrayItem from "./components/ContentArrayItem";

// types
import { type ContentDocument } from "@/common/types/documentation/contents/content";

function ContentArray({
  isScrollable,
  contents,
}: {
  isScrollable?: boolean;
  contents: ContentDocument[];
}) {
  // hooks
  const arrayId = useId();
  const { width } = useWindowSize();

  // event handlers
  const handleScroll = useCallback(
    (dir: "left" | "right") => {
      const tray = document.getElementById(arrayId) as HTMLElement;

      const currOffset = tray.scrollLeft;

      tray.scrollTo({
        left: currOffset + (dir === "left" ? -1 : 1) * (width * 0.65),
        behavior: "smooth",
      });
    },
    [arrayId, width],
  );

  return (
    <div className="relative group/array">
      {Boolean(isScrollable && contents.length > 2) && (
        <div
          className={`max-w-9 w-9 h-9 absolute top-1/2 -translate-y-1/2 left-0 rounded-full cursor-pointer flex items-center justify-center bg-white/90 p-[8px] border border-neutral-200 text-slate-900 shadow-lg transition-all duration-300 hover:bg-white z-50`}
          onClick={() => {
            handleScroll("left");
          }}
        >
          <ChevronLeftIcon />
        </div>
      )}
      <div
        id={arrayId}
        className={`px-4 pb-4 ${isScrollable ? "relative flex items-center justify-start gap-9 sm:gap-5 overflow-x-scroll scrollbar-hide snap-x snap-mandatory scroll-smooth" : `grid sm:grid-cols-3 md:grid-cols-4 gap-0 sm:gap-6 items-start justify-center`}`}
      >
        {contents.map((content, index) => {
          if (isScrollable) {
            return (
              <div
                key={String(content._id)}
                className="snap-start flex-shrink-0"
                style={{
                  flex:
                    width < 640
                      ? "0 0 115px"
                      : width < 1024
                        ? "0 0 42vw"
                        : "0 0 18vw",
                  minWidth:
                    width < 640 ? "115px" : width < 1024 ? "42vw" : "18vw",
                }}
              >
                <ContentArrayItem
                  index={index}
                  isScrollable={isScrollable}
                  content={content}
                />
              </div>
            );
          }
          return (
            <ContentArrayItem
              key={String(content._id)}
              index={index}
              isScrollable={isScrollable}
              content={content}
            />
          );
        })}
      </div>
      {Boolean(isScrollable && contents.length > 2) && (
        <div
          className={`max-w-9 w-9 h-9 absolute top-1/2 -translate-y-1/2 right-0 rounded-full cursor-pointer flex items-center border border-neutral-200 justify-center bg-white/90 p-[8px] text-slate-900 shadow-lg transition-all duration-300 hover:bg-white z-50`}
          onClick={() => {
            handleScroll("right");
          }}
        >
          <ChevronRightIcon />
        </div>
      )}
    </div>
  );
}

export default memo(ContentArray);
