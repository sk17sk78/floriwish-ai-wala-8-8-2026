// icons
import { Trash2 } from "lucide-react";

export default function CartItemAction({
  showDelete,
  quantity,
  onChangeShowDelete,
  onChangeQuantity
}: {
  showDelete: boolean;
  quantity: number;
  onChangeShowDelete: (showDelete: boolean) => void;
  onChangeQuantity: (quantity: number) => void;
}) {
  // event handlers
  const handleIncrement = () => {
    onChangeQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onChangeQuantity(quantity - 1);
    }
  };

  return (
    <div className="flex flex-col items-end gap-3 sm:gap-4">
      <div
        className={`absolute top-4 right-4 sm:static sm:top-auto sm:right-auto text-charcoal-3/40 hover:text-red-500 transition-all duration-300 cursor-pointer ${showDelete ? "pointer-events-none opacity-0" : "opacity-100"}`}
        onClick={() => {
          onChangeShowDelete(true);
        }}
      >
        <Trash2
          strokeWidth={1.5}
          width={18}
          height={18}
        />
      </div>

      <div className="flex items-center border border-charcoal-3/15 rounded-lg bg-ivory-1/50 overflow-hidden shadow-sm">
        <button
          onClick={handleDecrement}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-charcoal-3/5 transition-all text-charcoal-3/70 font-medium"
        >
          -
        </button>
        <div className="w-8 h-7 sm:w-10 sm:h-8 flex items-center justify-center border-x border-charcoal-3/15 bg-white text-charcoal-3 font-bold text-sm">
          {quantity}
        </div>
        <button
          onClick={handleIncrement}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-sienna-1 text-white hover:brightness-110 transition-all font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
