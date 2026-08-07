"use client";

import he from "he";
import { useState, useEffect } from "react";

import design from "./scss/design.module.scss";

/**
 * Renders rich-text HTML content from the CMS.
 *
 * Why the `layoutId` fetch pattern?
 * Next.js 14 has a known issue where the RSC payload serialiser (ec() function)
 * crashes with `RangeError: Maximum call stack size exceeded at String.replace`
 * when it encounters large strings (>1 KB) that contain HTML characters (< > &).
 * To work around this, the server strips layout.text from the RSC payload and
 * this component fetches the raw HTML separately via a plain-text API call,
 * then decodes HTML entities with `he` on the client side only.
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

  useEffect(() => {
    if (layoutId) {
      // Fetch large HTML content that was deliberately stripped from RSC payload.
      fetch(`/api/frontend/homepage/text-content?id=${layoutId}`)
        .then((res) => (res.ok ? res.text() : ""))
        .then((raw) => {
          try {
            setHtml(he.decode(raw));
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

  return (
    <div
      className={`${design.parent} text-left`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
