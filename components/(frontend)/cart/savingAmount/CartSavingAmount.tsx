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
    <div 
      className="w-full border-b py-2"
      style={{ 
        backgroundColor: 'rgba(90, 15, 46, 0.03)',
        borderBottomColor: 'rgba(90, 15, 46, 0.08)'
      }}
    >
      <HorizontalSpacing className="flex items-center gap-2 max-w-[1280px] mx-auto">
        <div 
          className="rounded-full p-1 flex-shrink-0"
          style={{ backgroundColor: '#5A0F2E' }}
        >
          <BadgePercent
            strokeWidth={3}
            width={12}
            height={12}
            className="text-white"
          />
        </div>
        <span 
          className="text-[12px] sm:text-[13px] font-bold tracking-tight"
          style={{ color: '#5A0F2E' }}
        >
          {`You're saving `}
          <span>{`${INRSymbol} ${savingAmount}`}</span>
          {` on this order!`}
        </span>
      </HorizontalSpacing>
    </div>
  );
}
