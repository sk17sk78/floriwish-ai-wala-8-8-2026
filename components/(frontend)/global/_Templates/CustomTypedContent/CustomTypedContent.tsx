"use client";

import he from "he";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import design from "./scss/design.module.scss";

// In-memory cache for fetched layout text content
const textContentCache = new Map<string, string>();

/**
 * Renders rich-text HTML content from the CMS with 1 heading + full paragraph (~145 words / ~250px)
 * initial view and a centered "Read More" expand button for long descriptions.
 */
export default function CustomTypedContent({
  content,
  layoutId,
  encoded = false,
}: {
  /** Raw or encoded HTML content. Used when content is small enough to pass safely. */
  content?: string;
  /** MongoDB _id of the HomepageLayout document. Used to fetch large text content
   *  that was stripped from the RSC payload to avoid the Next.js 14 ec() crash. */
  layoutId?: string;
  /** When true and content is provided, content is base64-encoded. */
  encoded?: boolean;
}) {
  const [html, setHtml] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (layoutId) {
      if (textContentCache.has(layoutId)) {
        setHtml(textContentCache.get(layoutId) || "");
        return;
      }

      // Fetch large HTML content that was deliberately stripped from RSC payload.
      fetch(`/api/frontend/homepage/text-content?id=${layoutId}`)
        .then((res) => (res.ok ? res.text() : ""))
        .then((raw) => {
          try {
            const decoded = he.decode(raw);
            textContentCache.set(layoutId, decoded);
            setHtml(decoded);
          } catch {
            setHtml("");
          }
        })
        .catch(() => setHtml(""));
      return;
    }

    if (content) {
      try {
        const raw = encoded
          ? Buffer.from(content, "base64").toString("utf-8")
          : content;
        setHtml(he.decode(raw));
      } catch {
        setHtml("");
      }
    }
  }, [content, layoutId, encoded]);

  useEffect(() => {
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
  }, [html]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className={`relative w-full ${!html && layoutId ? "min-h-[80px]" : ""}`}>
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
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {needsExpand && (
        <div className="mt-3 flex justify-center w-full z-10">
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
