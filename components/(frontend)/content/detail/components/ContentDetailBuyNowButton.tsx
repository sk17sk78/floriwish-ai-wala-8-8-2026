import ShineAnimation from "@/components/(frontend)/global/_Templates/ShineAnimation/ShineAnimation";
import { ArrowRight } from "lucide-react";

export default function ContentDetailBuyNowButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-moss px-2 py-2 text-center text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-moss/95"
    >
      <ShineAnimation isPersistent />
      Buy Now
      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
    </button>
  );
}
