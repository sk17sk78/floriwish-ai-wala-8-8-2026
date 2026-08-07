// icons
import {
  ChevronDown,
  House,
  MapPin,
  UserPen,
  X
} from "lucide-react";

// requests
import { fetchOccasions } from "@/request/preset/occasion";

// hooks
import { useEffect, useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useCart } from "@/hooks/useOptimizedCart/useCart";

// components
import CartCheckoutSaveButton from "./CartCheckoutSaveButton";

// types
import { type CartCheckoutDocument } from "@/common/types/documentation/nestedDocuments/cartCheckout";
import { type ChangeEvent } from "react";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type OccasionDocument } from "@/common/types/documentation/presets/occasion";

export default function CartCheckoutDetail({
  onClose
}: {
  onClose: () => void;
}) {
  // hooks
  const {
    isReady,
    location: {
      data: { selectedCity }
    },
    profile: {
      data: { addresses: customerAddresses, detail: customerDetail }
    }
  } = useAppStates();
  const {
    items: cartItems,
    checkout: cartCheckout,
    onChangeCheckout
  } = useCart();

  // states
  const [checkout, setCheckout] = useState<CartCheckoutDocument>({
    name: "",
    contact: {
      mobileNumber: "",
      mail: ""
    },
    location: {
      address: "",
      city: "",
      pincode: ""
    },
    deliverToSomeoneElse: false,
    receiverName: "",
    receiverMobileNumber: ""
  } as CartCheckoutDocument);
  const [occasions, setOccasions] = useState<OccasionDocument[]>([
    { _id: "bday", name: "Birthday" },
    { _id: "anniv", name: "Anniversary" },
    { _id: "wedding", name: "Wedding" },
    { _id: "celebration", name: "Celebration" },
    { _id: "congrats", name: "Congratulations" },
    { _id: "love", name: "Love & Romance" }
  ] as unknown as OccasionDocument[]);
  const [showOccasionList, setShowOccasionList] = useState(false);

  // variables
  const isOnlyAllIndiaDeliverableItems =
    cartItems?.length ===
    cartItems.filter(
      ({ content }) =>
        (content as ContentDocument)?.availability?.availableAt === "all-india"
    )?.length;

  const canSave =
    checkout.name &&
    checkout.contact.mobileNumber &&
    checkout.contact.mail &&
    checkout.location.address &&
    checkout.location.city &&
    checkout.location.pincode &&
    (!checkout.deliverToSomeoneElse || (checkout.receiverName && checkout.receiverMobileNumber));

  // event handlers
  const handleSave = () => {
    onChangeCheckout(checkout);
    onClose();
  };

  // side effects
  useEffect(() => {
    if (!occasions.length) {
      fetchOccasions({
        active: true,
        orderBy: "asc",
        sortBy: "name"
      })
        .then((response) => {
          if (response.data && (response.data as any[]).length > 0) {
            setOccasions(response.data as OccasionDocument[]);
          }
        })
        .catch((err) => {
          
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isReady) {
      setCheckout({
        name: cartCheckout?.name || customerDetail?.name || "",
        contact: {
          mobileNumber:
            cartCheckout?.contact?.mobileNumber ||
            customerDetail?.mobileNumber?.split("-")[1] ||
            "",
          mail: cartCheckout?.contact?.mail || customerDetail?.mail || ""
        },
        location: {
          address:
            cartCheckout?.location?.address ||
            customerAddresses?.find(({ isDefault }) => isDefault)?.address ||
            "",
          city: isOnlyAllIndiaDeliverableItems
            ? cartCheckout?.location?.city
            : selectedCity?.name || "",
          pincode: cartCheckout?.location?.pincode || ""
        },
        ...(cartCheckout?.occasion ? { occasion: cartCheckout?.occasion } : {}),
        deliverToSomeoneElse: cartCheckout?.deliverToSomeoneElse || false,
        receiverName: cartCheckout?.receiverName || "",
        receiverMobileNumber: cartCheckout?.receiverMobileNumber || ""
      } as CartCheckoutDocument);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const inputStyles = "w-full rounded-xl border border-ash-3/30 bg-ivory-2 px-3.5 py-2.5 text-sm text-charcoal-3 placeholder-charcoal-3/40 outline-none transition-all duration-200 focus:border-sienna-1/40 focus:ring-2 focus:ring-sienna-1/15 focus:bg-white";
  const labelStyles = "mb-1.5 block text-xs font-bold text-charcoal-3/60 uppercase tracking-tight";

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full bg-ivory-1">
      {/* Header */}
      <div className="shrink-0 border-b border-ash-3/20 p-4 sm:px-6 py-4 relative">
        <h2 className="text-base font-bold text-charcoal-2">Delivery Details</h2>
        <p className="mt-0.5 text-xs text-charcoal-3/60">Enter your contact and delivery information</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 scrollbar-hide max-h-full">
        <div className="flex flex-col gap-6 pb-20">
          
          {/* Your Information Section */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold tracking-widest text-charcoal-3/40 uppercase">Your Information</p>
            
            <div>
              <label className={labelStyles}>Full Name <span className="text-red-400">*</span></label>
              <input 
                placeholder="Enter your full name" 
                className={inputStyles}
                type="text" 
                value={checkout.name}
                onChange={(e) => setCheckout({...checkout, name: e.target.value} as CartCheckoutDocument)}
              />
            </div>

            <div>
              <label className={labelStyles}>Email Address <span className="text-red-400">*</span></label>
              <input 
                placeholder="Enter your email" 
                className={inputStyles}
                type="email" 
                value={checkout.contact.mail}
                onChange={(e) => setCheckout({...checkout, contact: {...checkout.contact, mail: e.target.value}} as CartCheckoutDocument)}
              />
            </div>

            <div>
              <label className={labelStyles}>Mobile Number <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <div className="w-[72px] shrink-0 rounded-xl border border-ash-3/30 bg-ivory-2 px-2 py-2.5 text-sm text-charcoal-3 flex items-center justify-center font-medium">
                  +91
                </div>
                <input 
                  placeholder="10-digit mobile number" 
                  className={inputStyles + " flex-1"}
                  type="tel"
                  maxLength={10}
                  value={checkout.contact.mobileNumber}
                  onChange={(e) => setCheckout({...checkout, contact: {...checkout.contact, mobileNumber: e.target.value.replace(/\D/g, '')}} as CartCheckoutDocument)}
                />
              </div>
            </div>

            <div className="relative">
              <label className={labelStyles}>Occasion</label>
              <div className="relative">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOccasionList(!showOccasionList);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-ash-3/10 bg-ivory-2 px-3.5 py-3 text-sm font-medium text-charcoal-3 transition-all duration-300 hover:bg-ash-3/20 focus:ring-2 focus:ring-sienna-1/15 outline-none"
                >
                  <span>{occasions.find(o => String(o._id) === String(checkout.occasion))?.name || "Select Occasion"}</span>
                  <ChevronDown size={20} className={`text-charcoal-3/40 transition-transform ${showOccasionList ? 'rotate-180' : ''}`} />
                </button>
                
                {showOccasionList && (
                  <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-60 overflow-y-auto rounded-xl border border-ash-3/20 bg-ivory-1 shadow-xl">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCheckout({...checkout, occasion: undefined} as CartCheckoutDocument);
                          setShowOccasionList(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-charcoal-3/50 hover:bg-ivory-2"
                      >
                        Select Occasion
                      </button>
                      {occasions.length === 0 && (
                        <div className="px-4 py-2.5 text-sm text-charcoal-3/40 italic">
                          No occasions found
                        </div>
                      )}
                      {occasions.map((occ) => (
                        <button
                          key={String(occ._id)}
                          onClick={() => {
                            setCheckout({...checkout, occasion: String(occ._id)} as CartCheckoutDocument);
                            setShowOccasionList(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-charcoal-3 hover:bg-sienna-3/20 hover:text-sienna-1 transition-colors"
                        >
                          {occ.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-ash-3/20"></div>

          {/* Delivery Location Section */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-bold tracking-widest text-charcoal-3/40 uppercase">Delivery Location</p>
            
            <div>
              <label className={labelStyles}>City <span className="text-red-400">*</span></label>
              <input 
                placeholder="Enter city name" 
                className={inputStyles}
                type="text" 
                value={checkout.location.city}
                disabled={!isOnlyAllIndiaDeliverableItems}
                onChange={(e) => setCheckout({...checkout, location: {...checkout.location, city: e.target.value}} as CartCheckoutDocument)}
              />
            </div>

            <div>
              <label className={labelStyles}>Delivery Address <span className="text-sienna-1">*</span></label>
              <div className="relative rounded-xl border border-ash-3/30 bg-ivory-2 px-3.5 py-2.5 transition-all duration-200 focus-within:border-sienna-1/40 focus-within:ring-2 focus-within:ring-sienna-1/15 focus-within:bg-white">
                <textarea 
                  placeholder="House/Flat No., Street, Area, Landmark" 
                  rows={3} 
                  className="w-full resize-none bg-transparent text-sm text-charcoal-3 placeholder-charcoal-3/40 focus:outline-none"
                  value={checkout.location.address}
                  onChange={(e) => setCheckout({...checkout, location: {...checkout.location, address: e.target.value}} as CartCheckoutDocument)}
                />
                <div className="flex items-center justify-between border-t border-dashed border-ash-3/40 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-charcoal-3/40 uppercase tracking-tight">
                    <House size={12} />
                    <span>Saved addresses</span>
                  </div>
                  <button type="button" className="text-xs font-semibold text-sienna-1 hover:underline">View All</button>
                </div>
              </div>
            </div>

            <div>
              <label className={labelStyles}>Pincode <span className="text-sienna-1">*</span></label>
              <input 
                placeholder="6-digit pincode" 
                className={inputStyles}
                type="text"
                maxLength={6}
                value={checkout.location.pincode}
                onChange={(e) => setCheckout({...checkout, location: {...checkout.location, pincode: e.target.value.replace(/\D/g, '')}} as CartCheckoutDocument)}
              />
            </div>

            <div>
              <label className={labelStyles}>Landmark</label>
              <input 
                placeholder="Nearby famous place" 
                className={inputStyles}
                type="text"
                value={checkout.location.landmark || ""}
                onChange={(e) => setCheckout({...checkout, location: {...checkout.location, landmark: e.target.value}} as CartCheckoutDocument)}
              />
            </div>
          </div>

          <div className="h-px bg-ash-3/20"></div>

          {/* Deliver to Someone Else Section */}
          <div className="flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => setCheckout({...checkout, deliverToSomeoneElse: !checkout.deliverToSomeoneElse} as CartCheckoutDocument)}
              className="flex w-full items-center justify-between rounded-xl border border-ash-3/30 bg-ivory-2 px-4 py-3 transition-colors hover:bg-ash-3/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ash-3/20 text-charcoal-3/60">
                  <UserPen size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-charcoal-3">Deliver to someone else</p>
                  <p className="text-xs text-charcoal-3/40">Add a separate receiver&apos;s details</p>
                </div>
              </div>
              <div className={`relative flex h-6 w-10 shrink-0 items-center rounded-full p-1 transition-all duration-300 ${checkout.deliverToSomeoneElse ? 'bg-sienna-1' : 'bg-ash-3/40'}`}>
                <div className={`aspect-square h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checkout.deliverToSomeoneElse ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </button>

            {checkout.deliverToSomeoneElse && (
              <div className="flex flex-col gap-4 p-4 rounded-xl border border-ash-3/10 bg-ivory-2/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className={labelStyles}>Receiver&apos;s Name <span className="text-sienna-1">*</span></label>
                  <input 
                    placeholder="Enter receiver&apos;s full name" 
                    className={inputStyles}
                    type="text" 
                    value={checkout.receiverName}
                    onChange={(e) => setCheckout({...checkout, receiverName: e.target.value} as CartCheckoutDocument)}
                  />
                </div>
                <div>
                  <label className={labelStyles}>Receiver&apos;s Mobile <span className="text-sienna-1">*</span></label>
                  <div className="flex gap-2">
                    <div className="w-[72px] shrink-0 rounded-xl border border-ash-3/30 bg-ivory-2 px-2 py-2.5 text-sm text-charcoal-3 flex items-center justify-center font-medium">
                      +91
                    </div>
                    <input 
                      placeholder="10-digit mobile number" 
                      className={inputStyles + " flex-1"}
                      type="tel"
                      maxLength={10}
                      value={checkout.receiverMobileNumber}
                      onChange={(e) => setCheckout({...checkout, receiverMobileNumber: e.target.value.replace(/\D/g, '')} as CartCheckoutDocument)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer Button */}
      <div className="shrink-0 border-t border-ash-3/20 bg-ivory-1 p-4 sm:px-6 py-4">
        <CartCheckoutSaveButton
          disabled={!canSave}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
