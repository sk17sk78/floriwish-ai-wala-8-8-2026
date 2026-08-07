// icons
import { BadgePercent } from "lucide-react";

// constants
import { INRSymbol } from "@/common/constants/symbols";
import { IS_MOBILE } from "@/common/constants/mediaQueries";

// hooks
import { useMediaQuery } from "usehooks-ts";
import { useCart } from "@/hooks/useOptimizedCart/useCart";
import { HorizontalSpacing } from "@/components/(frontend)/global/_Spacings/HorizontalSpacings";

export default function CartSavingAmount() {
  // hooks
  const isMobile = useMediaQuery(IS_MOBILE);
  const { savingAmount } = useCart();

  return (
    <div className="w-full bg-sienna-1/10 border-y border-sienna-1/20 py-2.5 mb-1">
      <HorizontalSpacing className="flex items-center gap-3 max-w-[1280px] mx-auto">
        <div className="bg-sienna-1 rounded-full p-1 flex-shrink-0">
          <BadgePercent
            strokeWidth={3}
            width={14}
            height={14}
            className="text-white"
          />
        </div>
        <span className="text-sienna-1 text-[13px] font-bold tracking-tight">
          {`You're saving `}
          <span>{`${INRSymbol} ${savingAmount}`}</span>
          {` on this order!`}
        </span>
      </HorizontalSpacing>
    </div>
  );
}
