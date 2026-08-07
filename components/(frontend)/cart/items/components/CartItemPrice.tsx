// icons
import { INRSymbol } from "@/common/constants/symbols";

export default function CartItemPrice({
  price,
  mrp
}: {
  price: number;
  mrp?: number;
}) {
  const showDiscount = Boolean(mrp && mrp > price);
  const discountPercentage = showDiscount
    ? Math.min(99, Math.ceil(100 - (price * 100) / mrp!))
    : 0;

  return (
    <div className="flex items-center justify-start gap-2 mt-1.5 sm:my-1 flex-wrap">
      {/* Selling Price */}
      <span className="text-charcoal-3 text-xl font-bold sm:text-2xl leading-none">
        {`${INRSymbol}${price}`}
      </span>

      {/* MRP & Discount Badge */}
      {showDiscount && (
        <>
          <del className="text-charcoal-3/40 text-sm font-medium line-through decoration-charcoal-3/40">
            {`${INRSymbol}${mrp}`}
          </del>
          <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 leading-none tracking-wide">
            {`${discountPercentage}% OFF`}
          </span>
        </>
      )}
    </div>
  );
}
