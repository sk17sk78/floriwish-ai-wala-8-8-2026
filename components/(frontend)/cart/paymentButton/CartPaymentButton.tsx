// icons
import { ArrowRight, Check } from "lucide-react";

// hooks
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSetting } from "@/hooks/useSetting/useSetting";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { usePayment } from "@/hooks/usePayment/usePayment";
import { useCart } from "@/hooks/useOptimizedCart/useCart";
import { type ContentDocument } from "@/common/types/documentation/contents/content";


// components
import CartPaymentGateway from "./CartPaymentGateway";

export default function CartPaymentButton({
  onChangeShowCheckoutDetail,
  onValidationTrigger
}: {
  onChangeShowCheckoutDetail: (showCheckoutDetail: boolean) => void;
  onValidationTrigger: () => void;
}) {
  // hooks
  const { toast } = useToast();
  const { payment } = useSetting();
  const {
    auth: {
      data: { isAuthenticated },
      method: { onChangeShowAuth }
    },
    cart: {
      data: { cart }
    },
    profile: {
      data: { cartId }
    }
  } = useAppStates();
  const { onInitiateNewPayment } = usePayment();
  const { onCreateCart } = useCart();

  // states
  const [gateway, setGateway] = useState<"razorpay" | "payu">("razorpay");

  // variables
  const defaultGateway = payment?.default || "razorpay";
  const showSelectGateway = payment?.active?.razorpay && payment?.active?.payu;

  const areItemsComplete = cart?.items?.every((item) => {
    const content = item.content as ContentDocument;
    const isAllIndia = content?.availability?.availableAt === "all-india";

    if (isAllIndia) {
      return item.delivery?.date;
    }
    return (
      item.delivery?.date && item.delivery?.type && item.delivery?.slot
    );
  });

  const isCheckoutComplete = Boolean(
    cart?.checkout?.location?.address &&
      cart?.checkout?.location?.city &&
      cart?.checkout?.location?.pincode &&
      areItemsComplete
  );

  // side effects
  useEffect(() => {
    setGateway(defaultGateway);
  }, [defaultGateway]);

  return (
    <div
      className={
        "w-full max-lg:z-40 flex flex-col justify-center"
      }
    >
      {isAuthenticated && showSelectGateway && (
        <CartPaymentGateway
          gateway={gateway}
          onChangeGateway={setGateway}
        />
      )}
      <div
        onClick={
          isAuthenticated
            ? cart?.checkout && isCheckoutComplete
              ? cartId
                ? () => {
                    onInitiateNewPayment({
                      gateway,
                      cartId,
                      amount: cart.price.payable,
                      percentage: cart.price.paymentPercentage
                    });
                  }
                : () => {
                    onCreateCart();

                    toast({
                      title: "Something Went Wrong",
                      description: "Please try again.",
                      variant: "warning"
                    });
                  }
              : () => {
                  if (
                    cart?.checkout?.location?.address &&
                    cart?.checkout?.location?.city &&
                    cart?.checkout?.location?.pincode &&
                    !areItemsComplete
                  ) {
                    onValidationTrigger();
                    toast({
                      title: "Delivery Slots Not Selected",
                      description: "Please select delivery date and time for all items.",
                      variant: "warning"
                    });
                  } else {
                    onChangeShowCheckoutDetail(true);
                  }
                }
            : () => {
                onChangeShowAuth(true);
              }
        }
        className={`z-10 group relative flex items-center justify-center cursor-pointer rounded-2xl text-lg md:text-sm lg:text-lg font-bold shadow-lg py-4 md:py-3 px-6 md:px-4 transition-all duration-300 ${isAuthenticated ? (cart?.checkout && isCheckoutComplete ? "bg-sienna-1 text-white hover:brightness-110" : "bg-charcoal-3/10 text-charcoal-3/40") : "bg-charcoal-3 text-white"}`}
      >
        <span className="flex items-center gap-2">
          {isAuthenticated
            ? cart?.checkout && isCheckoutComplete
              ? "Complete Checkout"
              : cart?.checkout?.location?.address &&
                cart?.checkout?.location?.city &&
                cart?.checkout?.location?.pincode &&
                !areItemsComplete
                ? "Select Delivery Slots"
                : "Complete Details"
            : "Login to Checkout"}
          <ArrowRight width={20} height={20} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>


    </div>
  );
}
