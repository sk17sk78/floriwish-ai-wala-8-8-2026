// hooks
import { useEffect, useState } from "react";
import { useDispatch } from "@/store/withType";

// redux
import { createCartAction } from "@/store/features/dynamic/cartSlice";

// components
import Input from "@/lib/Forms/Input/Input";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type OrderStatus } from "./types/type";

export default function OrderStatus({
  cartId,
  cartItems,
  cartItemId,
  status,
  isDisabled
}: {
  cartId: string;
  cartItems: CartItemDocument[];
  cartItemId: string;
  status: OrderStatus;
  isDisabled: boolean;
}) {
  // hooks
  const dispatch = useDispatch();

  // status
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(status);

  // side effects
  useEffect(() => {
    setOrderStatus(status);
  }, [status, cartItemId]);

  return (
    <Input
      className="w-full min-w-[105px] max-w-[125px] text-xs"
      type="dropdown"
      name="status"
      isRequired={false}
      isDisabled={isDisabled}
      errorCheck={false}
      validCheck={false}
      nullOption={false}
      options={[
        { label: "Order Confirmed", value: "new" },
        { label: "Being Prepared", value: "preparing" },
        { label: "Out for Delivery", value: "on-the-way" },
        { label: "Delivered", value: "completed" },
        { label: "Cancelled", value: "cancelled" }
      ]}
      customValue={{
        value: orderStatus,
        setValue: (newStatus) => {
          dispatch(
            createCartAction.updateDocument({
              documentId: cartId,
              updateData: {
                items: [...cartItems].map((cartItem) => {
                  if (String(cartItem._id) === String(cartItemId)) {
                    const updatedCartItem = { ...cartItem };

                    updatedCartItem.status = newStatus as OrderStatus;
                    (updatedCartItem as any).updatedAt = new Date();

                    return updatedCartItem;
                  }

                  return cartItem;
                }) as CartItemDocument[]
              }
            })
          );

          setOrderStatus(newStatus as OrderStatus);
        }
      }}
    />
  );
}
