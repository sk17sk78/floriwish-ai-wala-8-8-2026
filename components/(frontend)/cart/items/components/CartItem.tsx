// constants
import { DOMAIN } from "@/common/constants/environmentVariables";
import { FRONTEND_LINKS } from "@/common/routes/frontend/staticLinks";

// utils
import { getCustomVariant } from "@/hooks/useOptimizedCart/utils/getCustomVariant";

// hooks
import { useState } from "react";
import { useAppStates } from "@/hooks/useAppState/useAppState";

// components
import CartItemAction from "./CartItemAction";
import CartItemAddons from "./CartItemAddons";
import CartItemAddonSuggestions from "./CartItemAddonSuggestions";
import CartItemConfirmDelete from "./CartItemConfirmDelete";
import CartItemCustomization from "./CartItemCustomization";
import CartItemDeliveryDateTime from "./CartItemDeliveryDateTime";
import CartItemImage from "./CartItemImage";
import CartItemInstruction from "./CartItemInstruction";
import CartItemMessage from "./CartItemMessage";
import CartItemName from "./CartItemName";
import CartItemPrice from "./CartItemPrice";

// types
import { type CartItemDocument } from "@/common/types/documentation/nestedDocuments/cartItem";
import { type CartItemAddonDocument } from "@/common/types/documentation/nestedDocuments/cartItemAddon";
import { type ContentDocument } from "@/common/types/documentation/contents/content";
import { type ContentCustomizationUploadTextDocument } from "@/common/types/documentation/nestedDocuments/contentCustomizationUploadText";
import { type ContentDeliveryDocument } from "@/common/types/documentation/nestedDocuments/contentDelivery";
import { type DeliveryTypeDocument } from "@/common/types/documentation/presets/deliveryType";
import { type EdibleDocument } from "@/common/types/documentation/nestedDocuments/edible";
import { type ImageDocument } from "@/common/types/documentation/media/image";
import { type TimeSlotDocument } from "@/common/types/documentation/nestedDocuments/timeSlot";

