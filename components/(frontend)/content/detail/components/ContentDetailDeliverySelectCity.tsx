// hooks
import { lazy, Suspense, useEffect, useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
const LazyContentDetailDeliveryCityList = lazy(
  () => import("./ContentDetailDeliveryCityList"),
);

// types
import { type ChangeEvent } from "react";

export default function ContentDetailDeliverySelectCity() {
  // hooks
  const {
    location: {
      data: { selectedCity },
    },
  } = useAppStates();

  // states
  const [keyword, setKeyword] = useState<string>(
    selectedCity ? selectedCity.name : "",
  );
  const [showPopover, setShowPopover] = useState<boolean>(false);

  // event handlers
  const handleChangeKeyword = (keyword: string) => {
    if (!showPopover && keyword.length) {
      setShowPopover(true);
    }

    setKeyword(keyword);
  };

  // side effects
  useEffect(() => {
    if (selectedCity) {
      setKeyword(selectedCity.name);
    } else {
      setKeyword("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  useEffect(() => {
    if (!showPopover) {
      if (selectedCity && keyword !== selectedCity.name) {
        setKeyword(selectedCity.name);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopover]);

  return (
    <div className="relative rounded-md border border-[#efe8eb] bg-[#faf8f9] p-0">
      <input
        type={"text"}
        autoComplete="off"
        name={"contentPageSelectPincode"}
        value={keyword}
        onFocus={() => {
          if (keyword.length) {
            setShowPopover(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setShowPopover(false);
          }, 200);
        }}
        onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
          handleChangeKeyword(value);
        }}
        placeholder={"Enter City"}
        className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-xs font-medium text-charcoal-3 outline-none transition-all duration-300 placeholder:text-charcoal-3/45 focus:border-moss/15 focus:bg-white"
      />
      {showPopover && keyword.length > 1 && (
        <section
          className="absolute left-0 top-[58px] z-[999] flex max-h-[270px] w-full flex-col justify-start overflow-y-scroll rounded-2xl border border-[#eee6e9] bg-white shadow-[0_20px_44px_rgba(17,24,39,0.08)] scrollbar-hide p-2 py-2.5"
        >
          <Suspense fallback={<></>}>
            <LazyContentDetailDeliveryCityList
              showPopover={showPopover}
              keyword={keyword}
              onChangeShowPopover={setShowPopover}
            />
          </Suspense>
        </section>
      )}
    </div>
  );
}
