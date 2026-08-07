// hooks
import { useSelector } from "@/store/withType";

// redux
import { selectCity } from "@/store/features/presets/citySlice";
import { selectOccasion } from "@/store/features/presets/occasionSlice";
import { selectVenue } from "@/store/features/presets/venueSlice";

// types
import { type CartCheckoutDocument } from "@/common/types/documentation/nestedDocuments/cartCheckout";
import { type CustomerDocument } from "@/common/types/documentation/users/customer";
import {
  Asterisk,
  Mail,
  MapPin,
  PartyPopper,
  Smartphone,
  UserRound,
  UserRoundCheck
} from "lucide-react";

export default function OrderDeliveryData({
  checkout,
  customer
}: {
  checkout: CartCheckoutDocument;
  customer?: CustomerDocument;
}) {
  // redux states
  const { documents: cities } = useSelector(selectCity.documentList);
  const { documents: occasions } = useSelector(selectOccasion.documentList);
  const { documents: venues } = useSelector(selectVenue.documentList);

  // variables
  const occasion = occasions.find(({ _id }) => String(_id) === String(checkout?.occasion));
  const venue = venues.find(({ _id }) => String(_id) === String(checkout?.venue));

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-zinc-100">
      {/* Customer / Sender Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <UserRound size={16} />
          Customer Details
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-20 text-zinc-400">Name:</span>
            <span className="font-medium text-zinc-800">{checkout?.name || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-20 text-zinc-400">Mobile:</span>
            <span className="font-medium text-zinc-800">{checkout?.contact?.mobileNumber || "N/A"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-20 text-zinc-400">Email:</span>
            <span className="font-medium text-zinc-800 underline decoration-zinc-200 underline-offset-4">{checkout?.contact?.mail || "N/A"}</span>
          </div>
          {occasion && (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-20 text-zinc-400">Occasion:</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                <PartyPopper size={12} />
                {occasion.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Receiver Information (if different) */}
      <div className="space-y-4 md:border-l md:pl-6 border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <UserRoundCheck size={16} />
          {checkout?.deliverToSomeoneElse ? "Receiver Details" : "Same as Customer"}
        </h3>
        {checkout?.deliverToSomeoneElse ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-20 text-zinc-400">Name:</span>
              <span className="font-bold text-red-600">{checkout?.receiverName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-20 text-zinc-400">Mobile:</span>
              <span className="font-bold text-red-600">{checkout?.receiverMobileNumber || "N/A"}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">Order will be delivered to the customer themselves.</p>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-50 space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
            <MapPin size={14} />
            Delivery Address
          </h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-medium">
                {(() => {
                  const cityValue = checkout?.location?.city || (checkout as any)?.city;
                  if (!cityValue) {
                    // Fallback: try to find city from customer addresses by matching pincode
                    if (customer && customer.addresses && checkout?.location?.pincode) {
                      const matchingAddress = customer.addresses.find(
                        (addr) => addr.pincode === checkout.location.pincode
                      );
                      if (matchingAddress) {
                        const cityDoc = cities.find(
                          ({ _id, name }) =>
                            String(_id) === String(matchingAddress.city) ||
                            name === matchingAddress.city
                        );
                        if (cityDoc) return cityDoc.name;
                        return matchingAddress.city;
                      }
                    }
                    return "City N/A";
                  }

                  const cityDoc = cities.find(
                    ({ _id }) =>
                      String(_id) === String(cityValue) ||
                      (typeof cityValue === "object" &&
                        cityValue !== null &&
                        String(_id) === String((cityValue as any)._id))
                  );

                  if (cityDoc) return cityDoc.name;

                  if (typeof cityValue === "string") return cityValue;
                  if (typeof cityValue === "object" && cityValue !== null)
                    return (cityValue as any).name || "City N/A";

                  return "City N/A";
                })()}
              </span>
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-medium">
                {checkout?.location?.pincode || "Pincode N/A"}
              </span>
            </div>
            <p className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-2.5 rounded-lg border border-zinc-100/50">
              {checkout?.location?.address || "No address provided"}
            </p>
            {checkout?.location?.landmark && (
              <p className="text-xs text-zinc-500">
                <span className="font-semibold">Landmark:</span> {checkout.location.landmark}
              </p>
            )}
          </div>
        </div>
      </div>

      {venue && (
        <div className="md:col-span-2 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Asterisk size={14} className="text-zinc-400" />
            <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-widest">Venue:</span>
            <span className="font-medium">{venue.name}</span>
          </div>
        </div>
      )}
    </section>
  );
}
