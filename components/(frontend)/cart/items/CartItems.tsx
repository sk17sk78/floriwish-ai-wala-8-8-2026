// hooks
import { useCart } from "@/hooks/useOptimizedCart/useCart";

// components
import CartItem from "./components/CartItem";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { INRSymbol } from "@/common/constants/symbols";

export default function CartItems({
  validationTriggered
}: {
  validationTriggered: boolean;
}) {
  // hooks
  const { savingAmount, items, onChangeItems } = useCart();

  // event handlers
  const handleChangeItem = (changedItem: CartItemDocument) => {
    onChangeItems(
      [...items].map((item) =>
        String(item._id) === String(changedItem._id) ? changedItem : item,
      ),
    );
  };

  const handleDeleteItem = (itemId: string) => {
    onChangeItems(items.filter(({ _id }) => String(_id) !== String(itemId)));
  };

  return (
    <div
      className={
        "flex flex-col justify-start transition-all duration-300 gap-4"
      }
    >

      {items.map((item) => (
        <div className="lg:space-y-4" key={String(item._id)}>
          <CartItem
            item={item}
            validationTriggered={validationTriggered}
            onChangeItem={handleChangeItem}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      ))}
    </div>
  );
}
