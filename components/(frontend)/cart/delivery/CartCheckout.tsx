// icons
import { Check, MapPin, PenLine } from "lucide-react";

// constants
import { IS_MOBILE, IS_TABLET } from "@/common/constants/mediaQueries";

// hooks
import { useEffect, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useCart } from "@/hooks/useOptimizedCart/useCart";

// components
import CartCheckoutDialog from "./components/CartCheckoutDialog";
import CartCheckoutContactPreview from "./components/CartCheckoutContactPreview";
import CartCheckoutLocationPreview from "./components/CartCheckoutLocationPreview";

export default function CartCheckout({
  showCheckoutDetail,
  onChangeShowCheckoutDetail
}: {
  showCheckoutDetail: boolean;
  onChangeShowCheckoutDetail: (showCheckoutDetail: boolean) => void;
}) {
  // hooks
  const isTablet = useMediaQuery(IS_TABLET);
  const {
    auth: {
      data: { isAuthenticated },
      method: { onChangeShowAuth }
    }
  } = useAppStates();
  const { checkout } = useCart();

  // states
  const [direction, setDirection] = useState<"up" | "down">("down");

  useEffect(() => {
    const timer = setInterval(
      () => setDirection((prev) => (prev === "down" ? "up" : "down")),
      4000
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {isTablet ? (
        isAuthenticated ? (
          <div className="row-start-5 w-full h-fit py-2">
            <section className="bg-white rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-ivory-1/50 px-5 py-3 border-b border-charcoal-3/10">
                <span className="text-[11px] font-extrabold text-charcoal-3/60 uppercase tracking-[0.1em]">
                  Delivery At
                </span>
              </div>
              
              <div 
                onClick={() => {
                  !isAuthenticated
                    ? onChangeShowAuth(true)
                    : onChangeShowCheckoutDetail(true);
                }}
                className="p-4 flex items-center justify-between cursor-pointer group hover:bg-ivory-1/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-full border border-red-100">
                    <MapPin width={20} height={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${checkout ? "text-charcoal-3" : "text-red-500"}`}>
                      {checkout ? "Deliver to" : "Add delivery address"}
                    </span>
                    <span className="text-xs text-charcoal-3/60 line-clamp-1 max-w-[200px]">
                      {checkout 
                        ? `${checkout.location.address}, ${checkout.location.city}` 
                        : "Click here to add your address"}
                    </span>
                  </div>
                </div>
                <PenLine width={16} height={16} className="text-charcoal-3/30 group-hover:text-charcoal-3 transition-colors" />
              </div>
            </section>
          </div>
        ) : (
          <></>
        )
      ) : (
        <>
          {/* <div
          className={
            "px-3 min-[1350px]:px-0 max-lg:hidden lg:!pl-7 lg:border-l border-charcoal-3/20 max-md:pt-3 pb-3 lg:!py-4 h-fit"
          }>
          <div
            onClick={() => {
              !isAuthenticated
                ? onChangeShowAuth(true)
                : onChangeShowCheckoutDetail(true);
              // onChangeShowCheckoutDetail(true);
            }}
            className={`relative border border-charcoal-3/20 bg-ivory-1 rounded-2xl px-5 z-50 lg:row-start-2 lg:col-start-1 cursor-pointer grid grid-rows-[50px_50px] lg:grid-rows-[74px_74px] overflow-hidden lg:h-[74px] transition-all duration-300 ${isAuthenticated ? "hover:border-charcoal-3/50" : ""}`}
          >
            <CartCheckoutLocationPreview direction={direction} />
            <CartCheckoutContactPreview direction={direction} />
            {!isAuthenticated && (
              <div className="absolute w-full h-full bg-ash/30 text-charcoal-3 flex items-center justify-center backdrop-blur-[2px]">
                <span className="font-medium text-lg">Login first</span>
              </div>
            )}
          </div>
        </div> */}

          <div
            className={
              "w-full h-fit"
            }>
            <section className="bg-white rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-ivory-1/50 px-5 py-3 border-b border-charcoal-3/10">
                <span className="text-[11px] font-extrabold text-charcoal-3/60 uppercase tracking-[0.1em]">
                  Delivery At
                </span>
              </div>
              
              <div 
                onClick={() => {
                  !isAuthenticated
                    ? onChangeShowAuth(true)
                    : onChangeShowCheckoutDetail(true);
                }}
                className="p-5 flex items-center justify-between cursor-pointer group hover:bg-ivory-1/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sienna-1/10 text-sienna-1 rounded-full border border-sienna-1/20">
                    <MapPin width={20} height={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${checkout ? "text-charcoal-3" : "text-sienna-1"}`}>
                      {checkout ? "Deliver to" : "Add delivery address"}
                    </span>
                    <span className="text-xs text-charcoal-3/60 line-clamp-1 max-w-[180px]">
                      {checkout 
                        ? `${checkout.location.address}, ${checkout.location.city}` 
                        : "Click here to add your address"}
                    </span>
                  </div>
                </div>
                <PenLine width={16} height={16} className="text-charcoal-3/30 group-hover:text-charcoal-3 transition-colors" />
              </div>
            </section>
          </div>
        </>
      )}
      <CartCheckoutDialog
        showDialog={showCheckoutDetail}
        onChangeShowDialog={onChangeShowCheckoutDetail}
      />
    </>
  );
}
