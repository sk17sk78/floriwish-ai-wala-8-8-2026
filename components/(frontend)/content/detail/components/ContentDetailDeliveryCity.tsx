// components
import ContentDetailDeliverySelectCity from "./ContentDetailDeliverySelectCity";
import ContentDetailDeliverySelectCityStatus from "./ContentDetailDeliverySelectCityStatus";

// types
import { type SelectCityStatus } from "../types/delivery";

export default function ContentDetailDeliveryCity({
  status,
}: {
  status: SelectCityStatus;
}) {
  return (
    <div className="space-y-0.5 text-charcoal-3/95">
      <ContentDetailDeliverySelectCity />
      <ContentDetailDeliverySelectCityStatus status={status} />
    </div>
  );
}
