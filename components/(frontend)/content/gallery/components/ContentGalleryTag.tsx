import { getChromaticAberrationColor } from "@/components/(frontend)/category/utils/getChromaticAberrationColor";

export default function ContentGalleryTag(tag: {
  label: string;
  color: string;
}) {
  return (
    <div
      className="absolute right-0 top-6 rounded-l-md px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg lg:rounded-full lg:right-4 lg:top-4 lg:px-4 lg:py-1.5"
      style={{
        background: tag.label.toLowerCase() === "new arrival" ? "#1e3a8a" : tag.color,
        color: tag.label.toLowerCase() === "new arrival" ? "#ffffff" : getChromaticAberrationColor(tag.color)
      }}
    >
      {tag.label}
    </div>
  );
}
