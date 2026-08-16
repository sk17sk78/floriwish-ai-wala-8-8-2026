// icons
import { ArrowLeft } from "lucide-react";

// utils
import { memo } from "react";

// hooks
import { useRouter } from "next/navigation";

// components
import ContentGalleryCarousel from "./ContentGalleryCarousel";
import ContentGalleryViewSimilar from "./ContentGalleryViewSimilar";

// types
import { type ImageDocument } from "@/common/types/documentation/media/image";
import ContentGalleryTag from "./ContentGalleryTag";

function ContentGalleryImage({
  activeIndex,
  images,
  tag,
  categoryUrl,
  onChangeActiveIndex,
  onClickViewSimilar
}: {
  activeIndex: number;
  images: ImageDocument[];
  tag?: { label: string; color: string };
  categoryUrl?: string;
  onChangeActiveIndex: (activeIndex: number) => void;
  onClickViewSimilar?: () => void;
}) {
  // hooks
  const { back } = useRouter();

  return (
    <section className="flex flex-col justify-start relative">
      <div className="relative aspect-[1/1.06] overflow-hidden rounded-none border border-[#efe7ea] bg-[#fbf5f7] shadow-[0_24px_60px_rgba(17,24,39,0.07)] max-sm:row-start-1 sm:rounded-[30px]">
        <ContentGalleryCarousel
          images={images}
          activeIndex={activeIndex}
          onChangeActiveIndex={onChangeActiveIndex}
        />
        {(onClickViewSimilar || categoryUrl) && (
          <ContentGalleryViewSimilar
            onClick={onClickViewSimilar}
            categoryUrl={categoryUrl}
          />
        )}
        {tag && (
          <ContentGalleryTag
            label={tag.label}
            color={tag.color}
          />
        )}
      </div>
      <div
        className="absolute left-4 top-4 z-40 rounded-full bg-white p-2.5 text-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 active:scale-95 sm:hidden"
        onClick={back}
      >
        <ArrowLeft width={20} height={20} strokeWidth={2.5} />
      </div>
      {Boolean(images?.length) && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/75 px-3 py-2 shadow-[0_12px_28px_rgba(17,24,39,0.1)] backdrop-blur-md lg:bottom-5">
          {Array.from({ length: images.length }).map((_, index) => (
            <span
              key={index}
              className={`pointer-events-auto h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-5 bg-moss"
                  : "w-2 bg-charcoal-3/18 hover:bg-charcoal-3/35"
              } cursor-pointer`}
              onClick={() => {
                onChangeActiveIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(ContentGalleryImage);
