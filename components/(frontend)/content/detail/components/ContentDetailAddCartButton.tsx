// icons
import { ShoppingCart } from "lucide-react";

// utils
import { memo } from "react";

function ContentDetailAddCartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="relative z-[901] flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-[#e3ccd4] bg-white px-2 py-2 text-center text-sm font-semibold text-moss transition-all duration-300 hover:border-moss/40 hover:bg-[#fff8fa]"
      onClick={onClick}
    >
      <ShoppingCart width={14} height={14} />
      <span>Add to Cart</span>
    </button>
  );
}

export default memo(ContentDetailAddCartButton);
