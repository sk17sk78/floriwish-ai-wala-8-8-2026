// libraries
import moment from "moment";
import { getEarliestDeliveryDate, formatEarliestDelivery } from "@/common/utils/delivery";

// types
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type ProcessingTimeDocument } from "@/common/types/documentation/presets/processingTime";

export const getEarliestDelivery = ({
  delivery
}: {
  delivery: ContentDeliveryDocument;
}) => {
  // Early return if delivery is not available
  if (!delivery) {
    return "Not Available";
  }

  const processingTime = ((delivery.processingTime as ProcessingTimeDocument)?.hours || 0);
  const slots = delivery.slots;

  const earliestDate = getEarliestDeliveryDate(processingTime, slots);
  const earliestDeliveryBy = formatEarliestDelivery(earliestDate, { showDelivery: true });

  return earliestDeliveryBy;
};
