"use client";

// utils
import { memo, useState, useCallback, useMemo, useRef } from "react";

// components
import ContentCustomizeSection from "./ContentCustomizeSection";

// types
import { type CartItemUploadedTextDocument } from "@/common/types/documentation/nestedDocuments/cartItemUploadedText";
import { type ChangeEvent } from "react";
import { type ContentCustomizationUploadTextDocument } from "@/common/types/documentation/nestedDocuments/contentCustomizationUploadText";
import { type LabelDocument } from "@/common/types/documentation/presets/label";

function ContentCustomizeUploadText({
  uploadText: { label, characterLimit },
  cartItemUploadedText,
  onChangeCartItemUploadedText
}: {
  uploadText: ContentCustomizationUploadTextDocument;
  cartItemUploadedText?: CartItemUploadedTextDocument;
  onChangeCartItemUploadedText: (
    cartItemUploadedText?: CartItemUploadedTextDocument
  ) => void;
}) {
  const title = useMemo(() => (label as LabelDocument).label, [label]);
  const text = useMemo(
    () => cartItemUploadedText?.text || "",
    [cartItemUploadedText]
  );
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const presetTexts = useMemo(
    () => ["Congratulations!", "Welcome", "Happy Birthday", "Warm Anniversary"],
    []
  );

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeCartItemUploadedText(
        text
          ? ({ label: title, text } as CartItemUploadedTextDocument)
          : undefined
      );
    },
    [title, onChangeCartItemUploadedText]
  );

  const handleSave = useCallback(() => {
    handleChangeText(text);
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  }, [handleChangeText, text]);

  return (
    <ContentCustomizeSection title={title}>
      <div className="flex flex-col gap-3">
        {/* Textarea + Save button row */}
        <div className="flex items-stretch gap-3">
          <div className="relative flex-1 min-h-[80px] sm:min-h-[90px]">
            <textarea
              className="bg-ivory-2 rounded-xl outline-none focus:outline-none p-3 resize-none w-full h-full z-10 placeholder:text-charcoal-3/30 text-sm"
              value={text}
              placeholder="Enter message here..."
              onChange={({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
                setSaved(false);
                handleChangeText(characterLimit ? value.slice(0, characterLimit) : value);
              }}
            />
            {Boolean(characterLimit) && (
              <span className="absolute bottom-2.5 right-3 z-50 text-xs text-charcoal-3/50">
                {`${text.length} / ${characterLimit}`}
              </span>
            )}
          </div>

          {/* Save button with animation */}
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleSave}
            className={`shrink-0 self-center flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all duration-300 shadow-sm whitespace-nowrap active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
              ${saved ? "bg-green-500 scale-105" : "bg-sienna hover:bg-sienna-1"}`}
          >
            {saved ? (
              /* Checkmark icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-[check-draw_0.3s_ease-out]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              /* Floppy disk icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            )}
            <span>{saved ? "Saved!" : "Save"}</span>
          </button>
        </div>

        {/* Preset chips */}
        <div className="overflow-x-auto scrollbar-hide flex items-center justify-start gap-2">
          {presetTexts.map((presetText, i) => (
            <span
              key={i}
              className="cursor-pointer border border-ash/40 hover:border-ash/90 font-medium py-1 px-3 rounded-full whitespace-nowrap text-xs sm:text-sm text-charcoal-3/55 hover:text-charcoal-3/90 hover:bg-ash-3/20 transition-all duration-200"
              onClick={() => {
                setSaved(false);
                handleChangeText(
                  characterLimit ? presetText.slice(0, characterLimit) : presetText
                );
              }}
            >
              {presetText}
            </span>
          ))}
        </div>
      </div>
    </ContentCustomizeSection>
  );
}

export default memo(ContentCustomizeUploadText);
