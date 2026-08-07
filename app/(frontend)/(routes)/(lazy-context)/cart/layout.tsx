// providers
import { CartProvider } from "@/hooks/useOptimizedCart/useCart";
import { CustomerProfileProvider } from "@/hooks/useCustomerProfile";
import { PaymentProvider } from "@/hooks/usePayment/usePayment";

// components
import CartHeader from "@/components/(frontend)/components/header/cart/CartHeader";
import MadeWithLoveInIndia from "@/components/(_common)/utils/MadeWithLoveInIndia";

// types
import { type Children } from "@/common/types/reactTypes";

export default function FrontendTransactionRoot({
  children
}: {
  children: Children;
}) {
  return (
    <CustomerProfileProvider>
      <CartProvider>
        <PaymentProvider>
          <div className="relative min-h-screen bg-ivory-1">
            <CartHeader />
            <main>{children}</main>
          </div>
          {/* <MadeWithLoveInIndia hide /> */}
        </PaymentProvider>
      </CartProvider>
    </CustomerProfileProvider>
  );
}
