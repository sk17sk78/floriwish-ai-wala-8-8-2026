import BodyWrapper from "@/components/(frontend)/components/wrapper/BodyWrapper";
import ContentGridWrapper from "@/components/(frontend)/content/ContentGridWrapper";

export default function Loading() {
  return (
    <BodyWrapper>
      <div className="animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="hidden sm:flex gap-2 py-4 mb-2">
          <div className="h-4 w-20 bg-ash-1 rounded" />
          <div className="h-4 w-4 bg-ash-1/50 rounded" />
          <div className="h-4 w-32 bg-ash-1 rounded" />
        </div>

        <ContentGridWrapper>
          {/* Gallery Skeleton */}
          <section className="lg:sticky lg:top-7 grid grid-cols-1 lg:grid-cols-[80px_auto] gap-3 lg:gap-4 items-start justify-stretch">
             {/* Preview thumbs hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square w-full bg-ash-1 rounded-lg" />
              ))}
            </div>
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-ash-1/50 rounded-xl overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center text-charcoal-3/20 font-medium">Loading...</div>
            </div>
          </section>

          {/* Detail Skeleton */}
          <section className="max-lg:pt-5 relative flex flex-col justify-start lg:pl-5">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="h-8 w-3/4 bg-ash-1 rounded" />
              {/* Price */}
              <div className="h-6 w-1/4 bg-ash-1/80 rounded" />
              {/* Rating */}
              <div className="h-4 w-1/3 bg-ash-1/60 rounded" />
              
              <div className="flex flex-col gap-6 py-6">
                {/* Variant Section */}
                <div className="flex flex-col gap-3">
                  <div className="h-4 w-20 bg-ash-1/60 rounded" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-24 bg-ash-1/40 rounded-md" />
                    ))}
                  </div>
                </div>

                {/* Delivery Section */}
                <div className="h-32 w-full bg-ash-1/20 rounded-xl border border-ash-1/30" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 py-5">
                <div className="h-12 flex-1 bg-ash-1/50 rounded-lg" />
                <div className="h-12 flex-1 bg-ash-1/50 rounded-lg" />
              </div>
            </div>
          </section>
        </ContentGridWrapper>
      </div>
    </BodyWrapper>
  );
}
