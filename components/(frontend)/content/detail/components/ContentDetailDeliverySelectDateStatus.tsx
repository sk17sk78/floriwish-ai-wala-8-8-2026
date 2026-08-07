import { AlertTriangle, CheckCheck } from "lucide-react";
import { SelectDateStatus } from "../types/delivery";

export default function ContentDetailDeliverySelectDateStatus({
  status
}: {
  status: SelectDateStatus;
}) {
  if (!status) {
    return <div className="min-h-5" />;
  }

  return (
    <div className="px-1 pt-1 text-xs">
      {status === "not-selected" && (
        <div className="flex items-center justify-start gap-1.5 font-medium text-yellow-700">
          <AlertTriangle
            strokeWidth={1.5}
            height={16}
            width={16}
            className="fill-yellow-600 text-white stroke-white"
          />
          <span>Select date and time</span>
        </div>
      )}
      {status === "selected" && (
        <div className="flex items-center justify-start gap-1.5 text-emerald-700">
          <CheckCheck
            strokeWidth={1.5}
            height={16}
            width={16}
            className="text-emerald-600"
          />
          <span>Delivery slot selected</span>
        </div>
      )}
    </div>
  );
}
