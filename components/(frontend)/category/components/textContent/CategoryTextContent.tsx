"use client";

// libraries
import he from "he";
import { memo, useMemo, useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

// styles
import design from "./styles/categoryTextContent.module.scss";

function CategoryTextContent({
  text,
  showReadMore = true
}: {
  text: string;
  showReadMore?: boolean;
}) {
  const html = useMemo(() => (text ? he.decode(text) : ""), [text]);
  const [isExpanded, setIsExpanded] = useState(!showReadMore);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showReadMore) {
      setNeedsExpand(false);
      setIsExpanded(true);
      return;
    }

    const checkHeight = () => {
      if (contentRef.current) {
        const scrollH = contentRef.current.scrollHeight;
        if (scrollH > 250) {
          setNeedsExpand(true);
        } else {
          setNeedsExpand(false);
        }
      }
    };

    checkHeight();
    const t1 = setTimeout(checkHeight, 100);
    const t2 = setTimeout(checkHeight, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [html, showReadMore]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full">
        <div
          ref={contentRef}
          className={`${design.parent} text-left transition-all duration-500 ease-in-out ${
            needsExpand && !isExpanded
              ? "max-h-[220px] sm:max-h-[250px] overflow-hidden"
              : "max-h-none"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {needsExpand && !isExpanded && (
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-ivory-1 via-ivory-1/80 to-transparent pointer-events-none" />
        )}
      </div>

      {needsExpand && (
        <div className="mt-4 flex justify-center w-full z-10">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-[#8a1936] hover:text-[#6e132b] bg-white border border-[#8a1936]/30 hover:border-[#8a1936] rounded-full shadow-sm hover:shadow transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <span>{isExpanded ? "Read Less" : "Read More"}</span>
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 animate-bounce" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(CategoryTextContent);
