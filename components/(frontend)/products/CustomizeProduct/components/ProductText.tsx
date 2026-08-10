import { SetStateType } from "@/common/types/reactTypes";
import { MutableRefObject, useEffect, useState } from "react";

export default function ProductText({
  imgText,
  setImgText,
  textLetterLimit,
  ref
}: {
  imgText: string | undefined;
  setImgText: SetStateType<string | undefined>;
  textLetterLimit: number;
  ref: MutableRefObject<null>;
}) {
  const [isFocusable, setIsFocusable] = useState<boolean>(false);

  const presets = [
    "Happy Birthday",
    "Greetings",
    "Congratulations",
    "Happy Anniversary"
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setIsFocusable((prev) => true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Textarea row with Save button on the right */}
      <div className="flex items-stretch gap-3">
        {/* Textarea wrapper */}
        <div className="relative flex-1 min-h-[80px] sm:min-h-[90px]">
          <textarea
            className="bg-ivory-2 rounded-xl outline-none focus:outline-none p-3 resize-none w-full h-full z-10 placeholder:text-charcoal-3/30 text-sm"
            value={imgText}
            ref={ref}
            placeholder="Enter message here..."
            onChange={(e) =>
              setImgText((prev) =>
                textLetterLimit
                  ? e.target.value.substring(0, textLetterLimit)
                  : e.target.value
              )
            }
            readOnly={!isFocusable}
          />
          <span className="absolute bottom-2.5 right-3 z-50 text-xs text-charcoal-3/50">
            {imgText?.length || 0} / {textLetterLimit}
          </span>
        </div>

        {/* Save button — right side, vertically centered */}
        <button
          type="button"
          disabled={!imgText?.trim()}
          onClick={() => setImgText((prev) => prev)}
          className="shrink-0 self-center flex items-center justify-center gap-1.5 bg-sienna hover:bg-sienna-1 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Save</span>
        </button>
      </div>

      {/* Preset chips row */}
      <div className="overflow-x-auto scrollbar-hide flex items-center justify-start gap-2">
        {presets.map((str, index) => (
          <span
            onClick={() =>
              setImgText((prev) =>
                textLetterLimit
                  ? `${prev || ""}${str} `.substring(0, textLetterLimit)
                  : `${prev || ""}${str} `
              )
            }
            className="cursor-pointer border border-ash/40 hover:border-ash/90 font-medium py-1 px-3 rounded-full whitespace-nowrap text-xs sm:text-sm text-charcoal-3/55 hover:text-charcoal-3/90 hover:bg-ash-3/20 transition-all duration-200"
            key={index}
          >
            {str}
          </span>
        ))}
      </div>
    </div>
  );
}