export default function CartItem({
  item,
  validationTriggered,
  onChangeItem,
  onDeleteItem
}: {
  item: CartItemDocument;
  validationTriggered: boolean;
  onChangeItem: (item: CartItemDocument) => void;
  onDeleteItem: (itemId: string) => void;
}) {
  // hooks
  const {
    location: {
      data: { selectedCity }
    }
  } = useAppStates();

  //   states
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);

  // variables
  const content = item.content as ContentDocument;

  const customVariant = item.customVariant
    ? getCustomVariant({ content, variantId: item.customVariant })
    : undefined;

  const name = customVariant?.name || content.name;

  const imageUrl =
    customVariant?.image?.url || (content.media.primary as ImageDocument)?.url || "";

  const path = `${DOMAIN}${content.type === "product" ? FRONTEND_LINKS.PRODUCT_PAGE : FRONTEND_LINKS.SERVICE_PAGE}/${content.slug}`;

  const cityPrice = content?.price?.cities?.find(
    ({ city }) => String(city) === String(selectedCity?._id)
  ) || content?.price?.base;

  const itemPrice = item.pricePerUnit * item.quantity;
  const itemMRP =
    ((customVariant?.price as any)?.mrp ||
      cityPrice?.mrp ||
      (item as any)?.mrp ||
      0) * item.quantity;

  // event handlers
  const handleChangeQuantity = (quantity: number) => {
    onChangeItem({
      ...item,
      quantity
    } as CartItemDocument);
  };

  const handleChangeDate = (date: Date) => {
    onChangeItem({
      ...item,
      delivery: {
        ...item.delivery,
        date: date.toISOString()
      }
    } as CartItemDocument);
  };

  const handleChangeTime = (
    type: DeliveryTypeDocument,
    slot: TimeSlotDocument
  ) => {
    onChangeItem({
      ...item,
      delivery: {
        ...item.delivery,
        type,
        slot
      }
    } as CartItemDocument);
  };

  const handleChangeAddons = (addons: CartItemAddonDocument[]) => {
    onChangeItem({
      ...item,
      addons
    } as CartItemDocument);
  };

  const handleChangeInstruction = (instruction: string) => {
    onChangeItem({
      ...item,
      instruction
    } as CartItemDocument);
  };

  const handleChangeUploadedText = (uploadedText?: import("@/common/types/documentation/nestedDocuments/cartItemUploadedText").CartItemUploadedTextDocument) => {
    onChangeItem({
      ...item,
      customization: {
        ...item.customization,
        uploadedText
      }
    } as CartItemDocument);
  };

  const handleDelete = () => {
    setIsDeleted(true);

    setTimeout(() => {
      onDeleteItem(String(item._id));
    }, 450);
  };

  return (
    <>
      <div className={`flex flex-col gap-2 sm:gap-3 transition-all duration-300 ${isDeleted ? "scale-0 opacity-0 h-0" : "opacity-100"}`}>
        
        {/* Product Card Section */}
        <section className="bg-white rounded-xl sm:rounded-2xl border border-charcoal-3/10 shadow-sm relative">
          <div className="relative p-3 sm:p-4 md:p-5">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 sm:gap-x-4 md:gap-x-6">
              {/* Product Image */}
              <div className="col-start-1 row-start-1">
                <CartItemImage
                  contentName={name}
                  contentPath={path}
                  imageUrl={imageUrl}
                  contentEdible={content.edible as EdibleDocument}
                />
              </div>

              {/* Product Info */}
              <div className="col-start-2 row-start-1 flex flex-col min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 sm:gap-0">
                  <div className="pr-6 sm:pr-8 w-full">
                    <CartItemName name={name} />
                    <div className="hidden sm:block mt-1">
                      <CartItemPrice price={itemPrice} mrp={itemMRP} />
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-1 sm:mt-0">
                    <div className="sm:hidden">
                      <CartItemPrice price={itemPrice} mrp={itemMRP} />
                    </div>

                    <CartItemAction
                      showDelete={showDelete}
                      quantity={item.quantity}
                      onChangeShowDelete={setShowDelete}
                      onChangeQuantity={handleChangeQuantity}
                    />
                  </div>
                </div>
              </div>
            </div>

            <CartItemAddons
              addons={item.addons!}
              onChangeAddons={handleChangeAddons}
            />

            {/* Delete Confirmation Overlay */}
            {showDelete && (
              <CartItemConfirmDelete
                onConfirm={handleDelete}
                onCancel={() => {
                  setShowDelete(false);
                }}
              />
            )}
          </div>
        </section>

        {/* Delivery Schedule Section */}
        <section className="bg-white rounded-xl sm:rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5">
            <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-600 mb-2 sm:mb-3 uppercase tracking-wide">
              Delivery Schedule
            </h3>
            <CartItemDeliveryDateTime
              isAvailableInAllIndia={
                content.availability!.availableAt === "all-india"
              }
              date={new Date(item.delivery.date)}
              deliveryType={item.delivery.type as DeliveryTypeDocument}
              timeSlot={item.delivery.slot as TimeSlotDocument}
              contentDelivery={content.delivery as ContentDeliveryDocument}
              validationTriggered={validationTriggered}
              onChangeDate={handleChangeDate}
              onChangeTime={handleChangeTime}
            />
            
            <CartItemCustomization customization={item.customization!} />
          </div>
        </section>

        {/* Message Area — only show if admin has enabled uploadText for this product */}
        {Boolean((content as any)?.customization?.uploadText?.label) && (
          <section className="bg-white rounded-xl sm:rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden">
            <CartItemMessage
              uploadedText={item.customization?.uploadedText as any}
              uploadTextConfig={(content as any)?.customization?.uploadText as ContentCustomizationUploadTextDocument}
              onChangeUploadedText={handleChangeUploadedText}
            />
          </section>
        )}

        {/* Instruction Area */}
        <section className="bg-white rounded-xl sm:rounded-2xl border border-charcoal-3/10 shadow-sm overflow-hidden">
          <CartItemInstruction
            instruction={item.instruction}
            onChangeInstruction={handleChangeInstruction}
          />
        </section>
      </div>
    </>
  );
}
