// hooks
import { useMediaQuery } from "usehooks-ts";

// constants
import { IS_MOBILE } from "@/common/constants/mediaQueries";

export default function CartCheckoutSaveButton({
  disabled,
  onSave
}: {
  disabled: boolean;
  onSave: () => void;
}) {
  const isMobile = useMediaQuery(IS_MOBILE);

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={disabled}
      className={`w-full rounded-xl px-5 py-3 text-center text-sm font-bold text-white transition-all duration-200 ${
        disabled 
          ? "cursor-not-allowed bg-ash-3/40" 
          : "bg-sienna-1 hover:bg-sienna-2 active:scale-[0.98] shadow-lg shadow-sienna-1/20"
      }`}
    >
      Save & Continue
    </button>
  );
}
