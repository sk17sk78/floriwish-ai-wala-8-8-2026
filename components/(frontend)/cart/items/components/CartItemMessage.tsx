"use client";

// icons
import { MessageSquareText } from "lucide-react";

// hooks
import { useState, useRef, useCallback } from "react";

// types
import { type ChangeEvent } from "react";
import { type CartItemUploadedTextDocument } from "@/common/types/documentation/nestedDocuments/cartItemUploadedText";
import { type ContentCustomizationUploadTextDocument } from "@/common/types/documentation/nestedDocuments/contentCustomizationUploadText";
import { type LabelDocument } from "@/common/types/documentation/presets/label";

const PRESET_TEXTS = [
  "Congratulations!",
  "Welcome",
  "Happy Birthday",
  "Warm Anniversary"
];

export default function CartItemMessage({
  uploadedText,
  uploadTextConfig,
  onChangeUploadedText
}: {
  uploadedText?: CartItemUploadedTextDocument;
  uploadTextConfig?: ContentCustomizationUploadTextDocument;
  onChangeUploadedText: (text?: CartItemUploadedTextDocument) => void;
}) {
  // Resolve admin-configured values
  const configLabel =
    uploadTextConfig?.label
      ? typeof uploadTextConfig.label === "string"
        ? uploadTextConfig.label
        : (uploadTextConfig.label as LabelDocument)?.label || "Message"
      : "Message";

  const charLimit: number =
    uploadTextConfig?.characterLimit || 99;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localText, setLocalText] = useState<string>(uploadedText?.text || "");
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback(() => {
    const trimmed = localText.trim();
    onChangeUploadedText(
      trimmed
        ? ({ label: configLabel, text: trimmed } as CartItemUploadedTextDocument)
        : undefined
    );
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSaved(false);
      setIsEditing(false);
    }, 1500);
  }, [localText, configLabel, onChangeUploadedText]);

  return (
    <div className="border-t border-charcoal-3/10 bg-ivory-1/30 px-4 py-3 sm:px-5">
      {isEditing ? (
        <div className="flex flex-col gap-3">
          {/* Textarea + Save button */}
          <div className="flex items-stretch gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="p-2 bg-white rounded-full border border-charcoal-3/10">
                <MessageSquareText width={14} height={14} className="text-sienna/80" />
              </div>
            </div>

            <div className="relative flex-1 min-h-[80px]">
              <textarea
                autoFocus
                value={localText}
                onChange={({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
                  setSaved(false);
                  setLocalText(value.slice(0, charLimit));
                }}
                className="w-full h-full resize-none bg-white border border-charcoal-3/10 rounded-xl outline-none p-3 text-sm text-charcoal-3 shadow-inner placeholder-charcoal-3/30"
                placeholder={`Enter ${configLabel.toLowerCase()}...`}
              />
              <span className="absolute bottom-2 right-3 text-[11px] text-charcoal-3/40">
                {localText.length} / {charLimit}
              </span>
            </div>

            {/* Save button with animation */}
            <button
              type="button"
              disabled={!localText.trim()}
              onClick={handleSave}
              className={`shrink-0 self-center flex items-center justify-center gap-1.5 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm whitespace-nowrap active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                ${saved ? "bg-green-500 scale-105" : "bg-sienna hover:bg-sienna-1"}`}
            >
              {saved ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
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
          <div className="flex flex-wrap gap-2">
            {PRESET_TEXTS.map((text, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSaved(false);
                  setLocalText(text.slice(0, charLimit));
                }}
                className="text-[11px] px-3 py-1.5 rounded-full border border-charcoal-3/10 bg-white hover:bg-charcoal-3/5 transition-all text-charcoal-3/60"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Collapsed view */
        <div
          onClick={() => {
            setLocalText(uploadedText?.text || "");
            setSaved(false);
            setIsEditing(true);
          }}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <MessageSquareText
              width={14}
              height={14}
              className="text-charcoal-3/40 group-hover:text-sienna transition-colors flex-shrink-0"
            />
            <span className="text-sm text-charcoal-3/50 group-hover:text-charcoal-3/80 transition-colors truncate">
              {uploadedText?.text || `Add ${configLabel} (e.g. Happy Birthday!)`}
            </span>
          </div>
          {uploadedText?.text && (
            <span className="text-xs font-bold text-sienna hover:underline ml-2 flex-shrink-0">
              Edit
            </span>
          )}
        </div>
      )}
    </div>
  );
}
