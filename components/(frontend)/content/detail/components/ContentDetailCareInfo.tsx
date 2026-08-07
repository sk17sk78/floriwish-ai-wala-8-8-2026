import { useState } from "react";
// components
import ContentInfoBulletPoint from "./ContentInfoBulletPoint";

export default function ContentDetailCareInfo({
  careInfo,
}: {
  careInfo: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemsToShow = isExpanded ? careInfo : careInfo.slice(0, 4);

  return (
    <div
      className={
        "py-1 pb-2 flex flex-col justify-start gap-1 text-zinc-500 sm:pl-0"
      }
    >
      <div className="grid grid-cols-[20px_1fr] gap-1.5 justify-start items-start transition-all duration-300">
        {(isExpanded ? careInfo : itemsToShow).map((info, i) => (
          <ContentInfoBulletPoint
            key={i}
            text={info}
            bulletClassName="bg-[#aaf2cb]"
          />
        ))}
      </div>

      {careInfo.length > 4 && (
        <div className="flex justify-end w-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sienna font-semibold text-[13px] flex items-center gap-1 mt-1 transition-all duration-200"
          >
            {isExpanded ? "Show Less" : "Show More"}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
