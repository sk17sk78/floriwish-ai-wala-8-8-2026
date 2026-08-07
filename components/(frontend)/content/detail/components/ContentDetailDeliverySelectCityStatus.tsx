// icons
import { CheckCheck, CircleAlert, OctagonX } from "lucide-react";

// types
import { type SelectCityStatus } from "../types/delivery";

export default function ContentDetailDeliverySelectCityStatus({
  status
}: {
  status: SelectCityStatus;
}) {
  if (!status) {
    return <div className="min-h-5" />;
  }

  return (
    <div className="px-1 pt-1 text-xs">
      {status === "not-selected" && (
        <div className="flex items-center justify-start gap-1.5 font-medium text-yellow-700">
          <CircleAlert
            strokeWidth={1.5}
            height={16}
            width={16}
            className="fill-yellow-600 text-white stroke-white"
          />
          <span>City is required</span>
        </div>
      )}
      {status === "available" && (
        <div className="flex items-center justify-start gap-1.5 text-emerald-700">
          <CheckCheck
            strokeWidth={1.5}
            height={16}
            width={16}
            className="stroke-emerald-600"
          />
          <span>Delivery available in this city</span>
        </div>
      )}
      {status === "not-available" && (
        <div className="flex items-center justify-start gap-1.5 font-medium text-red-700">
          <OctagonX
            strokeWidth={1.5}
            height={16}
            width={16}
            className="stroke-red-500"
          />
          <span>We do not deliver here yet</span>
        </div>
      )}
    </div>
  );
}
