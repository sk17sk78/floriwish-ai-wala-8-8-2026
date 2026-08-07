import { useState } from "react";
import ContentInfoBulletPoint from "./ContentInfoBulletPoint";

export default function ContentDetailDeliveryDetail({
  deliveryDetail,
}: {
  deliveryDetail: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const itemsToShow = isExpanded ? deliveryDetail : deliveryDetail.slice(0, 4);

  return (
    <div className="flex flex-col justify-start gap-1 py-1 text-zinc-500">
      <div className="grid grid-cols-[20px_1fr] items-start justify-start gap-1 transition-all duration-300">
        {(isExpanded ? deliveryDetail : itemsToShow).map((detail, i) => (
          <ContentInfoBulletPoint
            key={i}
            text={detail}
            bulletClassName="bg-[#a2bee8]"
          />
        ))}
      </div>

      {deliveryDetail.length > 4 && (
        <div className="flex w-full justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-sienna transition-all duration-200"
          >
            {isExpanded ? "Show Less" : "Show More"}
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
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
