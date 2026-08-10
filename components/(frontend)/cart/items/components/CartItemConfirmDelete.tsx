// icons
import { Trash2 } from "lucide-react";

// constants
import { IS_MOBILE } from "@/common/constants/mediaQueries";

// hooks
import { useMediaQuery } from "usehooks-ts";

export default function CartItemConfirmDelete({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // hooks
  const isMobile = useMediaQuery(IS_MOBILE);

  return (
    <div
      className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-[3px] flex flex-col items-center justify-center p-4 transition-all duration-300 animate-in fade-in rounded-xl sm:rounded-2xl"
    >
      <div className="bg-white border border-red-100 shadow-2xl rounded-2xl p-6 flex flex-col items-center gap-4 max-w-[280px] w-full transform scale-100 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <Trash2 width={24} height={24} />
        </div>
        
        <div className="text-center">
          <h3 className="text-charcoal-3 font-bold text-lg">Remove Item?</h3>
          <p className="text-charcoal-3/60 text-sm mt-1">Are you sure you want to remove this from your cart?</p>
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-3/10 text-charcoal-3 font-bold text-sm hover:bg-charcoal-3/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-md shadow-red-200"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
